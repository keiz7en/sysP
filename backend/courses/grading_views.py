"""
Grading Management Views
Implements complete grading workflow from UML sequence diagrams:
- Assignment submission → Grading → Progress update → Final grade → Rating
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.utils import timezone
from django.db.models import Avg

from .models import (
    Assignment, AssignmentSubmission, CourseEnrollment,
    Grade, TeacherRating, Notification, ActivityLog
)
from .progress_service import (
    GradingService, ProgressTrackingService, TeacherRatingService
)
from .ai_feedback_service import AIFeedbackService
from .certificate_service import CertificateService
from .career_engine_service import CareerRecommendationEngine
from .notification_service import NotificationService

# Initialize services
ai_feedback_service = AIFeedbackService()
certificate_service = CertificateService()
career_engine = CareerRecommendationEngine()
notification_service = NotificationService()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_assignment(request):
    """
    Student submits assignment
    Implements Phase 1 of Grading Sequence
    """
    if request.user.user_type != 'student':
        return Response({
            'error': 'Only students can submit assignments'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        from students.models import StudentProfile
        student_profile = StudentProfile.objects.get(user=request.user)

        assignment_id = request.data.get('assignment_id')
        submission_text = request.data.get('submission_text', '')
        file_upload = request.FILES.get('file_upload')

        if not assignment_id:
            return Response({
                'error': 'assignment_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        assignment = Assignment.objects.get(id=assignment_id)

        # Check if submission is late
        is_late = timezone.now() > assignment.due_date

        # Create or update submission
        submission, created = AssignmentSubmission.objects.update_or_create(
            assignment=assignment,
            student=student_profile,
            defaults={
                'submission_text': submission_text,
                'file_upload': file_upload,
                'submitted_at': timezone.now(),
                'is_late': is_late
            }
        )

        # TODO: Notify teacher of new submission
        # NotificationService.notify_teacher_new_submission(...)

        return Response({
            'message': 'Assignment submitted successfully',
            'submission': {
                'id': submission.id,
                'assignment_title': assignment.title,
                'submitted_at': submission.submitted_at.isoformat(),
                'is_late': submission.is_late,
                'status': 'submitted'
            }
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    except Assignment.DoesNotExist:
        return Response({
            'error': 'Assignment not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to submit assignment: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pending_grading(request):
    """
    Teacher gets all pending submissions for grading
    Implements Phase 2 start of Grading Sequence
    """
    if request.user.user_type != 'teacher':
        return Response({
            'error': 'Only teachers can view pending submissions'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        from teachers.models import TeacherProfile
        teacher_profile = TeacherProfile.objects.get(user=request.user)

        # Get ungraded submissions for teacher's courses
        pending_submissions = AssignmentSubmission.objects.filter(
            assignment__course__instructor=teacher_profile,
            points_earned__isnull=True
        ).select_related(
            'assignment',
            'assignment__course',
            'student__user'
        ).order_by('submitted_at')

        submissions_data = []
        for submission in pending_submissions:
            submissions_data.append({
                'id': submission.id,
                'assignment_title': submission.assignment.title,
                'assignment_type': submission.assignment.assignment_type,
                'course_title': submission.assignment.course.title,
                'course_code': submission.assignment.course.code,
                'student_name': submission.student.user.get_full_name(),
                'student_id': submission.student.student_id,
                'submitted_at': submission.submitted_at.isoformat(),
                'is_late': submission.is_late,
                'max_points': float(submission.assignment.max_points),
                'submission_text': submission.submission_text[:200] if submission.submission_text else '',
                'has_file': bool(submission.file_upload)
            })

        return Response({
            'pending_submissions': submissions_data,
            'total_pending': len(submissions_data)
        })

    except Exception as e:
        return Response({
            'error': f'Failed to fetch pending submissions: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_submission_details(request, submission_id):
    """Get detailed information about a submission for grading"""
    try:
        submission = AssignmentSubmission.objects.select_related(
            'assignment',
            'assignment__course',
            'student__user',
            'graded_by__user'
        ).get(id=submission_id)

        # Verify access
        if request.user.user_type == 'teacher':
            from teachers.models import TeacherProfile
            teacher_profile = TeacherProfile.objects.get(user=request.user)
            if submission.assignment.course.instructor.id != teacher_profile.id:
                return Response({
                    'error': 'Access denied'
                }, status=status.HTTP_403_FORBIDDEN)

        submission_data = {
            'id': submission.id,
            'assignment': {
                'id': submission.assignment.id,
                'title': submission.assignment.title,
                'description': submission.assignment.description,
                'type': submission.assignment.assignment_type,
                'max_points': float(submission.assignment.max_points),
                'due_date': submission.assignment.due_date.isoformat()
            },
            'student': {
                'name': submission.student.user.get_full_name(),
                'student_id': submission.student.student_id,
                'email': submission.student.user.email
            },
            'submission_text': submission.submission_text,
            'file_upload': submission.file_upload.url if submission.file_upload else None,
            'submitted_at': submission.submitted_at.isoformat(),
            'is_late': submission.is_late,
            'points_earned': float(submission.points_earned) if submission.points_earned else None,
            'feedback': submission.feedback,
            'graded_at': submission.graded_at.isoformat() if submission.graded_at else None,
            'graded_by': submission.graded_by.user.get_full_name() if submission.graded_by else None,
            'percentage_score': submission.percentage_score
        }

        return Response(submission_data)

    except AssignmentSubmission.DoesNotExist:
        return Response({
            'error': 'Submission not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def grade_submission(request, submission_id):
    """
    Teacher grades a submission
    Implements Phase 2 completion + Phase 3 (Progress tracking)
    Now includes AI feedback generation
    """
    if request.user.user_type != 'teacher':
        return Response({
            'error': 'Only teachers can grade submissions'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        from teachers.models import TeacherProfile
        teacher_profile = TeacherProfile.objects.get(user=request.user)

        submission = AssignmentSubmission.objects.select_related(
            'assignment',
            'assignment__course',
            'student__user'
        ).get(id=submission_id)

        # Verify teacher owns this course
        if submission.assignment.course.instructor.id != teacher_profile.id:
            return Response({
                'error': 'You can only grade submissions for your own courses'
            }, status=status.HTTP_403_FORBIDDEN)

        points_earned = request.data.get('points_earned')
        feedback = request.data.get('feedback', '')

        if points_earned is None:
            return Response({
                'error': 'points_earned is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate points
        if float(points_earned) > float(submission.assignment.max_points):
            return Response({
                'error': f'Points cannot exceed maximum of {submission.assignment.max_points}'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Grade the submission using service
        submission = GradingService.grade_submission(
            submission_id=submission_id,
            points_earned=points_earned,
            feedback=feedback,
            graded_by_teacher=teacher_profile
        )

        # Trigger AI feedback generation asynchronously
        try:
            ai_feedback_service.generate_submission_feedback(submission_id)
        except Exception as e:
            # Log error but don't fail the request
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to generate AI feedback: {str(e)}")

        # Progress tracking happens automatically in the service

        return Response({
            'message': 'Submission graded successfully',
            'submission': {
                'id': submission.id,
                'student_name': submission.student.user.get_full_name(),
                'assignment_title': submission.assignment.title,
                'points_earned': float(submission.points_earned),
                'max_points': float(submission.assignment.max_points),
                'percentage_score': submission.percentage_score,
                'graded_at': submission.graded_at.isoformat(),
                'graded_by': teacher_profile.user.get_full_name()
            }
        })

    except AssignmentSubmission.DoesNotExist:
        return Response({
            'error': 'Submission not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except ValueError as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': f'Failed to grade submission: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pending_final_grades(request):
    """
    Teacher gets final grades ready for review and publishing
    Implements Phase 4-5 transition of Grading Sequence
    """
    if request.user.user_type != 'teacher':
        return Response({
            'error': 'Only teachers can view pending grades'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        from teachers.models import TeacherProfile
        teacher_profile = TeacherProfile.objects.get(user=request.user)

        # Get unpublished grades for teacher's courses
        pending_grades = Grade.objects.filter(
            teacher=teacher_profile,
            is_published=False
        ).select_related(
            'student__user',
            'course',
            'enrollment'
        ).order_by('-created_at')

        grades_data = []
        for grade in pending_grades:
            grades_data.append({
                'id': grade.id,
                'student_name': grade.student.user.get_full_name(),
                'student_id': grade.student.student_id,
                'course_title': grade.course.title,
                'course_code': grade.course.code,
                'final_score': float(grade.final_score),
                'letter_grade': grade.letter_grade,
                'grade_points': float(grade.grade_points),
                'breakdown': {
                    'assignments': float(grade.assignments_score),
                    'quizzes': float(grade.quizzes_score),
                    'exams': float(grade.exams_score),
                    'projects': float(grade.projects_score)
                },
                'created_at': grade.created_at.isoformat(),
                'enrollment_completion': float(grade.enrollment.completion_percentage)
            })

        return Response({
            'pending_grades': grades_data,
            'total_pending': len(grades_data)
        })

    except Exception as e:
        return Response({
            'error': f'Failed to fetch pending grades: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def publish_grade(request, grade_id):
    """
    Teacher publishes final grade
    Implements Phase 5 of Grading Sequence
    Now includes automatic certificate generation and career recommendations
    """
    if request.user.user_type != 'teacher':
        return Response({
            'error': 'Only teachers can publish grades'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        from teachers.models import TeacherProfile
        teacher_profile = TeacherProfile.objects.get(user=request.user)

        grade = Grade.objects.select_related(
            'student__user',
            'course',
            'enrollment',
            'teacher__user'
        ).get(id=grade_id)

        # Verify teacher owns this grade
        if grade.teacher.id != teacher_profile.id:
            return Response({
                'error': 'You can only publish your own grades'
            }, status=status.HTTP_403_FORBIDDEN)

        # Publish the grade (updates enrollment status automatically)
        grade.publish_grade()

        # Send notification to student
        notification_service.notify_grade_published_from_object(
            user_id=grade.student.user.id,
            grade=grade
        )

        # Log activity
        ActivityLog.objects.create(
            user=request.user,
            action_type='grade_publish',
            description=f'Grade published for {grade.student.user.get_full_name()} - {grade.course.code}',
            target_model='Grade',
            target_id=grade.id,
            metadata={
                'enrollment_id': str(grade.enrollment.id),
                'final_score': float(grade.final_score),
                'letter_grade': grade.letter_grade
            }
        )

        # Generate certificate if course is completed
        certificate = None
        try:
            certificate = certificate_service.generate_certificate(grade.enrollment.id)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to generate certificate: {str(e)}")

        # Generate career recommendations
        recommendations_count = 0
        try:
            recommendations = career_engine.generate_recommendations_after_completion(grade.enrollment.id)
            recommendations_count = len(recommendations)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to generate career recommendations: {str(e)}")

        response_data = {
            'message': 'Grade published successfully',
            'grade': {
                'id': grade.id,
                'student_name': grade.student.user.get_full_name(),
                'course_title': grade.course.title,
                'final_score': float(grade.final_score),
                'letter_grade': grade.letter_grade,
                'grade_points': float(grade.grade_points),
                'published_at': grade.published_at.isoformat(),
                'enrollment_status': grade.enrollment.status
            }
        }

        if certificate:
            response_data['certificate'] = {
                'id': certificate.certificate_id,
                'verification_code': certificate.verification_code,
                'generated': True
            }

        if recommendations_count > 0:
            response_data['career_recommendations'] = {
                'generated': True,
                'count': recommendations_count
            }

        return Response(response_data)

    except Grade.DoesNotExist:
        return Response({
            'error': 'Grade not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to publish grade: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_teacher_rating(request):
    """
    Student rates teacher after course completion
    Implements Phase 6 of Grading Sequence
    """
    if request.user.user_type != 'student':
        return Response({
            'error': 'Only students can rate teachers'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        from students.models import StudentProfile
        student_profile = StudentProfile.objects.get(user=request.user)

        enrollment_id = request.data.get('enrollment_id')
        rating = request.data.get('rating')
        feedback = request.data.get('feedback', '')

        if not enrollment_id or not rating:
            return Response({
                'error': 'enrollment_id and rating are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate rating
        if not (1 <= int(rating) <= 5):
            return Response({
                'error': 'Rating must be between 1 and 5'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Submit rating using service
        teacher_rating = TeacherRatingService.submit_rating(
            enrollment_id=enrollment_id,
            rating=int(rating),
            feedback=feedback
        )

        # Log activity
        ActivityLog.objects.create(
            user=request.user,
            action_type='rating_submission',
            description=f'Rating submitted for {teacher_rating.teacher.user.get_full_name()}',
            target_model='TeacherRating',
            target_id=teacher_rating.id,
            metadata={
                'rating': rating,
                'course': teacher_rating.course.code
            }
        )

        # Send notification to teacher
        notification_service.notify_teacher_rated_from_object(
            user_id=teacher_rating.teacher.user.id,
            rating=teacher_rating
        )

        return Response({
            'message': 'Thank you for rating your teacher!',
            'rating': {
                'id': teacher_rating.id,
                'teacher_name': teacher_rating.teacher.user.get_full_name(),
                'course_title': teacher_rating.course.title,
                'rating': teacher_rating.rating,
                'feedback': teacher_rating.feedback,
                'submitted_at': teacher_rating.submitted_at.isoformat()
            }
        }, status=status.HTTP_201_CREATED)

    except ValueError as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': f'Failed to submit rating: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_teacher_ratings(request):
    """Get all ratings for a teacher"""
    if request.user.user_type != 'teacher':
        return Response({
            'error': 'Only teachers can view their ratings'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        from teachers.models import TeacherProfile
        teacher_profile = TeacherProfile.objects.get(user=request.user)

        ratings = TeacherRating.objects.filter(
            teacher=teacher_profile,
            is_visible_to_teacher=True
        ).select_related(
            'student__user',
            'course'
        ).order_by('-submitted_at')

        ratings_data = []
        for rating in ratings:
            ratings_data.append({
                'id': rating.id,
                'student_name': rating.student.user.get_full_name() if not rating.student.user.is_anonymous else 'Anonymous',
                'course_title': rating.course.title,
                'course_code': rating.course.code,
                'rating': rating.rating,
                'feedback': rating.feedback,
                'submitted_at': rating.submitted_at.isoformat()
            })

        # Calculate statistics
        avg_rating = ratings.aggregate(avg=Avg('rating'))['avg'] or 0

        return Response({
            'ratings': ratings_data,
            'total_ratings': len(ratings_data),
            'average_rating': round(float(avg_rating), 2),
            'distribution': {
                '5_stars': ratings.filter(rating=5).count(),
                '4_stars': ratings.filter(rating=4).count(),
                '3_stars': ratings.filter(rating=3).count(),
                '2_stars': ratings.filter(rating=2).count(),
                '1_star': ratings.filter(rating=1).count()
            }
        })

    except Exception as e:
        return Response({
            'error': f'Failed to fetch ratings: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_grade_breakdown(request, enrollment_id):
    """Get detailed grade breakdown for an enrollment"""
    try:
        enrollment = CourseEnrollment.objects.select_related(
            'course',
            'student__user'
        ).get(id=enrollment_id)

        # Verify access
        if request.user.user_type == 'student':
            from students.models import StudentProfile
            student_profile = StudentProfile.objects.get(user=request.user)
            if enrollment.student.id != student_profile.id:
                return Response({
                    'error': 'Access denied'
                }, status=status.HTTP_403_FORBIDDEN)

        # Get all submissions
        submissions = AssignmentSubmission.objects.filter(
            assignment__course=enrollment.course,
            student=enrollment.student
        ).select_related('assignment').order_by('submitted_at')

        submissions_data = []
        for sub in submissions:
            submissions_data.append({
                'assignment_title': sub.assignment.title,
                'assignment_type': sub.assignment.assignment_type,
                'max_points': float(sub.assignment.max_points),
                'points_earned': float(sub.points_earned) if sub.points_earned else None,
                'percentage': sub.percentage_score if sub.points_earned else None,
                'submitted_at': sub.submitted_at.isoformat(),
                'graded_at': sub.graded_at.isoformat() if sub.graded_at else None,
                'is_late': sub.is_late
            })

        # Try to get final grade
        try:
            grade = Grade.objects.get(enrollment=enrollment)
            grade_data = {
                'final_score': float(grade.final_score),
                'letter_grade': grade.letter_grade,
                'grade_points': float(grade.grade_points),
                'breakdown': {
                    'assignments': float(grade.assignments_score),
                    'quizzes': float(grade.quizzes_score),
                    'exams': float(grade.exams_score),
                    'projects': float(grade.projects_score)
                },
                'is_published': grade.is_published,
                'published_at': grade.published_at.isoformat() if grade.published_at else None
            }
        except Grade.DoesNotExist:
            grade_data = None

        return Response({
            'enrollment': {
                'id': enrollment.id,
                'course_title': enrollment.course.title,
                'course_code': enrollment.course.code,
                'completion_percentage': float(enrollment.completion_percentage),
                'status': enrollment.status
            },
            'submissions': submissions_data,
            'total_submissions': len(submissions_data),
            'graded_submissions': len([s for s in submissions_data if s['points_earned'] is not None]),
            'final_grade': grade_data
        })

    except CourseEnrollment.DoesNotExist:
        return Response({
            'error': 'Enrollment not found'
        }, status=status.HTTP_404_NOT_FOUND)
