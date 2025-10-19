from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.hashers import make_password
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from rest_framework import status, permissions, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import transaction
from django.contrib.auth import get_user_model
from django.db.models import Count, Avg, Sum, Q
from datetime import datetime, timedelta
import json
import random
import string

from .models import User, UserProfile, TeacherApproval
from .serializers import UserSerializer, UserProfileSerializer, LoginSerializer, UserUpdateSerializer
from students.models import StudentProfile, LearningProgress
from teachers.models import TeacherProfile
from courses.models import CourseEnrollment, Course
from assessments.models import Assessment, StudentAssessmentAttempt
from analytics.models import LearningAnalytics

User = get_user_model()


def generate_student_id():
    """Generate a 4-7 digit student ID"""
    length = random.randint(4, 7)
    return ''.join(random.choices(string.digits[1:], k=1)) + ''.join(random.choices(string.digits, k=length - 1))


def generate_employee_id():
    """Generate an employee ID for teachers"""
    return 'EMP' + ''.join(random.choices(string.digits, k=4))


def generate_username(first_name, last_name):
    """Generate a unique username"""
    base_username = f"{first_name.lower()}.{last_name.lower()}"
    username = base_username
    counter = 1

    while User.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1

    return username


def generate_temp_password(length=8):
    """Generate a temporary password"""
    characters = string.ascii_letters + string.digits
    return ''.join(random.choices(characters, k=length))


class RegisterView(APIView):
    """User registration with automatic profile creation and approval system"""
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            data = request.data
            user_type = data.get('user_type', 'student')

            # Validate required fields
            required_fields = ['username', 'email', 'password', 'first_name', 'last_name']
            for field in required_fields:
                if not data.get(field):
                    return Response(
                        {'error': f'{field} is required'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            # Check if username/email already exists
            if User.objects.filter(username=data['username']).exists():
                return Response(
                    {'error': 'Username already exists'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if User.objects.filter(email=data['email']).exists():
                return Response(
                    {'error': 'Email already registered'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            with transaction.atomic():
                # Set approval status based on user type
                # Students need approval from teachers/admins
                if user_type == 'student':
                    approval_status = 'pending'
                elif user_type == 'teacher':
                    approval_status = 'pending'
                else:  # admin
                    approval_status = 'approved'

                # Create user
                user = User.objects.create_user(
                    username=data['username'],
                    email=data['email'],
                    password=data['password'],
                    first_name=data['first_name'],
                    last_name=data['last_name'],
                    user_type=user_type,
                    phone_number=data.get('phone_number', ''),
                    date_of_birth=data.get('date_of_birth'),
                    address=data.get('address', ''),
                    approval_status=approval_status
                )

                # Create user profile
                UserProfile.objects.create(
                    user=user,
                    bio=data.get('bio', ''),
                    preferred_language=data.get('preferred_language', 'en')
                )

                # Create specific profile based on user type
                if user_type == 'student':
                    student_id = generate_student_id()
                    StudentProfile.objects.create(
                        user=user,
                        student_id=student_id,
                        grade_level=data.get('grade_level', 'Freshman'),
                        guardian_name=data.get('guardian_name', ''),
                        guardian_phone=data.get('guardian_phone', ''),
                        guardian_email=data.get('guardian_email', ''),
                        emergency_contact=data.get('emergency_contact', ''),
                        emergency_phone=data.get('emergency_phone', ''),
                        learning_style=data.get('learning_style', 'adaptive'),
                        current_gpa=0.0,
                        academic_status='pending'  # Student needs approval
                    )

                    message = 'Registration successful! Your student account is pending approval from teachers/administrators. You will receive an email notification once your account is approved and you can access the platform.'

                elif user_type == 'teacher':
                    # Teachers need approval
                    TeacherProfile.objects.create(
                        user=user,
                        employee_id=generate_employee_id(),
                        department=data.get('department', 'General'),
                        specialization=data.get('specialization', []),
                        experience_years=data.get('experience_years', 0),
                        is_approved=False,  # Requires admin approval
                        teaching_rating=0.0
                    )

                    # Create teacher approval request
                    TeacherApproval.objects.create(
                        teacher=user,
                        qualifications=data.get('qualifications', []),
                        department_preference=data.get('department', 'General'),
                        specialization=data.get('specialization', []),
                        reason_for_joining=data.get('reason_for_joining', '')
                    )

                    message = 'Registration successful! Your teacher account is pending approval from administrators. You will be notified once your application is reviewed.'

                # Don't create auth token for pending users
                token = None
                if approval_status == 'approved':
                    token, created = Token.objects.get_or_create(user=user)

                response_data = {
                    'message': message,
                    'user': UserSerializer(user).data,
                    'token': token.key if token else None,
                    'user_type': user_type,
                    'approval_status': approval_status,
                    'requires_approval': approval_status == 'pending'
                }

                return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': f'Registration failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LoginView(APIView):
    """Enhanced login with user type validation and approval checking"""
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            data = request.data
            username = data.get('username')
            password = data.get('password')
            user_type = data.get('user_type')

            if not all([username, password, user_type]):
                return Response(
                    {'error': 'Username, password, and user_type are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Try to authenticate with username first, then email
            user = authenticate(username=username, password=password)
            if not user:
                # Try email authentication
                try:
                    user_by_email = User.objects.get(email=username)
                    user = authenticate(username=user_by_email.username, password=password)
                except User.DoesNotExist:
                    pass

            if not user:
                return Response(
                    {'error': 'Invalid credentials. Please check your username/email and password.'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Check if user type matches
            if user.user_type != user_type:
                return Response(
                    {
                        'error': f'This account is not registered as a {user_type}. Please select the correct account type.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check approval status for all user types
            if user.approval_status == 'pending':
                if user_type == 'student':
                    return Response({
                        'error': 'Your student account is pending approval from teachers/administrators. Please wait for approval notification.',
                        'approval_status': 'pending',
                        'message': 'Account Pending Approval',
                        'details': 'Your registration has been received and is being reviewed by our academic staff. You will receive an email notification once your account is approved.'
                    }, status=status.HTTP_403_FORBIDDEN)
                elif user_type == 'teacher':
                    return Response({
                        'error': 'Your teacher account is pending approval from administrators. Please wait for approval notification.',
                        'approval_status': 'pending',
                        'message': 'Teacher Application Under Review',
                        'details': 'Your teacher application is being reviewed by administrators. This process typically takes 1-2 business days.'
                    }, status=status.HTTP_403_FORBIDDEN)

            elif user.approval_status == 'rejected':
                return Response({
                    'error': f'Your {user_type} account has been rejected. Please contact administrator for more information.',
                    'approval_status': 'rejected',
                    'rejection_reason': getattr(user, 'rejection_reason', 'Application did not meet requirements.'),
                    'contact_info': 'admin@eduai.com'
                }, status=status.HTTP_403_FORBIDDEN)

            # Additional checks for teachers
            if user_type == 'teacher':
                try:
                    teacher_profile = TeacherProfile.objects.get(user=user)
                    if not teacher_profile.is_approved:
                        return Response({
                            'error': 'Your teacher account is still pending final approval steps.'
                        }, status=status.HTTP_403_FORBIDDEN)
                except TeacherProfile.DoesNotExist:
                    return Response({
                        'error': 'Teacher profile not found. Please contact administrator.'
                    }, status=status.HTTP_400_BAD_REQUEST)

            # Create or get token for approved users
            token, created = Token.objects.get_or_create(user=user)

            # Prepare response data
            response_data = {
                'message': f'Welcome back, {user.first_name}!',
                'user': UserSerializer(user).data,
                'token': token.key,
                'user_type': user_type,
                'approval_status': user.approval_status
            }

            # Add specific profile data
            if user_type == 'student' and hasattr(user, 'student_profile'):
                response_data['student_id'] = user.student_profile.student_id
                response_data['current_gpa'] = float(user.student_profile.current_gpa)
                response_data['academic_status'] = user.student_profile.academic_status

            elif user_type == 'teacher' and hasattr(user, 'teacher_profile'):
                response_data['employee_id'] = user.teacher_profile.employee_id
                response_data['department'] = user.teacher_profile.department
                response_data['teaching_rating'] = float(user.teacher_profile.teaching_rating)

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': f'Login failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LogoutView(APIView):
    """Logout and invalidate token"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Delete the user's token
            Token.objects.filter(user=request.user).delete()
            logout(request)

            return Response(
                {'message': 'Logged out successfully'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': f'Logout failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_token(request):
    """Verify if token is valid and return user data"""
    try:
        token_key = request.data.get('token')
        if not token_key:
            return Response({
                'valid': False,
                'error': 'Token not provided'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = Token.objects.get(key=token_key)
            user = token.user

            if user.is_active and user.approval_status == 'approved':
                user_profile = UserSerializer(user).data
                return Response({
                    'valid': True,
                    'user': user_profile
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'valid': False,
                    'error': 'User account is inactive or not approved'
                }, status=status.HTTP_401_UNAUTHORIZED)

        except Token.DoesNotExist:
            return Response({
                'valid': False,
                'error': 'Invalid token'
            }, status=status.HTTP_401_UNAUTHORIZED)

    except Exception as e:
        return Response({
            'valid': False,
            'error': f'Token verification failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_data(request):
    """Get real dashboard data for authenticated user"""
    try:
        user = request.user

        # Check if user is approved
        if user.approval_status != 'approved':
            return Response({
                'error': 'Account not approved',
                'approval_status': user.approval_status
            }, status=status.HTTP_403_FORBIDDEN)

        dashboard_data = {
            'user': UserSerializer(user).data,
            'stats': {},
            'recent_activity': [],
            'notifications': [],
            'upcoming_tasks': []
        }

        # Add type-specific dashboard data with real information
        if user.user_type == 'student':
            try:
                student_profile = StudentProfile.objects.get(user=user)
                enrollments = CourseEnrollment.objects.filter(student=student_profile, status='active')

                # Get real course count
                courses_count = enrollments.count()

                # Get pending assignments
                pending_assessments = Assessment.objects.filter(
                    course__in=[enrollment.course for enrollment in enrollments],
                    available_until__gte=timezone.now()
                ).exclude(
                    attempts__student=student_profile,
                    attempts__status='submitted'
                ).count()

                # Calculate study hours from learning progress
                study_hours_data = LearningProgress.objects.filter(
                    student=student_profile
                ).aggregate(
                    total_hours=Sum('time_spent')
                )
                study_hours = 0
                if study_hours_data['total_hours']:
                    study_hours = int(study_hours_data['total_hours'].total_seconds() // 3600)

                dashboard_data['stats'] = {
                    'gpa': float(student_profile.current_gpa) if student_profile.current_gpa else 0.0,
                    'courses': courses_count,
                    'assignments': pending_assessments,
                    'study_hours': study_hours
                }

                # Get recent activities (real data)
                recent_attempts = StudentAssessmentAttempt.objects.filter(
                    student=student_profile
                ).select_related('assessment').order_by('-submitted_at')[:5]

                dashboard_data['recent_activity'] = [
                    {
                        'time': attempt.submitted_at.strftime('%d %b %Y') if attempt.submitted_at else 'In progress',
                        'activity': f"{'Completed' if attempt.status == 'submitted' else 'Started'} {attempt.assessment.title}",
                        'score': f'{attempt.percentage:.0f}%' if attempt.percentage else 'Pending'
                    }
                    for attempt in recent_attempts
                ]

                # Get upcoming tasks (real assignments)
                upcoming_assessments = Assessment.objects.filter(
                    course__in=[enrollment.course for enrollment in enrollments],
                    available_until__gte=timezone.now()
                ).exclude(
                    attempts__student=student_profile,
                    attempts__status='submitted'
                ).order_by('available_until')[:5]

                dashboard_data['upcoming_tasks'] = [
                    {
                        'task': assessment.title,
                        'due': assessment.available_until.strftime('%d %b %Y'),
                        'priority': 'high' if (assessment.available_until - timezone.now()).days <= 1 else
                        'medium' if (assessment.available_until - timezone.now()).days <= 3 else 'low',
                        'course': assessment.course.title
                    }
                    for assessment in upcoming_assessments
                ]

            except StudentProfile.DoesNotExist:
                dashboard_data['stats'] = {'gpa': 0.0, 'courses': 0, 'assignments': 0, 'study_hours': 0}

        elif user.user_type == 'teacher':
            try:
                teacher_profile = TeacherProfile.objects.get(user=user)
                teacher_courses = Course.objects.filter(instructor=teacher_profile)

                # Count students across all courses
                total_students = CourseEnrollment.objects.filter(
                    course__in=teacher_courses,
                    status='active'
                ).count()

                # Count assignments to grade
                assignments_to_grade = StudentAssessmentAttempt.objects.filter(
                    assessment__course__in=teacher_courses,
                    status='submitted'
                ).exclude(status='graded').count()

                dashboard_data['stats'] = {
                    'students': total_students,
                    'courses': teacher_courses.count(),
                    'assignments': assignments_to_grade,
                    'rating': float(teacher_profile.teaching_rating) if teacher_profile.teaching_rating else 0.0
                }

                # Get recent student activities in teacher's courses
                recent_attempts = StudentAssessmentAttempt.objects.filter(
                    assessment__course__in=teacher_courses
                ).select_related('student__user', 'assessment').order_by('-submitted_at')[:5]

                dashboard_data['recent_activity'] = [
                    {
                        'time': attempt.submitted_at.strftime('%d %b %Y') if attempt.submitted_at else 'In progress',
                        'activity': f"{attempt.student.user.get_full_name()} completed {attempt.assessment.title}",
                        'score': f'{attempt.percentage:.0f}%' if attempt.percentage else 'Pending'
                    }
                    for attempt in recent_attempts
                ]

                # Get upcoming deadlines in teacher's courses
                upcoming_assessments = Assessment.objects.filter(
                    course__in=teacher_courses,
                    available_until__gte=timezone.now()
                ).order_by('available_until')[:5]

                dashboard_data['upcoming_tasks'] = [
                    {
                        'task': f"Grade {assessment.title}",
                        'due': assessment.available_until.strftime('%d %b %Y'),
                        'priority': 'high' if (assessment.available_until - timezone.now()).days <= 1 else 'medium',
                        'course': assessment.course.title
                    }
                    for assessment in upcoming_assessments
                ]

            except TeacherProfile.DoesNotExist:
                dashboard_data['stats'] = {'students': 0, 'courses': 0, 'assignments': 0, 'rating': 0.0}

        elif user.user_type == 'admin':
            pending_teachers = User.objects.filter(
                user_type='teacher',
                approval_status='pending'
            ).count()

            pending_students = User.objects.filter(
                user_type='student',
                approval_status='pending'
            ).count()

            dashboard_data['stats'] = {
                'total_users': User.objects.count(),
                'pending_teachers': pending_teachers,
                'pending_students': pending_students,
                'students': User.objects.filter(user_type='student', approval_status='approved').count(),
                'teachers': User.objects.filter(user_type='teacher', approval_status='approved').count()
            }

            # Recent approval activities
            recent_approvals = User.objects.filter(
                approval_status='approved',
                approved_at__isnull=False
            ).order_by('-approved_at')[:5]

            dashboard_data['recent_activity'] = [
                {
                    'time': user_item.approved_at.strftime('%d %b %Y'),
                    'activity': f"Approved {user_item.user_type}: {user_item.get_full_name()}",
                    'score': 'Approved'
                }
                for user_item in recent_approvals
            ]

        return Response(dashboard_data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'error': f'Failed to load dashboard data: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Admin approval endpoints
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def pending_teachers(request):
    """Get list of teachers pending approval (Admin only)"""
    if request.user.user_type != 'admin':
        return Response({
            'error': 'Permission denied. Admin access required.'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        pending_teachers = User.objects.filter(
            user_type='teacher',
            approval_status='pending'
        ).select_related('teacher_approval', 'teacher_profile')

        teachers_data = []
        for teacher in pending_teachers:
            teacher_data = UserSerializer(teacher).data

            # Add approval request details
            if hasattr(teacher, 'teacher_approval'):
                approval = teacher.teacher_approval
                teacher_data.update({
                    'qualifications': approval.qualifications,
                    'department_preference': approval.department_preference,
                    'specialization': approval.specialization,
                    'reason_for_joining': approval.reason_for_joining,
                    'applied_at': approval.created_at
                })

            if hasattr(teacher, 'teacher_profile'):
                profile = teacher.teacher_profile
                teacher_data.update({
                    'experience_years': profile.experience_years,
                    'employee_id': profile.employee_id
                })

            teachers_data.append(teacher_data)

        return Response({
            'pending_teachers': teachers_data,
            'count': len(teachers_data)
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'error': f'Failed to fetch pending teachers: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def pending_students(request):
    """Get list of students pending approval (Admin/Teacher only)"""
    if request.user.user_type not in ['admin', 'teacher']:
        return Response({
            'error': 'Permission denied. Admin or teacher access required.'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        pending_students = User.objects.filter(
            user_type='student',
            approval_status='pending'
        ).select_related('student_profile')

        students_data = []
        for student in pending_students:
            student_data = UserSerializer(student).data

            if hasattr(student, 'student_profile'):
                profile = student.student_profile
                student_data.update({
                    'student_id': profile.student_id,
                    'grade_level': profile.grade_level,
                    'guardian_name': profile.guardian_name,
                    'guardian_email': profile.guardian_email,
                    'applied_at': student.date_joined
                })

            students_data.append(student_data)

        return Response({
            'pending_students': students_data,
            'count': len(students_data)
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'error': f'Failed to fetch pending students: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def approve_teacher(request, teacher_id):
    """Approve a teacher account (Admin only)"""
    if request.user.user_type != 'admin':
        return Response({
            'error': 'Permission denied. Admin access required.'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        teacher = User.objects.get(id=teacher_id, user_type='teacher')

        with transaction.atomic():
            # Update user approval status
            teacher.approval_status = 'approved'
            teacher.approved_by = request.user
            teacher.approved_at = timezone.now()
            teacher.save()

            # Update teacher profile
            teacher_profile = TeacherProfile.objects.get(user=teacher)
            teacher_profile.is_approved = True
            teacher_profile.approved_by = request.user
            teacher_profile.approved_at = timezone.now()
            teacher_profile.save()

            # Update approval request
            if hasattr(teacher, 'teacher_approval'):
                approval = teacher.teacher_approval
                approval.reviewed_by = request.user
                approval.reviewed_at = timezone.now()
                approval.admin_notes = request.data.get('admin_notes', '')
                approval.save()

        return Response({
            'message': f'Teacher {teacher.get_full_name()} has been approved successfully.',
            'teacher': UserSerializer(teacher).data
        }, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response({
            'error': 'Teacher not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to approve teacher: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def approve_student(request, student_id):
    """Approve a student account (Admin/Teacher)"""
    if request.user.user_type not in ['admin', 'teacher']:
        return Response({
            'error': 'Permission denied. Admin or teacher access required.'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        student = User.objects.get(id=student_id, user_type='student')

        with transaction.atomic():
            # Update user approval status
            student.approval_status = 'approved'
            student.approved_by = request.user
            student.approved_at = timezone.now()
            student.save()

            # Update student profile
            student_profile = StudentProfile.objects.get(user=student)
            student_profile.academic_status = 'active'
            student_profile.save()

        return Response({
            'message': f'Student {student.get_full_name()} has been approved successfully.',
            'student': UserSerializer(student).data
        }, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response({
            'error': 'Student not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to approve student: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reject_teacher(request, teacher_id):
    """Reject a teacher account (Admin only)"""
    if request.user.user_type != 'admin':
        return Response({
            'error': 'Permission denied. Admin access required.'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        teacher = User.objects.get(id=teacher_id, user_type='teacher')
        rejection_reason = request.data.get('rejection_reason', 'Application rejected by administrator.')

        with transaction.atomic():
            # Update user approval status
            teacher.approval_status = 'rejected'
            teacher.approved_by = request.user
            teacher.approved_at = timezone.now()
            teacher.rejection_reason = rejection_reason
            teacher.save()

            # Update approval request
            if hasattr(teacher, 'teacher_approval'):
                approval = teacher.teacher_approval
                approval.reviewed_by = request.user
                approval.reviewed_at = timezone.now()
                approval.admin_notes = request.data.get('admin_notes', rejection_reason)
                approval.save()

        return Response({
            'message': f'Teacher {teacher.get_full_name()} has been rejected.',
            'teacher': UserSerializer(teacher).data
        }, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response({
            'error': 'Teacher not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to reject teacher: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reject_student(request, student_id):
    """Reject a student account (Admin/Teacher)"""
    if request.user.user_type not in ['admin', 'teacher']:
        return Response({
            'error': 'Permission denied. Admin or teacher access required.'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        student = User.objects.get(id=student_id, user_type='student')
        rejection_reason = request.data.get('rejection_reason', 'Application rejected.')

        with transaction.atomic():
            # Update user approval status
            student.approval_status = 'rejected'
            student.approved_by = request.user
            student.approved_at = timezone.now()
            student.rejection_reason = rejection_reason
            student.save()

        return Response({
            'message': f'Student {student.get_full_name()} has been rejected.',
            'student': UserSerializer(student).data
        }, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response({
            'error': 'Student not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to reject student: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
