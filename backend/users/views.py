from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.hashers import make_password, check_password
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

# Import other models properly
try:
    from students.models import StudentProfile, LearningProgress
except ImportError:
    StudentProfile = None
    LearningProgress = None

try:
    from teachers.models import TeacherProfile
except ImportError:
    TeacherProfile = None

try:
    from courses.models import CourseEnrollment, Course
except ImportError:
    CourseEnrollment = None
    Course = None

try:
    from assessments.models import Assessment, StudentAssessmentAttempt
except ImportError:
    Assessment = None
    StudentAssessmentAttempt = None

try:
    from analytics.models import LearningAnalytics
except ImportError:
    LearningAnalytics = None

User = get_user_model()


def generate_student_id():
    """Generate a unique student ID"""
    import time
    while True:
        timestamp = str(int(time.time() * 1000))  # Use milliseconds for more uniqueness
        student_id = f"S{timestamp[-6:]}"

        # Check if this ID already exists
        try:
            from students.models import StudentProfile
            if not StudentProfile.objects.filter(student_id=student_id).exists():
                return student_id
        except ImportError:
            return student_id

        # If ID exists, wait a moment and try again
        time.sleep(0.001)


def generate_employee_id():
    """Generate a unique employee ID for teachers"""
    import time
    while True:
        timestamp = str(int(time.time() * 1000))  # Use milliseconds for more uniqueness
        employee_id = f"EMP{timestamp[-4:]}"

        # Check if this ID already exists
        try:
            from teachers.models import TeacherProfile
            if not TeacherProfile.objects.filter(employee_id=employee_id).exists():
                return employee_id
        except ImportError:
            return employee_id

        # If ID exists, wait a moment and try again
        time.sleep(0.001)


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


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register new user with role-based creation"""
    try:
        username = request.data.get('username')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        email = request.data.get('email')
        password = request.data.get('password')
        user_type = request.data.get('user_type')
        phone_number = request.data.get('phone_number', '')
        address = request.data.get('address', '')

        # Block admin registration via API
        if user_type == 'admin':
            return Response({
                'error': 'Admin registration is not allowed through the API. Contact system administrator.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate required fields
        if not all([username, first_name, last_name, email, password, user_type]):
            return Response({
                'error': 'All required fields must be provided'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate user_type
        if user_type not in ['student', 'teacher']:
            return Response({
                'error': 'Invalid user type. Must be student or teacher.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if username already exists
        if User.objects.filter(username=username).exists():
            return Response({
                'error': 'Username already exists'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if email already exists
        if User.objects.filter(email=email).exists():
            return Response({
                'error': 'Email already exists'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Set approval status based on user type
        # For demo purposes, let's approve teachers directly to avoid the approval issue
        if user_type == 'teacher':
            approval_status = 'approved'  # Changed from 'pending' to 'approved' for demo
        else:
            approval_status = 'pending'  # Students still need approval

        # Create user
        user = User.objects.create_user(
            username=username,
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=password,
            user_type=user_type,
            phone_number=phone_number,
            address=address,
            approval_status=approval_status  # Set the approval status explicitly
        )

        # If approved, set the approved timestamp
        if approval_status == 'approved':
            user.approved_at = timezone.now()
            user.save()

        # Create profile based on user type
        if user_type == 'student':
            try:
                from students.models import StudentProfile
                StudentProfile.objects.create(
                    user=user,
                    student_id=generate_student_id(),
                    grade_level='Freshman',
                    learning_style='adaptive',
                    academic_status='pending' if approval_status == 'pending' else 'active'
                )
            except ImportError:
                pass
        elif user_type == 'teacher':
            try:
                from teachers.models import TeacherProfile
                TeacherProfile.objects.create(
                    user=user,
                    employee_id=generate_employee_id(),
                    department='General',
                    specialization=['Teaching'],
                    experience_years=0,
                    is_approved=True if approval_status == 'approved' else False,  # Match user approval
                    approved_at=timezone.now() if approval_status == 'approved' else None
                )
            except ImportError:
                pass

        # Generate token only for approved users
        if approval_status == 'approved':
            token, created = Token.objects.get_or_create(user=user)
            token_key = token.key
        else:
            token_key = None

        # Prepare response based on approval status
        response_data = {
            'user': {
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'user_type': user.user_type,
                'name': f"{user.first_name} {user.last_name}",
                'approval_status': approval_status
            },
            'approval_status': approval_status
        }

        if approval_status == 'approved':
            response_data['token'] = token_key
            response_data['message'] = f'{user_type.title()} registered and approved successfully! Welcome to EduAI!'
        else:
            response_data['message'] = f'{user_type.title()} registered successfully! Your account is pending approval.'

        return Response(response_data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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

            # Check if user type matches - STRICT VALIDATION
            if user.user_type != user_type:
                return Response({
                    'error': f'Access denied. This account is registered as a {user.user_type}, not as a {user_type}. Please select the correct account type or contact administrator.'
                }, status=status.HTTP_403_FORBIDDEN)

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
                    # If user is approved but profile is not, fix it automatically
                    if user.approval_status == 'approved' and not teacher_profile.is_approved:
                        teacher_profile.is_approved = True
                        teacher_profile.approved_at = timezone.now()
                        teacher_profile.save()
                        print(f"Auto-fixed teacher profile approval for {user.username}")

                except TeacherProfile.DoesNotExist:
                    # If no teacher profile exists, create one for approved teachers
                    if user.approval_status == 'approved':
                        import random
                        employee_id = f'EMP{random.randint(1000, 9999)}'
                        while TeacherProfile.objects.filter(employee_id=employee_id).exists():
                            employee_id = f'EMP{random.randint(1000, 9999)}'

                        TeacherProfile.objects.create(
                            user=user,
                            employee_id=employee_id,
                            department='General',
                            specialization=['Teaching'],
                            experience_years=1,
                            is_approved=True,
                            approved_at=timezone.now()
                        )
                        print(f"Auto-created teacher profile for {user.username}")
                    else:
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
                if Assessment:
                    pending_assessments = Assessment.objects.filter(
                        course__in=[enrollment.course for enrollment in enrollments],
                        available_until__gte=timezone.now()
                    ).exclude(
                        attempts__student=student_profile,
                        attempts__status='submitted'
                    ).count()
                else:
                    pending_assessments = 0

                # Calculate study hours from learning progress
                if LearningProgress:
                    study_hours_data = LearningProgress.objects.filter(
                        student=student_profile
                    ).aggregate(
                        total_hours=Sum('time_spent')
                    )
                    study_hours = 0
                    if study_hours_data['total_hours']:
                        study_hours = int(study_hours_data['total_hours'].total_seconds() // 3600)
                else:
                    study_hours = 0

                dashboard_data['stats'] = {
                    'gpa': float(student_profile.current_gpa) if student_profile.current_gpa else 0.0,
                    'courses': courses_count,
                    'assignments': pending_assessments,
                    'study_hours': study_hours
                }

                # Get recent activities (real data)
                if StudentAssessmentAttempt:
                    recent_attempts = StudentAssessmentAttempt.objects.filter(
                        student=student_profile
                    ).select_related('assessment').order_by('-submitted_at')[:5]

                    dashboard_data['recent_activity'] = [
                        {
                            'time': attempt.submitted_at.strftime(
                                '%d %b %Y') if attempt.submitted_at else 'In progress',
                            'activity': f"{'Completed' if attempt.status == 'submitted' else 'Started'} {attempt.assessment.title}",
                            'score': f'{attempt.percentage:.0f}%' if attempt.percentage else 'Pending'
                        }
                        for attempt in recent_attempts
                    ]
                else:
                    dashboard_data['recent_activity'] = []

                # Get upcoming tasks (real assignments)
                if Assessment:
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
                else:
                    dashboard_data['upcoming_tasks'] = []

            except StudentProfile.DoesNotExist:
                dashboard_data['stats'] = {'gpa': 0.0, 'courses': 0, 'assignments': 0, 'study_hours': 0}

        elif user.user_type == 'teacher':
            try:
                teacher_profile = TeacherProfile.objects.get(user=user)
                teacher_courses = Course.objects.filter(instructor=teacher_profile)

                # Count students across all courses
                if CourseEnrollment:
                    total_students = CourseEnrollment.objects.filter(
                        course__in=teacher_courses,
                        status='active'
                    ).count()
                else:
                    total_students = 0

                # Count assignments to grade
                if StudentAssessmentAttempt:
                    assignments_to_grade = StudentAssessmentAttempt.objects.filter(
                        assessment__course__in=teacher_courses,
                        status='submitted'
                    ).exclude(status='graded').count()
                else:
                    assignments_to_grade = 0

                dashboard_data['stats'] = {
                    'students': total_students,
                    'courses': teacher_courses.count(),
                    'assignments': assignments_to_grade,
                    'rating': float(teacher_profile.teaching_rating) if teacher_profile.teaching_rating else 0.0
                }

                # Get recent student activities in teacher's courses
                if StudentAssessmentAttempt:
                    recent_attempts = StudentAssessmentAttempt.objects.filter(
                        assessment__course__in=teacher_courses
                    ).select_related('student__user', 'assessment').order_by('-submitted_at')[:5]

                    dashboard_data['recent_activity'] = [
                        {
                            'time': attempt.submitted_at.strftime(
                                '%d %b %Y') if attempt.submitted_at else 'In progress',
                            'activity': f"{attempt.student.user.get_full_name()} completed {attempt.assessment.title}",
                            'score': f'{attempt.percentage:.0f}%' if attempt.percentage else 'Pending'
                        }
                        for attempt in recent_attempts
                    ]
                else:
                    dashboard_data['recent_activity'] = []

                # Get upcoming deadlines in teacher's courses
                if Assessment:
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
                else:
                    dashboard_data['upcoming_tasks'] = []

            except TeacherProfile.DoesNotExist:
                dashboard_data['stats'] = {'students': 0, 'courses': 0, 'assignments': 0, 'rating': 0.0}

        elif user.user_type == 'admin':
            if User:
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
                if User:
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
                else:
                    dashboard_data['recent_activity'] = []

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
            if hasattr(teacher, 'teacher_profile'):
                teacher_profile = teacher.teacher_profile
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
            if hasattr(student, 'student_profile'):
                student_profile = student.student_profile
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


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def all_users(request):
    """Get all system users with complete profile information (Admin only)"""
    if request.user.user_type != 'admin':
        return Response({
            'error': 'Permission denied. Admin access required.'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        users = User.objects.all().select_related('student_profile', 'teacher_profile').order_by('-date_joined')
        users_data = []

        for user in users:
            user_data = UserSerializer(user).data

            # Add profile-specific information
            if user.user_type == 'student':
                try:
                    profile = user.student_profile
                    user_data.update({
                        'student_id': profile.student_id,
                        'current_gpa': float(profile.current_gpa) if profile.current_gpa else 0.0,
                        'grade_level': profile.grade_level or 'Not specified',
                        'academic_status': profile.academic_status or 'active',
                        'guardian_name': profile.guardian_name or '',
                        'guardian_email': profile.guardian_email or '',
                        'learning_style': profile.learning_style or 'adaptive',
                        'enrollment_date': profile.enrollment_date.strftime(
                            '%Y-%m-%d') if profile.enrollment_date else '',
                        'profile_exists': True
                    })
                except:
                    # Create missing student profile
                    try:
                        profile = StudentProfile.objects.create(
                            user=user,
                            student_id=f'STU{user.id:05d}',
                            academic_status='active',
                            current_gpa=0.0
                        )
                        user_data.update({
                            'student_id': profile.student_id,
                            'current_gpa': 0.0,
                            'grade_level': 'Not specified',
                            'academic_status': 'active',
                            'profile_exists': True,
                            'profile_created': True
                        })
                    except:
                        user_data.update({
                            'student_id': 'No ID',
                            'current_gpa': 0.0,
                            'grade_level': 'Not specified',
                            'academic_status': 'unknown',
                            'profile_exists': False
                        })

            elif user.user_type == 'teacher':
                try:
                    profile = user.teacher_profile
                    user_data.update({
                        'employee_id': profile.employee_id,
                        'department': profile.department or 'General',
                        'specialization': profile.specialization or [],
                        'experience_years': profile.experience_years or 0,
                        'teaching_rating': float(profile.teaching_rating) if profile.teaching_rating else 0.0,
                        'is_teacher_approved': profile.is_approved,
                        'approved_at': profile.approved_at.strftime('%Y-%m-%d') if profile.approved_at else None,
                        'profile_exists': True
                    })
                except:
                    user_data.update({
                        'employee_id': 'No ID',
                        'department': 'General',
                        'specialization': [],
                        'experience_years': 0,
                        'teaching_rating': 0.0,
                        'is_teacher_approved': False,
                        'profile_exists': False
                    })

            # Add additional useful information
            user_data.update({
                'last_login_display': user.last_login.strftime('%Y-%m-%d %H:%M') if user.last_login else 'Never',
                'date_joined_display': user.date_joined.strftime('%Y-%m-%d') if user.date_joined else '',
                'approval_status_display': user.approval_status.title(),
                'is_active_display': 'Active' if user.is_active else 'Inactive',
                'user_type_display': user.user_type.title()
            })

            users_data.append(user_data)

        # Calculate statistics
        total_users = len(users_data)
        active_users = len([u for u in users_data if u['is_active']])
        pending_users = len([u for u in users_data if u['approval_status'] == 'pending'])
        students_count = len([u for u in users_data if u['user_type'] == 'student'])
        teachers_count = len([u for u in users_data if u['user_type'] == 'teacher'])
        admins_count = len([u for u in users_data if u['user_type'] == 'admin'])

        return Response({
            'users': users_data,
            'statistics': {
                'total_users': total_users,
                'active_users': active_users,
                'pending_users': pending_users,
                'students': students_count,
                'teachers': teachers_count,
                'admins': admins_count
            },
            'total_count': total_users
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'error': f'Failed to fetch users: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_user_status(request, user_id):
    """Toggle user active status (Admin only)"""
    if request.user.user_type != 'admin':
        return Response({
            'error': 'Permission denied. Admin access required.'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        target_user = User.objects.get(id=user_id)
        new_status = request.data.get('is_active', not target_user.is_active)

        target_user.is_active = new_status
        target_user.save()

        return Response({
            'message': f'User {target_user.get_full_name()} {"activated" if new_status else "deactivated"} successfully.',
            'user': UserSerializer(target_user).data
        }, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response({
            'error': 'User not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to update user status: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user password - Available to all user types"""
    try:
        user = request.user
        data = request.data

        # Validate required fields
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')

        if not all([current_password, new_password, confirm_password]):
            return Response({
                'error': 'All fields are required: current_password, new_password, confirm_password'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if current password is correct
        if not check_password(current_password, user.password):
            return Response({
                'error': 'Current password is incorrect'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if new passwords match
        if new_password != confirm_password:
            return Response({
                'error': 'New passwords do not match'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate new password strength
        if len(new_password) < 6:
            return Response({
                'error': 'New password must be at least 6 characters long'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if new password is different from current
        if check_password(new_password, user.password):
            return Response({
                'error': 'New password must be different from current password'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Change the password
        user.set_password(new_password)
        user.save()

        # Log the user out from all sessions (optional security measure)
        # Delete all tokens for this user
        from rest_framework.authtoken.models import Token
        Token.objects.filter(user=user).delete()

        # Create new token
        new_token, created = Token.objects.get_or_create(user=user)

        return Response({
            'message': 'Password changed successfully',
            'token': new_token.key,  # Return new token
            'user_type': user.user_type,
            'requires_relogin': True
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'error': f'Password change failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    """Delete user's own account - Available to all user types"""
    try:
        user = request.user

        # Get confirmation from request
        confirmation = request.data.get('confirmation', '').lower()
        expected_confirmation = f"delete {user.username}".lower()

        if confirmation != expected_confirmation:
            return Response({
                'error': f'To confirm account deletion, please type: "delete {user.username}"'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Store user info for response
        user_info = {
            'username': user.username,
            'email': user.email,
            'user_type': user.user_type,
            'name': f"{user.first_name} {user.last_name}"
        }

        # Delete related data based on user type
        with transaction.atomic():
            if user.user_type == 'student':
                # Delete student-specific data
                if hasattr(user, 'student_profile'):
                    # Remove from course enrollments
                    if CourseEnrollment:
                        CourseEnrollment.objects.filter(student=user.student_profile).delete()

                    # Delete assessment attempts
                    if StudentAssessmentAttempt:
                        StudentAssessmentAttempt.objects.filter(student=user.student_profile).delete()

                    # Delete learning progress
                    if LearningProgress:
                        LearningProgress.objects.filter(student=user.student_profile).delete()

                    # Delete analytics
                    if LearningAnalytics:
                        LearningAnalytics.objects.filter(student=user.student_profile).delete()

                    # Delete student profile
                    user.student_profile.delete()

            elif user.user_type == 'teacher':
                # Delete teacher-specific data
                if hasattr(user, 'teacher_profile'):
                    # Update courses to remove instructor (or delete if needed)
                    if Course:
                        courses = Course.objects.filter(instructor=user.teacher_profile)
                        for course in courses:
                            # You might want to reassign courses instead of deleting
                            course.is_active = False
                            course.save()

                    # Delete teacher approval request if exists
                    if hasattr(user, 'teacher_approval'):
                        user.teacher_approval.delete()

                    # Delete teacher profile
                    user.teacher_profile.delete()

            # Delete authentication tokens
            Token.objects.filter(user=user).delete()

            # Delete user profile
            if hasattr(user, 'userprofile'):
                user.userprofile.delete()

            # Finally delete the user
            user.delete()

        return Response({
            'message': f'Account deleted successfully',
            'deleted_user': user_info,
            'deleted_at': timezone.now().isoformat()
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'error': f'Account deletion failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user_account(request, user_id):
    """Delete another user's account - Admin can delete any, Teacher can delete students"""
    try:
        current_user = request.user
        target_user = User.objects.get(id=user_id)

        # Permission checks
        if current_user.user_type == 'admin':
            # Admin can delete anyone except other admins
            if target_user.user_type == 'admin' and target_user.id != current_user.id:
                return Response({
                    'error': 'Admins cannot delete other admin accounts'
                }, status=status.HTTP_403_FORBIDDEN)
        elif current_user.user_type == 'teacher':
            # Teachers can only delete students
            if target_user.user_type != 'student':
                return Response({
                    'error': 'Teachers can only delete student accounts'
                }, status=status.HTTP_403_FORBIDDEN)
        else:
            # Students cannot delete other accounts
            return Response({
                'error': 'Students cannot delete other user accounts'
            }, status=status.HTTP_403_FORBIDDEN)

        # Prevent self-deletion through this endpoint
        if target_user.id == current_user.id:
            return Response({
                'error': 'Use the delete-account endpoint to delete your own account'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Get confirmation from request
        confirmation = request.data.get('confirmation', '').lower()
        expected_confirmation = f"delete {target_user.username}".lower()

        if confirmation != expected_confirmation:
            return Response({
                'error': f'To confirm account deletion, please type: "delete {target_user.username}"'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Deletion reason (optional)
        deletion_reason = request.data.get('reason', 'Account deleted by administrator')

        # Store user info for response
        user_info = {
            'username': target_user.username,
            'email': target_user.email,
            'user_type': target_user.user_type,
            'name': f"{target_user.first_name} {target_user.last_name}",
            'deleted_by': f"{current_user.first_name} {current_user.last_name}",
            'deleted_by_type': current_user.user_type,
            'reason': deletion_reason
        }

        # Delete related data
        with transaction.atomic():
            if target_user.user_type == 'student':
                if hasattr(target_user, 'student_profile'):
                    # Remove from course enrollments
                    if CourseEnrollment:
                        CourseEnrollment.objects.filter(student=target_user.student_profile).delete()

                    # Delete assessment attempts
                    if StudentAssessmentAttempt:
                        StudentAssessmentAttempt.objects.filter(student=target_user.student_profile).delete()

                    # Delete learning progress
                    if LearningProgress:
                        LearningProgress.objects.filter(student=target_user.student_profile).delete()

                    # Delete analytics
                    if LearningAnalytics:
                        LearningAnalytics.objects.filter(student=target_user.student_profile).delete()

                    # Delete student profile
                    target_user.student_profile.delete()

            elif target_user.user_type == 'teacher':
                if hasattr(target_user, 'teacher_profile'):
                    # Handle courses - make them inactive instead of deleting
                    if Course:
                        courses = Course.objects.filter(instructor=target_user.teacher_profile)
                        for course in courses:
                            course.is_active = False
                            course.save()

                    # Delete teacher approval request
                    if hasattr(target_user, 'teacher_approval'):
                        target_user.teacher_approval.delete()

                    # Delete teacher profile
                    target_user.teacher_profile.delete()

            # Delete authentication tokens
            Token.objects.filter(user=target_user).delete()

            # Delete user profile
            if hasattr(target_user, 'userprofile'):
                target_user.userprofile.delete()

            # Finally delete the user
            target_user.delete()

        return Response({
            'message': f'User account deleted successfully',
            'deleted_user': user_info,
            'deleted_at': timezone.now().isoformat()
        }, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Account deletion failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)