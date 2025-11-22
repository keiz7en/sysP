from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import datetime, timedelta
from django.core.files.storage import default_storage

from courses.models import Exam, ExamAttempt, Course
from students.models import StudentProfile


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_exam(request, exam_id):
    """Start an exam - creates or retrieves an ExamAttempt"""
    if request.user.user_type != 'student':
        return Response({'error': 'Student access only'}, status=status.HTTP_403_FORBIDDEN)

    try:
        student_profile = StudentProfile.objects.get(user=request.user)
        exam = get_object_or_404(Exam, id=exam_id, status='published')

        # Check if student is enrolled in the course
        from courses.models import CourseEnrollment
        enrollment = CourseEnrollment.objects.filter(
            student=student_profile,
            course=exam.course,
            status='active'
        ).first()

        if not enrollment:
            return Response({
                'error': 'You must be enrolled in this course to take this exam'
            }, status=status.HTTP_403_FORBIDDEN)

        # Check if exam is past due date
        if exam.due_date < timezone.now():
            return Response({
                'error': 'This exam is past its due date'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check for existing attempt
        existing_attempt = ExamAttempt.objects.filter(
            exam=exam,
            student=student_profile,
            submitted_at__isnull=True
        ).first()

        if existing_attempt:
            # Return existing attempt
            # Calculate remaining time
            time_elapsed = (timezone.now() - existing_attempt.started_at).total_seconds()
            time_remaining = max(0, (exam.duration_minutes * 60) - time_elapsed)

            return Response({
                'attempt_id': existing_attempt.id,
                'exam': {
                    'id': exam.id,
                    'title': exam.title,
                    'exam_type': exam.exam_type,
                    'duration_minutes': exam.duration_minutes,
                    'total_marks': exam.total_marks,
                    'questions_count': exam.questions_count,
                    'description': exam.description,
                    'questions_file_url': exam.questions_file.url if exam.questions_file else None,
                    'questions_filename': exam.questions_filename
                },
                'started_at': existing_attempt.started_at.isoformat(),
                'time_remaining_seconds': int(time_remaining),
                'is_resumed': True
            })

        # Create new attempt
        attempt = ExamAttempt.objects.create(
            exam=exam,
            student=student_profile,
            started_at=timezone.now()
        )

        return Response({
            'attempt_id': attempt.id,
            'exam': {
                'id': exam.id,
                'title': exam.title,
                'exam_type': exam.exam_type,
                'duration_minutes': exam.duration_minutes,
                'total_marks': exam.total_marks,
                'questions_count': exam.questions_count,
                'description': exam.description,
                'questions_file_url': exam.questions_file.url if exam.questions_file else None,
                'questions_filename': exam.questions_filename
            },
            'started_at': attempt.started_at.isoformat(),
            'time_remaining_seconds': exam.duration_minutes * 60,
            'is_resumed': False
        }, status=status.HTTP_201_CREATED)

    except StudentProfile.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_exam(request, attempt_id):
    """Submit exam with answers (text and/or file)"""
    if request.user.user_type != 'student':
        return Response({'error': 'Student access only'}, status=status.HTTP_403_FORBIDDEN)

    try:
        student_profile = StudentProfile.objects.get(user=request.user)
        attempt = get_object_or_404(ExamAttempt, id=attempt_id, student=student_profile)

        # Check if already submitted
        if attempt.submitted_at:
            return Response({
                'error': 'This exam has already been submitted'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Get submission data
        answer_text = request.data.get('answer_text', '')
        answer_file = request.FILES.get('answer_file')

        # Validate at least one submission method
        if not answer_text and not answer_file:
            return Response({
                'error': 'Please provide answers (either text or file upload)'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate file size (max 25MB)
        if answer_file:
            max_size = 25 * 1024 * 1024  # 25MB in bytes
            if answer_file.size > max_size:
                return Response({
                    'error': 'File size exceeds 25MB limit'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Validate file type
            allowed_extensions = ['.pdf', '.doc', '.docx', '.txt']
            file_ext = answer_file.name[answer_file.name.rfind('.'):].lower()
            if file_ext not in allowed_extensions:
                return Response({
                    'error': f'File type not allowed. Allowed types: {", ".join(allowed_extensions)}'
                }, status=status.HTTP_400_BAD_REQUEST)

        # Calculate time taken
        time_taken = timezone.now() - attempt.started_at

        # Update attempt
        attempt.answer_text = answer_text
        if answer_file:
            attempt.answer_file = answer_file
            attempt.answer_filename = answer_file.name

        attempt.submitted_at = timezone.now()
        attempt.time_taken = time_taken
        attempt.save()

        return Response({
            'success': True,
            'message': 'Exam submitted successfully! Your teacher will grade it soon.',
            'attempt_id': attempt.id,
            'submitted_at': attempt.submitted_at.isoformat(),
            'time_taken_minutes': int(time_taken.total_seconds() / 60)
        }, status=status.HTTP_200_OK)

    except StudentProfile.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        import traceback
        print(f"Error submitting exam: {traceback.format_exc()}")
        return Response({'error': f'Server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_attempt_status(request, attempt_id):
    """Get current status of an exam attempt"""
    if request.user.user_type != 'student':
        return Response({'error': 'Student access only'}, status=status.HTTP_403_FORBIDDEN)

    try:
        student_profile = StudentProfile.objects.get(user=request.user)
        attempt = get_object_or_404(ExamAttempt, id=attempt_id, student=student_profile)

        # Calculate time remaining
        if not attempt.submitted_at:
            time_elapsed = (timezone.now() - attempt.started_at).total_seconds()
            time_remaining = max(0, (attempt.exam.duration_minutes * 60) - time_elapsed)
        else:
            time_remaining = 0

        return Response({
            'attempt_id': attempt.id,
            'exam_id': attempt.exam.id,
            'started_at': attempt.started_at.isoformat(),
            'submitted_at': attempt.submitted_at.isoformat() if attempt.submitted_at else None,
            'time_remaining_seconds': int(time_remaining),
            'is_submitted': attempt.submitted_at is not None,
            'score': float(attempt.score) if attempt.score else None,
            'percentage': float(attempt.percentage) if attempt.percentage else None,
            'feedback': attempt.feedback if attempt.feedback else None
        })

    except StudentProfile.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
