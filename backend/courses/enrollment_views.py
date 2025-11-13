"""
Enrollment Management Views
Implements complete enrollment approval workflow from UML sequence diagrams
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import Course, CourseEnrollment, LearningPath, GameificationProgress
from .progress_service import EnrollmentService
from students.models import StudentProfile
from teachers.models import TeacherProfile


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_enrollment(request):
    """
    Student requests enrollment in a course
    Implements Phase 1 of Enrollment Approval Sequence
    """
    if request.user.user_type != 'student':
        return Response({
            'error': 'Only students can request enrollment'
        }, status=status.HTTP_403_FORBIDDEN)

    course_id = request.data.get('course_id')

    if not course_id:
        return Response({
            'error': 'course_id is required'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        student_profile = StudentProfile.objects.get(user=request.user)
        course = Course.objects.get(id=course_id)

        # Validate course status
        if not course.is_approved_and_open():
            return Response({
                'error': 'Course is not accepting enrollments',
                'course_status': course.status,
                'is_open': course.is_open_for_enrollment
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check for existing enrollment
        existing = CourseEnrollment.objects.filter(
            student=student_profile,
            course=course
        ).first()

        if existing:
            return Response({
                'error': 'Already enrolled in this course',
                'enrollment_status': existing.status
            }, status=status.HTTP_400_BAD_REQUEST)

        # Create enrollment with pending status
        with transaction.atomic():
            enrollment = CourseEnrollment.objects.create(
                student=student_profile,
                course=course,
                status='pending',
                ai_features_unlocked=False,
                completion_percentage=0
            )

            # TODO: Send notification to teacher
            # NotificationService.notify_teacher_pending_enrollment(
            #     teacher_id=course.instructor.id,
            #     enrollment_id=enrollment.id,
            #     student_name=request.user.get_full_name()
            # )

        return Response({
            'message': 'Enrollment request submitted successfully',
            'enrollment': {
                'id': enrollment.id,
                'course_title': course.title,
                'course_code': course.code,
                'status': enrollment.status,
                'enrollment_date': enrollment.enrollment_date.isoformat(),
                'ai_features_unlocked': enrollment.ai_features_unlocked
            }
        }, status=status.HTTP_201_CREATED)

    except StudentProfile.DoesNotExist:
        return Response({
            'error': 'Student profile not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Course.DoesNotExist:
        return Response({
            'error': 'Course not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to submit enrollment request: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pending_enrollments(request):
    """
    Teacher views pending enrollment requests
    Implements Phase 2 of Enrollment Approval Sequence
    Returns array directly for frontend compatibility
    """
    if request.user.user_type != 'teacher':
        return Response({
            'error': 'Only teachers can view pending enrollments'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        teacher_profile = TeacherProfile.objects.get(user=request.user)

        # Get pending enrollments for teacher's courses
        pending_enrollments = CourseEnrollment.objects.filter(
            course__instructor=teacher_profile,
            status='pending'
        ).select_related(
            'student__user',
            'course'
        ).order_by('-enrollment_date')

        enrollments_data = []
        for enrollment in pending_enrollments:
            enrollments_data.append({
                'id': enrollment.id,
                'student_id': enrollment.student.student_id,
                'student_name': enrollment.student.user.get_full_name(),
                'student_email': enrollment.student.user.email,
                'course_title': enrollment.course.title,
                'course_code': enrollment.course.code,
                'enrollment_date': enrollment.enrollment_date.isoformat(),
                'grade_level': enrollment.student.grade_level,
                'current_gpa': float(enrollment.student.current_gpa)
            })

        # Return array directly for frontend .map() compatibility
        return Response(enrollments_data)

    except TeacherProfile.DoesNotExist:
        return Response({
            'error': 'Teacher profile not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def approve_enrollment(request, enrollment_id):
    """
    Teacher approves enrollment and unlocks AI features
    Implements Phase 2 completion of Enrollment Approval Sequence
    """
    if request.user.user_type != 'teacher':
        return Response({
            'error': 'Only teachers can approve enrollments'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        teacher_profile = TeacherProfile.objects.get(user=request.user)
        enrollment = CourseEnrollment.objects.select_related(
            'course',
            'student__user'
        ).get(id=enrollment_id)

        # Verify teacher owns this course
        if enrollment.course.instructor.id != teacher_profile.id:
            return Response({
                'error': 'You can only approve enrollments for your own courses'
            }, status=status.HTTP_403_FORBIDDEN)

        # Approve enrollment using service
        enrollment = EnrollmentService.approve_enrollment(enrollment_id, request.user)

        # Initialize AI features
        # Create learning path
        LearningPath.objects.create(
            enrollment=enrollment,
            path_data=[],
            difficulty_adjustments={},
            estimated_completion_time=timezone.timedelta(weeks=12)
        )

        # Create gamification progress
        GameificationProgress.objects.create(
            enrollment=enrollment,
            points=0,
            level=1,
            badges=[],
            achievements=[],
            streak_days=0
        )

        # TODO: Send notification to student
        # NotificationService.notify_student_enrollment_approved(
        #     student_id=enrollment.student.user.id,
        #     enrollment_id=enrollment.id,
        #     course_title=enrollment.course.title
        # )

        return Response({
            'message': 'Enrollment approved successfully',
            'enrollment': {
                'id': enrollment.id,
                'student_name': enrollment.student.user.get_full_name(),
                'course_title': enrollment.course.title,
                'status': enrollment.status,
                'ai_features_unlocked': enrollment.ai_features_unlocked,
                'ai_unlock_date': enrollment.ai_unlock_date.isoformat() if enrollment.ai_unlock_date else None,
                'approved_by': request.user.get_full_name(),
                'approved_at': enrollment.approved_at.isoformat() if enrollment.approved_at else None
            }
        })

    except TeacherProfile.DoesNotExist:
        return Response({
            'error': 'Teacher profile not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except CourseEnrollment.DoesNotExist:
        return Response({
            'error': 'Enrollment not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except ValueError as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': f'Failed to approve enrollment: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_enrollment(request, enrollment_id):
    """
    Teacher rejects enrollment request
    Implements alternative flow of Enrollment Approval Sequence
    """
    if request.user.user_type != 'teacher':
        return Response({
            'error': 'Only teachers can reject enrollments'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        teacher_profile = TeacherProfile.objects.get(user=request.user)
        enrollment = CourseEnrollment.objects.select_related(
            'course',
            'student__user'
        ).get(id=enrollment_id)

        # Verify teacher owns this course
        if enrollment.course.instructor.id != teacher_profile.id:
            return Response({
                'error': 'You can only reject enrollments for your own courses'
            }, status=status.HTTP_403_FORBIDDEN)

        reason = request.data.get('rejection_reason', 'No reason provided')

        # Reject enrollment using service
        enrollment = EnrollmentService.reject_enrollment(enrollment_id, reason)

        # TODO: Send notification to student
        # NotificationService.notify_student_enrollment_rejected(
        #     student_id=enrollment.student.user.id,
        #     course_title=enrollment.course.title,
        #     reason=reason
        # )

        return Response({
            'message': 'Enrollment rejected',
            'enrollment': {
                'id': enrollment.id,
                'student_name': enrollment.student.user.get_full_name(),
                'course_title': enrollment.course.title,
                'status': enrollment.status,
                'rejection_reason': enrollment.rejection_reason
            }
        })

    except TeacherProfile.DoesNotExist:
        return Response({
            'error': 'Teacher profile not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except CourseEnrollment.DoesNotExist:
        return Response({
            'error': 'Enrollment not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to reject enrollment: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_ai_access(request, enrollment_id):
    """
    Check if AI features are enabled for an enrollment
    Implements Phase 3 of Enrollment Approval Sequence
    """
    try:
        enrollment = CourseEnrollment.objects.select_related('course').get(id=enrollment_id)

        # Verify user owns this enrollment
        if request.user.user_type == 'student':
            if enrollment.student.user.id != request.user.id:
                return Response({
                    'error': 'Access denied'
                }, status=status.HTTP_403_FORBIDDEN)

        ai_enabled = enrollment.is_ai_enabled()

        return Response({
            'ai_access_granted': ai_enabled,
            'enrollment_status': enrollment.status,
            'ai_features_unlocked': enrollment.ai_features_unlocked,
            'course_ai_enabled': enrollment.course.ai_content_enabled,
            'access_control_rules': {
                'status_check': enrollment.status in ['active', 'approved'],
                'ai_unlocked': enrollment.ai_features_unlocked,
                'course_ai_enabled': enrollment.course.can_enable_ai_features()
            }
        })

    except CourseEnrollment.DoesNotExist:
        return Response({
            'error': 'Enrollment not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_enrollment_details(request, enrollment_id):
    """Get detailed information about an enrollment"""
    try:
        enrollment = CourseEnrollment.objects.select_related(
            'course',
            'course__instructor__user',
            'course__subject',
            'student__user'
        ).get(id=enrollment_id)

        # Verify access
        if request.user.user_type == 'student':
            if enrollment.student.user.id != request.user.id:
                return Response({
                    'error': 'Access denied'
                }, status=status.HTTP_403_FORBIDDEN)
        elif request.user.user_type == 'teacher':
            teacher_profile = TeacherProfile.objects.get(user=request.user)
            if enrollment.course.instructor.id != teacher_profile.id:
                return Response({
                    'error': 'Access denied'
                }, status=status.HTTP_403_FORBIDDEN)

        enrollment_data = {
            'id': enrollment.id,
            'student': {
                'id': enrollment.student.student_id,
                'name': enrollment.student.user.get_full_name(),
                'email': enrollment.student.user.email
            },
            'course': {
                'id': enrollment.course.id,
                'title': enrollment.course.title,
                'code': enrollment.course.code,
                'credits': enrollment.course.credits,
                'instructor_name': enrollment.course.instructor.user.get_full_name()
            },
            'enrollment_date': enrollment.enrollment_date.isoformat(),
            'status': enrollment.status,
            'completion_percentage': float(enrollment.completion_percentage),
            'final_score': float(enrollment.final_score) if enrollment.final_score else None,
            'grade': enrollment.grade,
            'ai_features_unlocked': enrollment.ai_features_unlocked,
            'ai_unlock_date': enrollment.ai_unlock_date.isoformat() if enrollment.ai_unlock_date else None,
            'approved_by': enrollment.approved_by.get_full_name() if enrollment.approved_by else None,
            'approved_at': enrollment.approved_at.isoformat() if enrollment.approved_at else None
        }

        return Response(enrollment_data)

    except CourseEnrollment.DoesNotExist:
        return Response({
            'error': 'Enrollment not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except TeacherProfile.DoesNotExist:
        return Response({
            'error': 'Teacher profile not found'
        }, status=status.HTTP_404_NOT_FOUND)
