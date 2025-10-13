from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.hashers import make_password
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status, permissions, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import transaction
from django.contrib.auth import get_user_model
import json
import random
import string

from .models import User, UserProfile
from .serializers import UserSerializer, UserProfileSerializer, LoginSerializer, UserUpdateSerializer
from students.models import StudentProfile
from teachers.models import TeacherProfile

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
    """User registration with automatic profile creation"""
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
                    address=data.get('address', '')
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
                        academic_status='active'
                    )

                elif user_type == 'teacher':
                    # Teachers need approval
                    TeacherProfile.objects.create(
                        user=user,
                        employee_id=generate_employee_id(),
                        department=data.get('department', 'General'),
                        specialization=data.get('specialization', ''),
                        experience_years=data.get('experience_years', 0),
                        is_approved=False,  # Requires admin approval
                        teaching_rating=0.0
                    )

                # Create auth token
                token, created = Token.objects.get_or_create(user=user)

                return Response({
                    'message': 'Registration successful! Welcome to EduAI.',
                    'user': UserSerializer(user).data,
                    'token': token.key,
                    'user_type': user_type
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': f'Registration failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LoginView(APIView):
    """Enhanced login with user type validation"""
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

            # Additional checks for teachers
            if user_type == 'teacher':
                try:
                    teacher_profile = TeacherProfile.objects.get(user=user)
                    if not teacher_profile.is_approved:
                        return Response({
                            'error': 'Your teacher account is pending approval. Please wait for admin approval.'
                        }, status=status.HTTP_403_FORBIDDEN)
                except TeacherProfile.DoesNotExist:
                    return Response({
                        'error': 'Teacher profile not found. Please contact administrator.'
                    }, status=status.HTTP_400_BAD_REQUEST)

            # Create or get token
            token, created = Token.objects.get_or_create(user=user)

            # Prepare response data
            response_data = {
                'message': f'Welcome back, {user.first_name}!',
                'user': UserSerializer(user).data,
                'token': token.key,
                'user_type': user_type
            }

            # Add specific profile data
            if user_type == 'student' and hasattr(user, 'student_profile'):
                response_data['student_id'] = user.student_profile.student_id
                response_data['current_gpa'] = float(user.student_profile.current_gpa)

            elif user_type == 'teacher' and hasattr(user, 'teacher_profile'):
                response_data['employee_id'] = user.teacher_profile.employee_id
                response_data['department'] = user.teacher_profile.department

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

            if user.is_active:
                user_profile = UserSerializer(user).data
                return Response({
                    'valid': True,
                    'user': user_profile
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'valid': False,
                    'error': 'User account is inactive'
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
    """Get dashboard data for authenticated user"""
    try:
        user = request.user

        dashboard_data = {
            'user': UserSerializer(user).data,
            'stats': {},
            'recent_activity': [],
            'notifications': []
        }

        # Add type-specific dashboard data
        if user.user_type == 'student':
            try:
                student_profile = StudentProfile.objects.get(user=user)
                dashboard_data['stats'] = {
                    'gpa': float(student_profile.current_gpa) if student_profile.current_gpa else 0.0,
                    'courses': 0,  # TODO: Count enrolled courses
                    'assignments': 0,  # TODO: Count pending assignments
                    'study_hours': 0  # TODO: Calculate study hours
                }
            except StudentProfile.DoesNotExist:
                dashboard_data['stats'] = {'gpa': 0.0, 'courses': 0, 'assignments': 0, 'study_hours': 0}

        elif user.user_type == 'teacher':
            try:
                teacher_profile = TeacherProfile.objects.get(user=user)
                dashboard_data['stats'] = {
                    'students': 0,  # TODO: Count students
                    'courses': 0,  # TODO: Count assigned courses
                    'assignments': 0,  # TODO: Count assignments to grade
                    'rating': float(teacher_profile.teaching_rating) if teacher_profile.teaching_rating else 0.0
                }
            except TeacherProfile.DoesNotExist:
                dashboard_data['stats'] = {'students': 0, 'courses': 0, 'assignments': 0, 'rating': 0.0}

        elif user.user_type == 'admin':
            dashboard_data['stats'] = {
                'total_users': User.objects.count(),
                'pending_teachers': TeacherProfile.objects.filter(is_approved=False).count(),
                'students': User.objects.filter(user_type='student').count(),
                'teachers': User.objects.filter(user_type='teacher').count()
            }

        return Response(dashboard_data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'error': f'Failed to load dashboard data: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
