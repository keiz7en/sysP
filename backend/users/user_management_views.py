from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from django.db import transaction, models
from django.utils import timezone

from users.models import User
from teachers.models import TeacherProfile
from students.models import StudentProfile
from courses.models import CourseEnrollment


class UserManagementSerializer:
    """Serializer helper for user data"""
    
    @staticmethod
    def get_user_detail(user):
        """Get complete user details with role information"""
        data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone_number': user.phone_number,
            'address': user.address,
            'user_type': user.user_type,
            'is_active': user.is_active,
            'is_staff': user.is_staff,
            'is_verified': user.is_verified,
            'approval_status': user.approval_status,
            'created_at': user.created_at,
            'updated_at': user.updated_at,
            'role_data': {}
        }
        
        # Get role-specific data
        if user.user_type == 'teacher':
            try:
                teacher = user.teacher_profile
                data['role_data'] = {
                    'type': 'teacher',
                    'employee_id': teacher.employee_id,
                    'department': teacher.department,
                    'specialization': teacher.specialization,
                    'experience_years': teacher.experience_years,
                    'teaching_rating': str(teacher.teaching_rating),
                    'student_satisfaction': str(teacher.student_satisfaction),
                    'approval_status': teacher.approval_status,
                    'is_approved': teacher.is_approved,
                    'courses_count': teacher.courses.count(),
                    'students_count': CourseEnrollment.objects.filter(
                        course__instructor=teacher,
                        status__in=['active', 'approved']
                    ).count()
                }
            except:
                pass
        
        elif user.user_type == 'student':
            try:
                student = user.student_profile
                data['role_data'] = {
                    'type': 'student',
                    'student_id': student.student_id,
                    'grade_level': student.grade_level,
                    'enrollment_date': student.enrollment_date,
                    'current_gpa': str(student.current_gpa) if student.current_gpa else '0.00',
                    'learning_style': student.learning_style,
                    'enrollments_count': student.enrollments.count(),
                    'active_courses': student.enrollments.filter(
                        status__in=['active', 'approved']
                    ).count()
                }
            except:
                pass
        
        return data


class UserManagementViewSet(viewsets.ViewSet):
    """User management endpoints for admins"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        """Get all users"""
        return User.objects.all().order_by('-created_at')
    
    def list(self, request):
        """List all users with filtering"""
        queryset = self.get_queryset()
        
        # Filter by user type
        user_type = request.query_params.get('user_type')
        if user_type in ['student', 'teacher', 'admin', 'parent']:
            queryset = queryset.filter(user_type=user_type)
        
        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter == 'active':
            queryset = queryset.filter(is_active=True)
        elif status_filter == 'inactive':
            queryset = queryset.filter(is_active=False)
        elif status_filter == 'pending':
            queryset = queryset.filter(approval_status='pending')
        elif status_filter == 'approved':
            queryset = queryset.filter(approval_status='approved')
        
        # Search by name, email, or username
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(first_name__icontains=search) |
                models.Q(last_name__icontains=search) |
                models.Q(email__icontains=search) |
                models.Q(username__icontains=search)
            )
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        start = (page - 1) * page_size
        end = start + page_size
        
        total = queryset.count()
        users = queryset[start:end]
        
        user_list = [UserManagementSerializer.get_user_detail(user) for user in users]
        
        return Response({
            'total': total,
            'page': page,
            'page_size': page_size,
            'users': user_list
        })
    
    def retrieve(self, request, pk=None):
        """Get detailed information about a user"""
        user = get_object_or_404(User, pk=pk)
        user_detail = UserManagementSerializer.get_user_detail(user)
        return Response(user_detail)
    
    @action(detail=True, methods=['post'])
    def disable(self, request, pk=None):
        """Disable/deactivate a user account"""
        user = get_object_or_404(User, pk=pk)
        
        if user.id == request.user.id:
            return Response(
                {'error': 'Cannot disable your own account'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.is_active = False
        user.save()
        
        return Response({
            'message': f'User {user.username} has been disabled',
            'user': UserManagementSerializer.get_user_detail(user)
        })
    
    @action(detail=True, methods=['post'])
    def enable(self, request, pk=None):
        """Enable/activate a user account"""
        user = get_object_or_404(User, pk=pk)
        
        user.is_active = True
        user.save()
        
        return Response({
            'message': f'User {user.username} has been enabled',
            'user': UserManagementSerializer.get_user_detail(user)
        })
    
    @action(detail=True, methods=['post'])
    def delete_user(self, request, pk=None):
        """Permanently delete a user account"""
        user = get_object_or_404(User, pk=pk)
        
        if user.id == request.user.id:
            return Response(
                {'error': 'Cannot delete your own account'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reason = request.data.get('reason', 'Admin deletion')
        username = user.username
        email = user.email
        
        # Log the deletion
        print(f"[USER DELETED] {username} ({email}) deleted by {request.user.username} - Reason: {reason}")
        
        # Delete the user
        user.delete()
        
        return Response({
            'message': f'User {username} has been permanently deleted',
            'deleted_user': {
                'username': username,
                'email': email,
                'deleted_at': timezone.now()
            }
        })
    
    @action(detail=True, methods=['post'])
    def block(self, request, pk=None):
        """Block a user from system access"""
        user = get_object_or_404(User, pk=pk)
        
        if user.id == request.user.id:
            return Response(
                {'error': 'Cannot block your own account'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set is_active to False (blocked)
        user.is_active = False
        
        # Store block reason
        block_reason = request.data.get('reason', 'No reason provided')
        user.rejection_reason = f"BLOCKED: {block_reason}"
        user.save()
        
        return Response({
            'message': f'User {user.username} has been blocked',
            'user': UserManagementSerializer.get_user_detail(user)
        })
    
    @action(detail=True, methods=['post'])
    def unblock(self, request, pk=None):
        """Unblock a user"""
        user = get_object_or_404(User, pk=pk)
        
        user.is_active = True
        user.rejection_reason = ''
        user.save()
        
        return Response({
            'message': f'User {user.username} has been unblocked',
            'user': UserManagementSerializer.get_user_detail(user)
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get user statistics"""
        total_users = User.objects.count()
        total_students = User.objects.filter(user_type='student').count()
        total_teachers = User.objects.filter(user_type='teacher').count()
        total_admins = User.objects.filter(user_type='admin').count()
        
        active_users = User.objects.filter(is_active=True).count()
        inactive_users = User.objects.filter(is_active=False).count()
        
        pending_approvals = User.objects.filter(approval_status='pending').count()
        verified_users = User.objects.filter(is_verified=True).count()
        
        return Response({
            'total': total_users,
            'by_type': {
                'students': total_students,
                'teachers': total_teachers,
                'admins': total_admins
            },
            'status': {
                'active': active_users,
                'inactive': inactive_users
            },
            'approvals': {
                'pending': pending_approvals,
                'verified': verified_users
            }
        })
    
    @action(detail=False, methods=['get'])
    def teachers(self, request):
        """Get all teachers with detailed information"""
        teachers_users = User.objects.filter(user_type='teacher').order_by('-created_at')
        
        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter == 'approved':
            teachers_users = teachers_users.filter(approval_status='approved')
        elif status_filter == 'pending':
            teachers_users = teachers_users.filter(approval_status='pending')
        elif status_filter == 'active':
            teachers_users = teachers_users.filter(is_active=True)
        
        # Search
        search = request.query_params.get('search')
        if search:
            teachers_users = teachers_users.filter(
                models.Q(first_name__icontains=search) |
                models.Q(last_name__icontains=search) |
                models.Q(email__icontains=search)
            )
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        start = (page - 1) * page_size
        end = start + page_size
        
        total = teachers_users.count()
        teachers = teachers_users[start:end]
        
        teacher_list = [UserManagementSerializer.get_user_detail(teacher) for teacher in teachers]
        
        return Response({
            'total': total,
            'page': page,
            'page_size': page_size,
            'teachers': teacher_list
        })
    
    @action(detail=False, methods=['get'])
    def students(self, request):
        """Get all students with detailed information"""
        students_users = User.objects.filter(user_type='student').order_by('-created_at')
        
        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter == 'active':
            students_users = students_users.filter(is_active=True)
        elif status_filter == 'inactive':
            students_users = students_users.filter(is_active=False)
        
        # Search
        search = request.query_params.get('search')
        if search:
            students_users = students_users.filter(
                models.Q(first_name__icontains=search) |
                models.Q(last_name__icontains=search) |
                models.Q(email__icontains=search)
            )
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        start = (page - 1) * page_size
        end = start + page_size
        
        total = students_users.count()
        students = students_users[start:end]
        
        student_list = [UserManagementSerializer.get_user_detail(student) for student in students]
        
        return Response({
            'total': total,
            'page': page,
            'page_size': page_size,
            'students': student_list
        })
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a pending user"""
        user = get_object_or_404(User, pk=pk)
        
        user.approval_status = 'approved'
        user.approved_by = request.user
        user.approved_at = timezone.now()
        user.save()
        
        return Response({
            'message': f'User {user.username} has been approved',
            'user': UserManagementSerializer.get_user_detail(user)
        })
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a pending user"""
        user = get_object_or_404(User, pk=pk)
        
        reason = request.data.get('reason', 'No reason provided')
        
        user.approval_status = 'rejected'
        user.rejection_reason = reason
        user.approved_by = request.user
        user.approved_at = timezone.now()
        user.save()
        
        return Response({
            'message': f'User {user.username} has been rejected',
            'user': UserManagementSerializer.get_user_detail(user)
        })
    
    @action(detail=False, methods=['post'])
    def bulk_action(self, request):
        """Perform bulk actions on users"""
        user_ids = request.data.get('user_ids', [])
        action_type = request.data.get('action')
        
        if not user_ids or not action_type:
            return Response(
                {'error': 'user_ids and action are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if action_type not in ['disable', 'enable', 'delete', 'block', 'unblock']:
            return Response(
                {'error': 'Invalid action'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        users = User.objects.filter(id__in=user_ids)
        count = 0
        
        if action_type == 'disable':
            count = users.update(is_active=False)
        elif action_type == 'enable':
            count = users.update(is_active=True)
        elif action_type == 'block':
            reason = request.data.get('reason', 'Bulk block')
            for user in users:
                user.is_active = False
                user.rejection_reason = f"BLOCKED: {reason}"
                user.save()
                count += 1
        elif action_type == 'unblock':
            for user in users:
                user.is_active = True
                user.rejection_reason = ''
                user.save()
                count += 1
        elif action_type == 'delete':
            for user in users:
                user.delete()
                count += 1
        
        return Response({
            'message': f'Bulk action {action_type} completed on {count} users',
            'count': count
        })
