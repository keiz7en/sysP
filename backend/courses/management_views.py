from rest_framework import viewsets, status
from rest_framework.decorators import action
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
        
        try:
            teacher = TeacherProfile.objects.get(user=user)
            return TeacherSubjectRequest.objects.filter(teacher=teacher)
        except TeacherProfile.DoesNotExist:
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
    
    @action(detail=False, methods=['get'])
    def my_requests(self, request):
        """Get current user's subject requests"""
        try:
            teacher = TeacherProfile.objects.get(user=request.user)
            requests = TeacherSubjectRequest.objects.filter(teacher=teacher)
            serializer = self.get_serializer(requests, many=True)
            return Response(serializer.data)
        except TeacherProfile.DoesNotExist:
            return Response(
                {'error': 'Teacher profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class TeacherApprovedSubjectViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for approved subjects"""
    queryset = TeacherApprovedSubject.objects.all()
    serializer_class = TeacherApprovedSubjectSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_staff:
            return TeacherApprovedSubject.objects.all()
        
        try:
            teacher = TeacherProfile.objects.get(user=user)
            return TeacherApprovedSubject.objects.filter(teacher=teacher)
        except TeacherProfile.DoesNotExist:
            return TeacherApprovedSubject.objects.none()
    
    @action(detail=False, methods=['get'])
    def my_subjects(self, request):
        """Get current teacher's approved subjects"""
        try:
            teacher = TeacherProfile.objects.get(user=request.user)
            approved = TeacherApprovedSubject.objects.filter(teacher=teacher)
            serializer = self.get_serializer(approved, many=True)
            return Response(serializer.data)
        except TeacherProfile.DoesNotExist:
            return Response(
                {'error': 'Teacher profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )


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
        
        try:
            teacher = TeacherProfile.objects.get(user=user)
            if self.action == 'list':
                return Course.objects.filter(instructor=teacher)
            return Course.objects.filter(instructor=teacher)
        except TeacherProfile.DoesNotExist:
            try:
                StudentProfile.objects.get(user=user)
                return Course.objects.filter(status='approved', is_open_for_enrollment=True)
            except StudentProfile.DoesNotExist:
                return Course.objects.filter(status='approved')
    
    def perform_create(self, serializer):
        """Only teachers can create courses in their approved subjects"""
        try:
            teacher = TeacherProfile.objects.get(user=self.request.user)
            subject_id = serializer.validated_data.get('subject')
            
            if not teacher.can_create_course_in_subject(subject_id):
                return Response(
                    {'error': 'You are not approved to teach this subject'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer.save(instructor=teacher)
        except TeacherProfile.DoesNotExist:
            return Response(
                {'error': 'Teacher profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
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
    """ViewSet for course enrollment and approval"""
    queryset = CourseEnrollment.objects.all()
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_staff:
            return CourseEnrollment.objects.all()
        
        try:
            teacher = TeacherProfile.objects.get(user=user)
            return CourseEnrollment.objects.filter(course__instructor=teacher)
        except TeacherProfile.DoesNotExist:
            try:
                student = StudentProfile.objects.get(user=user)
                return CourseEnrollment.objects.filter(student=student)
            except StudentProfile.DoesNotExist:
                return CourseEnrollment.objects.none()
    
    def create(self, request, *args, **kwargs):
        """Student requests enrollment in a course"""
        try:
            student = StudentProfile.objects.get(user=request.user)
        except StudentProfile.DoesNotExist:
            return Response(
                {'error': 'Student profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        course_id = request.data.get('course')
        course = get_object_or_404(Course, id=course_id)
        
        if not course.is_approved_and_open():
            return Response(
                {'error': 'This course is not available for enrollment'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if course.is_full:
            return Response(
                {'error': 'Course is full'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        enrollment, created = CourseEnrollment.objects.get_or_create(
            student=student,
            course=course,
            defaults={'status': 'pending'}
        )
        
        if not created:
            return Response(
                {'error': 'You are already enrolled in this course'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(enrollment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def my_enrollments(self, request):
        """Get current student's enrollments"""
        try:
            student = StudentProfile.objects.get(user=request.user)
            enrollments = CourseEnrollment.objects.filter(student=student)
            serializer = self.get_serializer(enrollments, many=True)
            return Response(serializer.data)
        except StudentProfile.DoesNotExist:
            return Response(
                {'error': 'Student profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def pending_enrollments(self, request):
        """Get teacher's pending enrollment requests"""
        try:
            teacher = TeacherProfile.objects.get(user=request.user)
            enrollments = CourseEnrollment.objects.filter(
                course__instructor=teacher,
                status='pending'
            )
            serializer = self.get_serializer(enrollments, many=True)
            return Response(serializer.data)
        except TeacherProfile.DoesNotExist:
            return Response(
                {'error': 'Teacher profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Teacher approves student enrollment"""
        enrollment = self.get_object()
        
        if enrollment.course.instructor.user != request.user:
            return Response(
                {'error': 'You do not have permission to approve this enrollment'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        enrollment.approve_enrollment(request.user)
        serializer = self.get_serializer(enrollment)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Teacher rejects student enrollment"""
        enrollment = self.get_object()
        
        if enrollment.course.instructor.user != request.user:
            return Response(
                {'error': 'You do not have permission to reject this enrollment'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        reason = request.data.get('reason', '')
        enrollment.reject_enrollment(reason)
        serializer = self.get_serializer(enrollment)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def bulk_approve(self, request):
        """Admin or teacher bulk approves enrollments"""
        enrollment_ids = request.data.get('enrollment_ids', [])
        enrollments = CourseEnrollment.objects.filter(id__in=enrollment_ids)
        
        for enrollment in enrollments:
            if enrollment.course.instructor.user != request.user and not request.user.is_staff:
                continue
            enrollment.approve_enrollment(request.user)
        
        serializer = self.get_serializer(enrollments, many=True)
        return Response(serializer.data)
