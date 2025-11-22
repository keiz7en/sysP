from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import datetime
import json

from courses.models import Course
from teachers.models import TeacherProfile
from students.models import StudentProfile


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def teacher_exams(request):
    """
    GET: List all exams for teacher's assigned courses
    POST: Create new exam for assigned course
    """
    if request.user.user_type != 'teacher':
        return Response({'error': 'Teacher access only'}, status=status.HTTP_403_FORBIDDEN)

    try:
        teacher_profile = TeacherProfile.objects.get(user=request.user)
    except TeacherProfile.DoesNotExist:
        return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        # Get all courses taught by this teacher (all statuses)
        teacher_courses = Course.objects.filter(instructor=teacher_profile)

        # Import Exam model
        try:
            from courses.models import Exam
        except ImportError:
            # Exam model doesn't exist yet, return empty list
            return Response([], status=status.HTTP_200_OK)

        # Get all exams for teacher's courses
        exams = Exam.objects.filter(course__in=teacher_courses).select_related('course')

        exams_data = []
        for exam in exams:
            # Get enrollment count
            from courses.models import CourseEnrollment
            enrolled_count = CourseEnrollment.objects.filter(
                course=exam.course,
                status='active'
            ).count()

            # Count attempts
            try:
                attempts_count = exam.attempts.count()
            except:
                attempts_count = 0

            # Handle due_date - could be datetime object or string
            due_date_str = exam.due_date
            if isinstance(due_date_str, datetime):
                due_date_str = due_date_str.isoformat()
            elif not isinstance(due_date_str, str):
                due_date_str = str(due_date_str)

            exams_data.append({
                'id': exam.id,
                'title': exam.title,
                'type': exam.exam_type,
                'course_id': exam.course.id,
                'course_title': exam.course.title,
                'course_code': exam.course.code,
                'total_marks': exam.total_marks,
                'duration': exam.duration_minutes,
                'due_date': due_date_str,
                'status': exam.status,
                'questions_count': exam.questions_count if hasattr(exam, 'questions_count') else 0,
                'students_attempted': attempts_count,
                'students_enrolled': enrolled_count
            })

        return Response(exams_data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        # Create new exam
        data = request.data

        # Validate required fields
        required_fields = ['title', 'course_code', 'type', 'total_marks', 'duration', 'due_date']
        for field in required_fields:
            if field not in data:
                return Response({
                    'error': f'Missing required field: {field}'
                }, status=status.HTTP_400_BAD_REQUEST)

        # Get course by code
        try:
            course = Course.objects.get(code=data['course_code'])
        except Course.DoesNotExist:
            return Response({
                'error': 'Course not found'
            }, status=status.HTTP_404_NOT_FOUND)

        # Verify teacher teaches this course (primary check)
        if course.instructor != teacher_profile:
            return Response({
                'error': 'You can only create exams for courses you teach'
            }, status=status.HTTP_403_FORBIDDEN)

        # Validate file upload if present
        questions_file = request.FILES.get('questions_file')
        if questions_file:
            # Check file size (max 25MB)
            max_size = 25 * 1024 * 1024  # 25MB in bytes
            if questions_file.size > max_size:
                return Response({
                    'error': 'File size exceeds 25MB limit'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Check file type
            allowed_extensions = ['.pdf', '.doc', '.docx', '.txt']
            file_ext = questions_file.name[questions_file.name.rfind('.'):].lower()
            if file_ext not in allowed_extensions:
                return Response({
                    'error': f'File type not allowed. Allowed types: PDF, DOC, DOCX, TXT'
                }, status=status.HTTP_400_BAD_REQUEST)

        # Optional: Check if teacher is approved for the subject
        # This is informational but doesn't block exam creation if teacher has the course
        from courses.models import TeacherApprovedSubject
        is_approved = TeacherApprovedSubject.objects.filter(
            teacher=teacher_profile,
            subject=course.subject
        ).exists()

        # Note: We allow exam creation if teacher has the course assigned
        # Subject approval is handled at course assignment level

        # Create exam using simple model structure
        try:
            from courses.models import Exam
        except ImportError:
            # Create a simple exam record
            exam_data = {
                'id': 1,  # This would be auto-generated
                'title': data['title'],
                'type': data['type'],
                'course_id': course.id,
                'course_title': course.title,
                'course_code': course.code,
                'total_marks': data['total_marks'],
                'duration': data['duration'],
                'due_date': data['due_date'],
                'status': 'draft',
                'questions_count': data.get('questions_count', 0),
                'students_attempted': 0,
                'students_enrolled': 0
            }

            return Response(exam_data, status=status.HTTP_201_CREATED)

        # Parse and make due_date timezone-aware
        due_date_str = data['due_date']
        try:
            # Try parsing ISO format datetime string
            due_date = datetime.fromisoformat(due_date_str.replace('Z', '+00:00'))
            # Make timezone-aware if naive
            if timezone.is_naive(due_date):
                due_date = timezone.make_aware(due_date)
        except:
            # If parsing fails, use as-is and let Django handle it
            due_date = due_date_str

        # Create exam
        try:
            exam = Exam.objects.create(
                course=course,
                title=data['title'],
                exam_type=data['type'],
                total_marks=data['total_marks'],
                duration_minutes=data['duration'],
                due_date=due_date,
                description=data.get('description', ''),
                questions_count=data.get('questions_count', 0),
                status='draft'
            )

            # Handle file upload if present
            if questions_file:
                exam.questions_file = questions_file
                exam.questions_filename = questions_file.name
                exam.save()

        except Exception as e:
            return Response({
                'error': f'Failed to create exam: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Get enrollment count
        from courses.models import CourseEnrollment
        enrolled_count = CourseEnrollment.objects.filter(
            course=course,
            status='active'
        ).count()

        # Convert due_date for response
        due_date_response = exam.due_date
        if isinstance(due_date_response, datetime):
            due_date_response = due_date_response.isoformat()
        elif not isinstance(due_date_response, str):
            due_date_response = str(due_date_response)

        return Response({
            'id': exam.id,
            'title': exam.title,
            'type': exam.exam_type,
            'course_id': course.id,
            'course_title': course.title,
            'course_code': course.code,
            'total_marks': exam.total_marks,
            'duration': exam.duration_minutes,
            'due_date': due_date_response,
            'status': exam.status,
            'questions_count': exam.questions_count,
            'students_attempted': 0,
            'students_enrolled': enrolled_count,
            'questions_file_url': exam.questions_file.url if exam.questions_file else None,
            'questions_filename': exam.questions_filename if exam.questions_filename else None
        }, status=status.HTTP_201_CREATED)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def exam_detail(request, exam_id):
    """
    PUT: Update exam
    DELETE: Delete exam
    """
    if request.user.user_type != 'teacher':
        return Response({'error': 'Teacher access only'}, status=status.HTTP_403_FORBIDDEN)

    try:
        teacher_profile = TeacherProfile.objects.get(user=request.user)
    except TeacherProfile.DoesNotExist:
        return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        from courses.models import Exam
        exam = Exam.objects.get(id=exam_id, course__instructor=teacher_profile)
    except:
        return Response({'error': 'Exam not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        # Update exam
        data = request.data
        if 'title' in data:
            exam.title = data['title']
        if 'description' in data:
            exam.description = data['description']
        if 'total_marks' in data:
            exam.total_marks = data['total_marks']
        if 'duration' in data:
            exam.duration_minutes = data['duration']
        if 'due_date' in data:
            # Parse and make timezone-aware
            due_date_str = data['due_date']
            try:
                due_date = datetime.fromisoformat(due_date_str.replace('Z', '+00:00'))
                if timezone.is_naive(due_date):
                    due_date = timezone.make_aware(due_date)
                exam.due_date = due_date
            except:
                exam.due_date = due_date_str
        if 'questions_count' in data:
            exam.questions_count = data['questions_count']

        exam.save()

        return Response({
            'success': True,
            'message': 'Exam updated successfully'
        }, status=status.HTTP_200_OK)

    elif request.method == 'DELETE':
        exam.delete()
        return Response({
            'success': True,
            'message': 'Exam deleted successfully'
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def publish_exam(request, exam_id):
    """Publish an exam"""
    if request.user.user_type != 'teacher':
        return Response({'error': 'Teacher access only'}, status=status.HTTP_403_FORBIDDEN)

    try:
        teacher_profile = TeacherProfile.objects.get(user=request.user)
    except TeacherProfile.DoesNotExist:
        return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        from courses.models import Exam
        exam = Exam.objects.get(id=exam_id, course__instructor=teacher_profile)
    except:
        return Response({'error': 'Exam not found'}, status=status.HTTP_404_NOT_FOUND)

    exam.status = 'published'
    exam.save()

    return Response({
        'success': True,
        'message': 'Exam published successfully'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_exam_submissions(request, exam_id):
    """Get all submissions for an exam"""
    if request.user.user_type != 'teacher':
        return Response({'error': 'Teacher access only'}, status=status.HTTP_403_FORBIDDEN)

    try:
        teacher_profile = TeacherProfile.objects.get(user=request.user)
        from courses.models import Exam, ExamAttempt

        exam = Exam.objects.get(id=exam_id, course__instructor=teacher_profile)

        # Get all submitted attempts
        submissions = ExamAttempt.objects.filter(
            exam=exam,
            submitted_at__isnull=False
        ).select_related('student__user').order_by('-submitted_at')

        submissions_data = []
        for attempt in submissions:
            submissions_data.append({
                'id': attempt.id,
                'student_name': attempt.student.user.get_full_name(),
                'student_id': attempt.student.student_id,
                'submitted_at': attempt.submitted_at.isoformat(),
                'time_taken_minutes': int(attempt.time_taken.total_seconds() / 60) if attempt.time_taken else 0,
                'answer_text': attempt.answer_text,
                'answer_file_url': attempt.answer_file.url if attempt.answer_file else None,
                'answer_filename': attempt.answer_filename,
                'score': float(attempt.score) if attempt.score else None,
                'percentage': float(attempt.percentage) if attempt.percentage else None,
                'feedback': attempt.feedback,
                'is_graded': attempt.graded_at is not None
            })

        # Return array directly for frontend compatibility
        return Response(submissions_data)

    except TeacherProfile.DoesNotExist:
        return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        import traceback
        print(f"Error getting submissions: {traceback.format_exc()}")
        return Response({'error': f'Server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def grade_submission(request, attempt_id):
    """Grade a student's exam submission"""
    if request.user.user_type != 'teacher':
        return Response({'error': 'Teacher access only'}, status=status.HTTP_403_FORBIDDEN)

    try:
        teacher_profile = TeacherProfile.objects.get(user=request.user)
        from courses.models import ExamAttempt

        attempt = ExamAttempt.objects.select_related('exam__course').get(id=attempt_id)

        # Verify teacher owns this exam
        if attempt.exam.course.instructor != teacher_profile:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Get grading data
        score = request.data.get('score')
        feedback = request.data.get('feedback', '')

        if score is None:
            return Response({'error': 'Score is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate score
        if float(score) < 0 or float(score) > attempt.exam.total_marks:
            return Response({
                'error': f'Score must be between 0 and {attempt.exam.total_marks}'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Calculate percentage
        percentage = (float(score) / attempt.exam.total_marks) * 100

        # Update attempt
        attempt.score = score
        attempt.percentage = percentage
        attempt.feedback = feedback
        attempt.graded_at = timezone.now()
        attempt.graded_by = teacher_profile
        attempt.save()

        return Response({
            'success': True,
            'message': 'Submission graded successfully',
            'score': float(score),
            'percentage': float(percentage)
        })

    except TeacherProfile.DoesNotExist:
        return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        import traceback
        print(f"Error grading submission: {traceback.format_exc()}")
        return Response({'error': f'Server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
