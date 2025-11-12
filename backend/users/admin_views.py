from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db import transaction, models
from django.shortcuts import get_object_or_404
from django.conf import settings as django_settings
from datetime import datetime, date
import random
import string

from .models import User, UserProfile, SystemSettings
from teachers.models import TeacherProfile
from students.models import StudentProfile
from .serializers import UserSerializer


class AdminDashboardView(APIView):
    """Admin dashboard with system overview"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Verify user is an admin
            if request.user.user_type != 'admin':
                return Response(
                    {'error': 'Access denied. Admin account required.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Get system statistics
            total_users = User.objects.count()
            total_students = StudentProfile.objects.count()
            total_teachers = TeacherProfile.objects.count()
            pending_teachers = User.objects.filter(user_type='teacher').exclude(
                id__in=TeacherProfile.objects.values_list('user_id', flat=True)).count()

            # Get recent registrations
            recent_users = User.objects.order_by('-created_at')[:10]

            dashboard_data = {
                'statistics': {
                    'total_users': total_users,
                    'total_students': total_students,
                    'total_teachers': total_teachers,
                    'pending_teacher_approvals': pending_teachers
                },
                'recent_registrations': [
                    {
                        'id': user.id,
                        'name': f"{user.first_name} {user.last_name}",
                        'email': user.email,
                        'user_type': user.user_type,
                        'created_at': user.created_at,
                        'is_verified': user.is_verified
                    }
                    for user in recent_users
                ]
            }

            return Response(dashboard_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TeacherApprovalView(APIView):
    """Admin can approve/reject teacher applications"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all pending teacher applications"""
        try:
            if request.user.user_type != 'admin':
                return Response(
                    {'error': 'Access denied. Admin account required.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Get users who registered as teachers but don't have teacher profiles
            pending_teachers = User.objects.filter(
                user_type='teacher'
            ).exclude(
                id__in=TeacherProfile.objects.values_list('user_id', flat=True)
            )

            pending_data = []
            for user in pending_teachers:
                pending_data.append({
                    'id': user.id,
                    'name': f"{user.first_name} {user.last_name}",
                    'email': user.email,
                    'phone': user.phone_number,
                    'address': user.address,
                    'registration_date': user.created_at,
                    'is_verified': user.is_verified
                })

            return Response({
                'pending_teachers': pending_data,
                'total_count': len(pending_data)
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        """Approve a teacher application"""
        try:
            if request.user.user_type != 'admin':
                return Response(
                    {'error': 'Access denied. Admin account required.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            data = request.data
            user_id = data.get('user_id')

            if not user_id:
                return Response(
                    {'error': 'user_id is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get the user
            user = get_object_or_404(User, id=user_id, user_type='teacher')

            # Check if teacher profile already exists
            if hasattr(user, 'teacher_profile'):
                return Response(
                    {'error': 'Teacher already approved'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            with transaction.atomic():
                # Generate employee ID
                employee_id = self.generate_employee_id()

                # Create teacher profile
                teacher_profile = TeacherProfile.objects.create(
                    user=user,
                    employee_id=employee_id,
                    department=data.get('department', 'General'),
                    specialization=data.get('specialization', []),
                    qualifications=data.get('qualifications', []),
                    experience_years=data.get('experience_years', 0),
                    hire_date=date.today()
                )

                # Verify the user
                user.is_verified = True
                user.save()

                return Response({
                    'message': 'Teacher approved successfully',
                    'teacher': {
                        'id': teacher_profile.id,
                        'employee_id': employee_id,
                        'name': f"{user.first_name} {user.last_name}",
                        'email': user.email,
                        'department': teacher_profile.department
                    }
                }, status=status.HTTP_201_CREATED)

        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, user_id):
        """Reject a teacher application"""
        try:
            if request.user.user_type != 'admin':
                return Response(
                    {'error': 'Access denied. Admin account required.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Get the user
            user = get_object_or_404(User, id=user_id, user_type='teacher')

            # Delete the user account (rejection)
            user.delete()

            return Response({
                'message': 'Teacher application rejected and account removed'
            }, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def generate_employee_id(self):
        """Generate unique employee ID for teachers"""
        while True:
            # Generate EMP + 4 digits
            employee_id = 'EMP' + ''.join(random.choices(string.digits, k=4))

            if not TeacherProfile.objects.filter(employee_id=employee_id).exists():
                return employee_id


class UserManagementView(APIView):
    """Admin can manage all users"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all users with filtering options"""
        try:
            if request.user.user_type != 'admin':
                return Response(
                    {'error': 'Access denied. Admin account required.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Get query parameters for filtering
            user_type = request.GET.get('user_type')
            search = request.GET.get('search')

            users = User.objects.all()

            # Apply filters
            if user_type:
                users = users.filter(user_type=user_type)

            if search:
                users = users.filter(
                    models.Q(first_name__icontains=search) |
                    models.Q(last_name__icontains=search) |
                    models.Q(email__icontains=search) |
                    models.Q(username__icontains=search)
                )

            users_data = []
            for user in users:
                user_data = {
                    'id': user.id,
                    'username': user.username,
                    'name': f"{user.first_name} {user.last_name}",
                    'email': user.email,
                    'user_type': user.user_type,
                    'phone': user.phone_number,
                    'is_verified': user.is_verified,
                    'is_active': user.is_active,
                    'created_at': user.created_at,
                    'last_login': user.last_login
                }

                # Add specific profile data
                if user.user_type == 'student' and hasattr(user, 'student_profile'):
                    user_data['student_id'] = user.student_profile.student_id
                    user_data['current_gpa'] = float(user.student_profile.current_gpa)
                    user_data['academic_status'] = user.student_profile.academic_status

                elif user.user_type == 'teacher' and hasattr(user, 'teacher_profile'):
                    user_data['employee_id'] = user.teacher_profile.employee_id
                    user_data['department'] = user.teacher_profile.department
                    user_data['teaching_rating'] = float(user.teacher_profile.teaching_rating)

                users_data.append(user_data)

            return Response({
                'users': users_data,
                'total_count': len(users_data)
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def put(self, request, user_id):
        """Update user information"""
        try:
            if request.user.user_type != 'admin':
                return Response(
                    {'error': 'Access denied. Admin account required.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            user = get_object_or_404(User, id=user_id)
            data = request.data

            # Update user fields
            user.first_name = data.get('first_name', user.first_name)
            user.last_name = data.get('last_name', user.last_name)
            user.email = data.get('email', user.email)
            user.phone_number = data.get('phone_number', user.phone_number)
            user.address = data.get('address', user.address)
            user.is_verified = data.get('is_verified', user.is_verified)
            user.is_active = data.get('is_active', user.is_active)

            user.save()

            return Response({
                'message': 'User updated successfully',
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, user_id):
        """Delete a user account"""
        try:
            if request.user.user_type != 'admin':
                return Response(
                    {'error': 'Access denied. Admin account required.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            user = get_object_or_404(User, id=user_id)

            # Prevent admin from deleting themselves
            if user == request.user:
                return Response(
                    {'error': 'Cannot delete your own account'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user.delete()

            return Response({
                'message': 'User deleted successfully'
            }, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SystemSettingsView(APIView):
    """Admin system settings management with database persistence"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get current system settings from database"""
        try:
            if request.user.user_type != 'admin':
                return Response(
                    {'error': 'Access denied. Admin account required.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Get settings from database (creates if doesn't exist)
            settings_obj = SystemSettings.get_settings()

            settings_data = {
                'auto_approve_students': settings_obj.auto_approve_students,
                'auto_approve_teachers': settings_obj.auto_approve_teachers,
                'require_email_verification': settings_obj.require_email_verification,
                'allow_public_registration': settings_obj.allow_public_registration,
                'max_login_attempts': settings_obj.max_login_attempts,
                'session_timeout': settings_obj.session_timeout,
                'backup_frequency': settings_obj.backup_frequency,
                'maintenance_mode': settings_obj.maintenance_mode,
                'notification_settings': {
                    'email_notifications': settings_obj.email_notifications,
                    'sms_notifications': settings_obj.sms_notifications,
                    'in_app_notifications': settings_obj.in_app_notifications
                }
            }

            return Response({
                'settings': settings_data,
                'last_updated': settings_obj.updated_at,
                'updated_by': settings_obj.updated_by.username if settings_obj.updated_by else None
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        """Update system settings in database"""
        try:
            if request.user.user_type != 'admin':
                return Response(
                    {'error': 'Access denied. Admin account required.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            settings_data = request.data.get('settings', {})

            # Validate settings
            if not isinstance(settings_data, dict):
                return Response(
                    {'error': 'Invalid settings format'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get settings from database
            settings_obj = SystemSettings.get_settings()

            # Update settings
            settings_obj.auto_approve_students = settings_data.get('auto_approve_students',
                                                                   settings_obj.auto_approve_students)
            settings_obj.auto_approve_teachers = settings_data.get('auto_approve_teachers',
                                                                   settings_obj.auto_approve_teachers)
            settings_obj.allow_public_registration = settings_data.get('allow_public_registration',
                                                                       settings_obj.allow_public_registration)
            settings_obj.require_email_verification = settings_data.get('require_email_verification',
                                                                        settings_obj.require_email_verification)
            settings_obj.max_login_attempts = settings_data.get('max_login_attempts', settings_obj.max_login_attempts)
            settings_obj.session_timeout = settings_data.get('session_timeout', settings_obj.session_timeout)
            settings_obj.backup_frequency = settings_data.get('backup_frequency', settings_obj.backup_frequency)
            settings_obj.maintenance_mode = settings_data.get('maintenance_mode', settings_obj.maintenance_mode)

            # Update notification settings
            notification_settings = settings_data.get('notification_settings', {})
            settings_obj.email_notifications = notification_settings.get('email_notifications',
                                                                         settings_obj.email_notifications)
            settings_obj.sms_notifications = notification_settings.get('sms_notifications',
                                                                       settings_obj.sms_notifications)
            settings_obj.in_app_notifications = notification_settings.get('in_app_notifications',
                                                                          settings_obj.in_app_notifications)

            # Track who updated
            settings_obj.updated_by = request.user
            settings_obj.save()

            return Response({
                'message': 'System settings updated successfully',
                'settings': settings_data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
