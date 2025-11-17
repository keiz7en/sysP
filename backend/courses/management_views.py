from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.utils import timezone
from django.db.models import Q
from django.shortcuts import get_object_or_404
import json

from .models import Subject, TeacherSubjectRequest, TeacherApprovedSubject, Course, CourseEnrollment
from .serializers import (
    SubjectSerializer, TeacherSubjectRequestSerializer, TeacherApprovedSubjectSerializer,
    CourseSerializer, CourseDetailSerializer, CourseEnrollmentSerializer
)
from teachers.models import TeacherProfile
from students.models import StudentProfile


class SubjectViewSet(viewsets.ModelViewSet):
    """ViewSet for Subject management"""
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get subjects filtered by category"""
        category = request.query_params.get('category')
        if category:
            subjects = Subject.objects.filter(category=category)
        else:
            subjects = Subject.objects.all()
        serializer = self.get_serializer(subjects, many=True)
        return Response(serializer.data)


class TeacherSubjectRequestViewSet(viewsets.ModelViewSet):
    """ViewSet for teacher subject requests"""
    queryset = TeacherSubjectRequest.objects.all()
    serializer_class = TeacherSubjectRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return TeacherSubjectRequest.objects.all()

        if hasattr(user, "user_type") and user.user_type == "teacher":
            try:
                teacher = TeacherProfile.objects.get(user=user)
                return TeacherSubjectRequest.objects.filter(teacher=teacher)
            except TeacherProfile.DoesNotExist:
                return TeacherSubjectRequest.objects.none()
        return TeacherSubjectRequest.objects.none()
    
    def create(self, request, *args, **kwargs):
        """Teacher requests a subject"""
        try:
            teacher = TeacherProfile.objects.get(user=request.user)
        except TeacherProfile.DoesNotExist:
            return Response(
                {'error': 'Teacher profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        subject_id = request.data.get('subject')
        subject = get_object_or_404(Subject, id=subject_id)
        
        subject_request, created = TeacherSubjectRequest.objects.get_or_create(
            teacher=teacher,
            subject=subject,
            defaults={'status': 'pending'}
        )
        
        if not created and subject_request.status == 'rejected':
            subject_request.status = 'pending'
            subject_request.rejection_reason = ''
            subject_request.save()
        
        serializer = self.get_serializer(subject_request)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def pending(self, request):
        """Get all pending subject requests (admin only)"""
        pending = TeacherSubjectRequest.objects.filter(status='pending')
        serializer = self.get_serializer(pending, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        """Admin approves a subject request"""
        subject_request = self.get_object()
        subject_request.status = 'approved'
        subject_request.approved_by = request.user
        subject_request.approved_at = timezone.now()
        subject_request.save()
        
        TeacherApprovedSubject.objects.get_or_create(
            teacher=subject_request.teacher,
            subject=subject_request.subject,
            defaults={'approved_by': request.user}
        )
        
        serializer = self.get_serializer(subject_request)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def reject(self, request, pk=None):
        """Admin rejects a subject request"""
        subject_request = self.get_object()
        subject_request.status = 'rejected'
        subject_request.approved_by = request.user
        subject_request.approved_at = timezone.now()
        subject_request.rejection_reason = request.data.get('reason', '')
        subject_request.save()
        
        TeacherApprovedSubject.objects.filter(
            teacher=subject_request.teacher,
            subject=subject_request.subject
        ).delete()
        
        serializer = self.get_serializer(subject_request)
        return Response(serializer.data)


class TeacherApprovedSubjectViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for approved subjects"""
    queryset = TeacherApprovedSubject.objects.all()
    serializer_class = TeacherApprovedSubjectSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return TeacherApprovedSubject.objects.all()

        if hasattr(user, "user_type") and user.user_type == "teacher":
            try:
                teacher = TeacherProfile.objects.get(user=user)
                return TeacherApprovedSubject.objects.filter(teacher=teacher)
            except TeacherProfile.DoesNotExist:
                return TeacherApprovedSubject.objects.none()
        return TeacherApprovedSubject.objects.none()


class CourseViewSet(viewsets.ModelViewSet):
    """ViewSet for course management"""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseSerializer
    
    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return Course.objects.all()

        # Teacher views
        if hasattr(user, "user_type") and user.user_type == "teacher":
            try:
                teacher = TeacherProfile.objects.get(user=user)
                return Course.objects.filter(instructor=teacher)
            except TeacherProfile.DoesNotExist:
                return Course.objects.none()

        # Student views
        if hasattr(user, "user_type") and user.user_type == "student":
            try:
                StudentProfile.objects.get(user=user)
                return Course.objects.filter(status='approved', is_open_for_enrollment=True)
            except StudentProfile.DoesNotExist:
                return Course.objects.filter(status='approved', is_open_for_enrollment=True)

        # Fallback: only show approved courses for users who are neither teacher nor student
        return Course.objects.filter(status='approved')
    
    def perform_create(self, serializer):
        """Only teachers can create courses in their approved subjects"""
        try:
            teacher = TeacherProfile.objects.get(user=self.request.user)
            subject_obj = serializer.validated_data.get('subject')
            subject_id = subject_obj.id if subject_obj else None

            # Ensure teacher is approved for the subject
            if not TeacherApprovedSubject.objects.filter(teacher=teacher, subject_id=subject_id).exists():
                raise PermissionError("You are not approved to teach this subject")

            serializer.save(instructor=teacher)
        except TeacherProfile.DoesNotExist:
            raise PermissionError("Teacher profile not found")
        except PermissionError as e:
            raise PermissionError(str(e))
    
    @action(detail=False, methods=['get'])
    def available_for_enrollment(self, request):
        """Get courses available for student enrollment"""
        courses = Course.objects.filter(status='approved', is_open_for_enrollment=True)
        serializer = self.get_serializer(courses, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def pending_approval(self, request):
        """Get courses pending admin approval"""
        courses = Course.objects.filter(status='pending')
        serializer = self.get_serializer(courses, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        """Admin approves a course"""
        course = self.get_object()
        course.status = 'approved'
        course.is_open_for_enrollment = True
        course.ai_content_enabled = True
        course.save()
        
        serializer = self.get_serializer(course)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def reject(self, request, pk=None):
        """Admin rejects a course"""
        course = self.get_object()
        course.status = 'rejected'
        course.is_open_for_enrollment = False
        course.ai_content_enabled = False
        course.save()
        
        serializer = self.get_serializer(course)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def open_enrollment(self, request, pk=None):
        """Teacher opens course for enrollment"""
        course = self.get_object()
        
        if course.instructor.user != request.user:
            return Response(
                {'error': 'You do not have permission to modify this course'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if course.status != 'approved':
            return Response(
                {'error': 'Only approved courses can be opened for enrollment'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        course.is_open_for_enrollment = True
        course.save()
        
        serializer = self.get_serializer(course)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def close_enrollment(self, request, pk=None):
        """Teacher closes course enrollment"""
        course = self.get_object()
        
        if course.instructor.user != request.user:
            return Response(
                {'error': 'You do not have permission to modify this course'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        course.is_open_for_enrollment = False
        course.save()
        
        serializer = self.get_serializer(course)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def enable_ai_content(self, request, pk=None):
        """Teacher enables AI content generation for course"""
        course = self.get_object()
        
        if course.instructor.user != request.user:
            return Response(
                {'error': 'You do not have permission to modify this course'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if course.status != 'approved':
            return Response(
                {'error': 'Only approved courses can have AI features enabled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        course.ai_content_enabled = True
        course.save()
        
        serializer = self.get_serializer(course)
        return Response(serializer.data)


class CourseEnrollmentViewSet(viewsets.ModelViewSet):
    """ViewSet for course enrollment management"""
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Students see their enrollments
        if hasattr(user, "user_type") and user.user_type == 'student':
            try:
                student_profile = StudentProfile.objects.get(user=user)
                return CourseEnrollment.objects.filter(student=student_profile)
            except StudentProfile.DoesNotExist:
                return CourseEnrollment.objects.none()

        # Teachers see enrollments for their courses
        if hasattr(user, "user_type") and user.user_type == 'teacher':
            try:
                teacher_profile = TeacherProfile.objects.get(user=user)
                return CourseEnrollment.objects.filter(course__instructor=teacher_profile)
            except TeacherProfile.DoesNotExist:
                return CourseEnrollment.objects.none()

        # Admins see everything
        if hasattr(user, "user_type") and user.user_type == 'admin':
            return CourseEnrollment.objects.all()

        # Fallback: nobody sees anything
        return CourseEnrollment.objects.none()

    @action(detail=False, methods=['get'])
    def pending_enrollments(self, request):
        """Get pending enrollments for teacher"""
        user = request.user
        if not hasattr(user, "user_type") or user.user_type != 'teacher':
            return Response(
                {'error': 'Only teachers can view pending enrollments'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            teacher_profile = TeacherProfile.objects.get(user=user)
            pending = CourseEnrollment.objects.filter(
                course__instructor=teacher_profile,
                status='pending'
            ).select_related('student__user', 'course')

            data = CourseEnrollmentSerializer(pending, many=True).data
            return Response({'pending_enrollments': data})
        except TeacherProfile.DoesNotExist:
            return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)


# Standalone view functions for frontend compatibility


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_subject_requests(request):
    """
    Get all subject requests for the logged-in teacher
    Returns array directly for frontend compatibility
    """
    user = request.user
    if not hasattr(user, "user_type") or user.user_type != 'teacher':
        return Response({
            'error': 'Only teachers can view subject requests'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        teacher_profile = TeacherProfile.objects.get(user=user)
        requests = TeacherSubjectRequest.objects.filter(
            teacher=teacher_profile
        ).select_related('subject', 'approved_by').order_by('-request_date')

        requests_data = []
        for req in requests:
            requests_data.append({
                'id': req.id,
                'subject_id': req.subject.id,
                'subject_name': req.subject.name,
                'subject_code': req.subject.code,
                'subject_category': req.subject.category,
                'subject': {
                    'id': req.subject.id,
                    'name': req.subject.name,
                    'code': req.subject.code,
                    'category': req.subject.category
                },
                'status': req.status,
                'request_date': req.request_date.isoformat(),
                'approved_by': req.approved_by.get_full_name() if req.approved_by else None,
                'approved_at': req.approved_at.isoformat() if req.approved_at else None,
                'rejection_reason': req.rejection_reason
            })

        # Return array directly for frontend .map() compatibility
        return Response(requests_data)

    except Exception as e:
        return Response({
            'error': f'Failed to fetch subject requests: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_approved_subjects(request):
    """
    Get all approved subjects for the logged-in teacher
    Returns array directly for frontend compatibility
    """
    user = request.user
    if not hasattr(user, "user_type") or user.user_type != 'teacher':
        return Response({
            'error': 'Only teachers can view approved subjects'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        teacher_profile = TeacherProfile.objects.get(user=user)
        approved = TeacherApprovedSubject.objects.filter(
            teacher=teacher_profile
        ).select_related('subject', 'approved_by').order_by('-approved_date')

        approved_data = []
        for app in approved:
            approved_data.append({
                'id': app.id,
                'subject': {
                    'id': app.subject.id,
                    'name': app.subject.name,
                    'code': app.subject.code,
                    'category': app.subject.category,
                    'description': app.subject.description
                },
                'approved_date': app.approved_date.isoformat(),
                'approved_by': app.approved_by.get_full_name() if app.approved_by else None
            })

        # Return array directly for frontend .map() compatibility
        return Response(approved_data)

    except Exception as e:
        return Response({
            'error': f'Failed to fetch approved subjects: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
