"""
Teacher Grading and Progress Monitoring Views
Complete API for teachers to:
- View student submissions
- Grade assignments
- Monitor student progress
- Publish final grades
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q, Count, Avg, Sum
from django.utils import timezone
from decimal import Decimal

from courses.models import (
    Course, Assignment, AssignmentSubmission,
    CourseEnrollment, Grade
)
from courses.progress_service import (
    GradingService,
    ProgressTrackingService
)
from teachers.models import TeacherProfile


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_review_queue(request):
    """
    Get all pending submissions for teacher's courses
    Returns submissions that need grading
    """
    try:
        teacher = request.user.teacher_profile
    except:
        return Response({'error': 'Teacher profile not found'}, status=400)

    # Get all courses taught by this teacher
    courses = Course.objects.filter(instructor=teacher)

    # Get ungraded submissions
    pending_submissions = AssignmentSubmission.objects.filter(
        assignment__course__in=courses,
        points_earned__isnull=True  # Not yet graded
    ).select_related(
        'assignment',
        'assignment__course',
        'student',
        'student__user'
    ).order_by('-submitted_at')

    submissions_data = []
    for sub in pending_submissions:
        submissions_data.append({
            'id': sub.id,
            'assignment_id': sub.assignment.id,
            'assignment_title': sub.assignment.title,
            'assignment_type': sub.assignment.assignment_type,
            'assignment_max_points': float(sub.assignment.max_points),
            'course_code': sub.assignment.course.code,
            'course_title': sub.assignment.course.title,
            'student_id': sub.student.id,
            'student_name': sub.student.user.get_full_name(),
            'student_email': sub.student.user.email,
            'submission_text': sub.submission_text,
            'file_upload_url': sub.file_upload.url if sub.file_upload else None,
            'submitted_at': sub.submitted_at.isoformat(),
            'is_late': sub.is_late,
        })

    return Response({
        'total_pending': len(submissions_data),
        'submissions': submissions_data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def grade_submission(request):
    """
    Grade a student submission
    Body: {
        submission_id: int,
        points_earned: float,
        feedback: str
    }
    """
    try:
        teacher = request.user.teacher_profile
    except:
        return Response({'error': 'Teacher profile not found'}, status=400)

    submission_id = request.data.get('submission_id')
    points_earned = request.data.get('points_earned')
    feedback = request.data.get('feedback', '')

    if not submission_id or points_earned is None:
        return Response({'error': 'submission_id and points_earned are required'}, status=400)

    try:
        # Grade the submission using service
        submission = GradingService.grade_submission(
            submission_id=submission_id,
            points_earned=float(points_earned),
            feedback=feedback,
            graded_by_teacher=teacher
        )

        # Get updated progress
        enrollment = CourseEnrollment.objects.filter(
            student=submission.student,
            course=submission.assignment.course
        ).first()

        progress_percentage = 0
        if enrollment:
            progress_percentage = float(enrollment.completion_percentage)

        return Response({
            'success': True,
            'submission_id': submission.id,
            'points_earned': float(submission.points_earned),
            'percentage_score': submission.percentage_score,
            'graded_at': submission.graded_at.isoformat(),
            'student_progress': progress_percentage,
            'message': 'Submission graded successfully'
        })

    except ValueError as e:
        return Response({'error': str(e)}, status=404)
    except Exception as e:
        return Response({'error': f'Grading failed: {str(e)}'}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_course_submissions(request, course_id):
    """
    Get all submissions for a specific course
    Query params:
    - status: 'graded' | 'pending' | 'all'
    - student_id: filter by student
    """
    try:
        teacher = request.user.teacher_profile
    except:
        return Response({'error': 'Teacher profile not found'}, status=400)

    # Verify teacher teaches this course
    try:
        course = Course.objects.get(id=course_id, instructor=teacher)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found or access denied'}, status=403)

    # Get filter params
    status_filter = request.GET.get('status', 'all')
    student_id = request.GET.get('student_id')

    # Build query
    submissions_query = AssignmentSubmission.objects.filter(
        assignment__course=course
    ).select_related(
        'assignment',
        'student',
        'student__user',
        'graded_by',
        'graded_by__user'
    )

    # Apply filters
    if status_filter == 'graded':
        submissions_query = submissions_query.filter(points_earned__isnull=False)
    elif status_filter == 'pending':
        submissions_query = submissions_query.filter(points_earned__isnull=True)

    if student_id:
        submissions_query = submissions_query.filter(student_id=student_id)

    submissions_query = submissions_query.order_by('-submitted_at')

    # Format response
    submissions_data = []
    for sub in submissions_query:
        submissions_data.append({
            'id': sub.id,
            'assignment': {
                'id': sub.assignment.id,
                'title': sub.assignment.title,
                'type': sub.assignment.assignment_type,
                'max_points': float(sub.assignment.max_points),
                'due_date': sub.assignment.due_date.isoformat()
            },
            'student': {
                'id': sub.student.id,
                'name': sub.student.user.get_full_name(),
                'email': sub.student.user.email,
                'student_id': sub.student.student_id
            },
            'submission_text': sub.submission_text,
            'file_upload_url': sub.file_upload.url if sub.file_upload else None,
            'submitted_at': sub.submitted_at.isoformat(),
            'is_late': sub.is_late,
            'grading': {
                'points_earned': float(sub.points_earned) if sub.points_earned else None,
                'percentage': sub.percentage_score if sub.points_earned else None,
                'feedback': sub.feedback,
                'graded_at': sub.graded_at.isoformat() if sub.graded_at else None,
                'graded_by': sub.graded_by.user.get_full_name() if sub.graded_by else None
            }
        })

    return Response({
        'course': {
            'id': course.id,
            'code': course.code,
            'title': course.title
        },
        'total_submissions': len(submissions_data),
        'submissions': submissions_data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_student_progress(request, course_id, student_id):
    """
    Get detailed progress for a specific student in a course
    """
    try:
        teacher = request.user.teacher_profile
    except:
        return Response({'error': 'Teacher profile not found'}, status=400)

    # Verify access
    try:
        course = Course.objects.get(id=course_id, instructor=teacher)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found or access denied'}, status=403)

    # Get enrollment
    try:
        enrollment = CourseEnrollment.objects.select_related(
            'student',
            'student__user'
        ).get(course=course, student_id=student_id)
    except CourseEnrollment.DoesNotExist:
        return Response({'error': 'Student not enrolled in this course'}, status=404)

    # Get all assignments for course
    assignments = Assignment.objects.filter(course=course, is_published=True)
    total_assignments = assignments.count()

    # Get student's submissions
    submissions = AssignmentSubmission.objects.filter(
        assignment__course=course,
        student_id=student_id
    ).select_related('assignment')

    completed_assignments = submissions.filter(points_earned__isnull=False).count()
    pending_assignments = total_assignments - completed_assignments

    # Calculate scores by type
    assignment_breakdown = {
        'homework': {'completed': 0, 'total': 0, 'avg_score': 0},
        'quiz': {'completed': 0, 'total': 0, 'avg_score': 0},
        'exam': {'completed': 0, 'total': 0, 'avg_score': 0},
        'project': {'completed': 0, 'total': 0, 'avg_score': 0}
    }

    for assignment in assignments:
        atype = assignment.assignment_type
        if atype in assignment_breakdown:
            assignment_breakdown[atype]['total'] += 1

            # Check if submitted and graded
            sub = submissions.filter(assignment=assignment, points_earned__isnull=False).first()
            if sub:
                assignment_breakdown[atype]['completed'] += 1
                if assignment_breakdown[atype]['avg_score'] == 0:
                    assignment_breakdown[atype]['avg_score'] = sub.percentage_score
                else:
                    assignment_breakdown[atype]['avg_score'] = (
                                                                       assignment_breakdown[atype][
                                                                           'avg_score'] + sub.percentage_score
                                                               ) / 2

    # Get recent submissions
    recent_submissions = submissions.order_by('-submitted_at')[:5]
    recent_submissions_data = [{
        'assignment_title': sub.assignment.title,
        'submitted_at': sub.submitted_at.isoformat(),
        'points_earned': float(sub.points_earned) if sub.points_earned else None,
        'percentage': sub.percentage_score if sub.points_earned else None,
        'is_graded': sub.points_earned is not None
    } for sub in recent_submissions]

    return Response({
        'student': {
            'id': enrollment.student.id,
            'name': enrollment.student.user.get_full_name(),
            'email': enrollment.student.user.email,
            'student_id': enrollment.student.student_id
        },
        'enrollment': {
            'status': enrollment.status,
            'enrolled_date': enrollment.enrollment_date.isoformat(),
            'completion_percentage': float(enrollment.completion_percentage),
            'ai_features_unlocked': enrollment.ai_features_unlocked
        },
        'progress': {
            'total_assignments': total_assignments,
            'completed_assignments': completed_assignments,
            'pending_assignments': pending_assignments,
            'completion_rate': (completed_assignments / total_assignments * 100) if total_assignments > 0 else 0
        },
        'breakdown_by_type': assignment_breakdown,
        'recent_submissions': recent_submissions_data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def publish_final_grade(request, enrollment_id):
    """
    Publish final grade for a completed enrollment
    Body: {
        remarks: str (optional)
    }
    """
    try:
        teacher = request.user.teacher_profile
    except:
        return Response({'error': 'Teacher profile not found'}, status=400)

    try:
        enrollment = CourseEnrollment.objects.select_related(
            'course',
            'student',
            'student__user'
        ).get(id=enrollment_id, course__instructor=teacher)
    except CourseEnrollment.DoesNotExist:
        return Response({'error': 'Enrollment not found or access denied'}, status=403)

    # Check if enrollment is ready for grading (100% complete)
    if enrollment.completion_percentage < 100:
        return Response({
            'error': f'Cannot publish grade. Student has only completed {enrollment.completion_percentage}% of assignments'
        }, status=400)

    # Calculate and publish grade
    try:
        grade_data = GradingService.calculate_final_grade(enrollment)

        # Create or update grade
        grade, created = Grade.objects.update_or_create(
            enrollment=enrollment,
            course=enrollment.course,
            student=enrollment.student,
            defaults={
                'teacher': teacher,
                'final_score': grade_data['final_score'],
                'letter_grade': grade_data['letter_grade'],
                'grade_points': grade_data['grade_points'],
                'assignments_score': grade_data['assignments_score'],
                'quizzes_score': grade_data['quizzes_score'],
                'exams_score': grade_data['exams_score'],
                'projects_score': grade_data['projects_score'],
                'remarks': request.data.get('remarks', '')
            }
        )

        # Publish it
        grade.publish_grade()

        return Response({
            'success': True,
            'message': 'Final grade published successfully',
            'grade': {
                'final_score': float(grade.final_score),
                'letter_grade': grade.letter_grade,
                'grade_points': float(grade.grade_points),
                'published_at': grade.published_at.isoformat(),
                'breakdown': {
                    'assignments': float(grade.assignments_score),
                    'quizzes': float(grade.quizzes_score),
                    'exams': float(grade.exams_score),
                    'projects': float(grade.projects_score)
                }
            },
            'student': {
                'name': enrollment.student.user.get_full_name(),
                'email': enrollment.student.user.email
            }
        })

    except Exception as e:
        return Response({'error': f'Failed to publish grade: {str(e)}'}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_course_analytics(request, course_id):
    """
    Get analytics for a course including:
    - Overall completion rates
    - Average scores
    - Student performance distribution
    """
    try:
        teacher = request.user.teacher_profile
    except:
        return Response({'error': 'Teacher profile not found'}, status=400)

    try:
        course = Course.objects.get(id=course_id, instructor=teacher)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found or access denied'}, status=403)

    # Get all enrollments
    enrollments = CourseEnrollment.objects.filter(course=course, status='active')
    total_students = enrollments.count()

    if total_students == 0:
        return Response({
            'course': {'id': course.id, 'code': course.code, 'title': course.title},
            'total_students': 0,
            'message': 'No active enrollments'
        })

    # Calculate stats
    avg_completion = enrollments.aggregate(Avg('completion_percentage'))['completion_percentage__avg'] or 0

    # Completion distribution
    completion_ranges = {
        '0-25%': enrollments.filter(completion_percentage__lt=25).count(),
        '25-50%': enrollments.filter(completion_percentage__gte=25, completion_percentage__lt=50).count(),
        '50-75%': enrollments.filter(completion_percentage__gte=50, completion_percentage__lt=75).count(),
        '75-100%': enrollments.filter(completion_percentage__gte=75).count()
    }

    # Get graded submissions stats
    all_submissions = AssignmentSubmission.objects.filter(
        assignment__course=course,
        points_earned__isnull=False
    )

    if all_submissions.exists():
        avg_score = sum(sub.percentage_score for sub in all_submissions) / all_submissions.count()
    else:
        avg_score = 0

    # Get assignment completion rates
    assignments = Assignment.objects.filter(course=course, is_published=True)
    assignment_stats = []
    for assignment in assignments:
        total_submissions = AssignmentSubmission.objects.filter(assignment=assignment).count()
        graded_submissions = AssignmentSubmission.objects.filter(
            assignment=assignment,
            points_earned__isnull=False
        ).count()

        assignment_stats.append({
            'title': assignment.title,
            'type': assignment.assignment_type,
            'due_date': assignment.due_date.isoformat(),
            'submission_rate': (total_submissions / total_students * 100) if total_students > 0 else 0,
            'grading_rate': (graded_submissions / total_submissions * 100) if total_submissions > 0 else 0
        })

    return Response({
        'course': {
            'id': course.id,
            'code': course.code,
            'title': course.title
        },
        'total_students': total_students,
        'average_completion': float(avg_completion),
        'average_score': avg_score,
        'completion_distribution': completion_ranges,
        'assignment_statistics': assignment_stats
    })
