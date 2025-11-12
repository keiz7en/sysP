from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Q, Count, Avg

from .models import Course, CourseModule, CourseEnrollment, LearningPath, GameificationProgress
from .serializers import CourseSerializer, CourseModuleSerializer, CourseEnrollmentSerializer

User = get_user_model()


class CourseViewSet(viewsets.ModelViewSet):
    """ViewSet for courses"""
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type == 'student':
            # Students can see active courses
            return Course.objects.filter(status='active')
        elif self.request.user.user_type == 'teacher':
            # Teachers can see courses they teach or all active courses
            return Course.objects.filter(
                Q(instructor__user=self.request.user) | Q(status='active')
            )
        elif self.request.user.user_type == 'admin':
            # Admins can see all courses
            return Course.objects.all()
        return Course.objects.none()


class CourseModuleViewSet(viewsets.ModelViewSet):
    """ViewSet for course modules"""
    serializer_class = CourseModuleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        course_id = self.request.query_params.get('course_id')
        if course_id:
            return CourseModule.objects.filter(course_id=course_id).order_by('order')
        return CourseModule.objects.all()


class CourseEnrollmentViewSet(viewsets.ModelViewSet):
    """ViewSet for course enrollments"""
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type == 'student':
            try:
                from students.models import StudentProfile
                student_profile = StudentProfile.objects.get(user=self.request.user)
                return CourseEnrollment.objects.filter(student=student_profile)
            except StudentProfile.DoesNotExist:
                return CourseEnrollment.objects.none()
        elif self.request.user.user_type in ['teacher', 'admin']:
            return CourseEnrollment.objects.all()
        return CourseEnrollment.objects.none()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def course_statistics(request):
    """Get course statistics"""
    try:
        if request.user.user_type == 'admin':
            stats = {
                'total_courses': Course.objects.count(),
                'active_courses': Course.objects.filter(status='active').count(),
                'total_enrollments': CourseEnrollment.objects.count(),
                'average_enrollment': CourseEnrollment.objects.values('course').annotate(
                    enrollment_count=Count('id')
                ).aggregate(avg_enrollment=Avg('enrollment_count'))['avg_enrollment'] or 0
            }
            return Response(stats, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
