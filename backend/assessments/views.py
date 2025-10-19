from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Q, Count, Avg

from .models import Assessment, Question, StudentAssessmentAttempt, StudentAnswer, AssessmentAnalytics
from .serializers import AssessmentSerializer, QuestionSerializer, StudentAssessmentAttemptSerializer

User = get_user_model()


class AssessmentViewSet(viewsets.ModelViewSet):
    """ViewSet for assessments"""
    serializer_class = AssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type == 'student':
            # Students can see assessments from their enrolled courses
            try:
                from students.models import StudentProfile
                from courses.models import CourseEnrollment
                student_profile = StudentProfile.objects.get(user=self.request.user)
                enrolled_courses = CourseEnrollment.objects.filter(
                    student=student_profile, status='active'
                ).values_list('course', flat=True)
                return Assessment.objects.filter(course__in=enrolled_courses)
            except StudentProfile.DoesNotExist:
                return Assessment.objects.none()
        elif self.request.user.user_type == 'teacher':
            # Teachers can see assessments from their courses
            try:
                from teachers.models import TeacherProfile
                teacher_profile = TeacherProfile.objects.get(user=self.request.user)
                return Assessment.objects.filter(course__instructor=teacher_profile)
            except TeacherProfile.DoesNotExist:
                return Assessment.objects.none()
        elif self.request.user.user_type == 'admin':
            return Assessment.objects.all()
        return Assessment.objects.none()


class QuestionViewSet(viewsets.ModelViewSet):
    """ViewSet for questions"""
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        assessment_id = self.request.query_params.get('assessment_id')
        if assessment_id:
            return Question.objects.filter(assessment_id=assessment_id).order_by('order')
        return Question.objects.all()


class StudentAssessmentAttemptViewSet(viewsets.ModelViewSet):
    """ViewSet for student assessment attempts"""
    serializer_class = StudentAssessmentAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type == 'student':
            try:
                from students.models import StudentProfile
                student_profile = StudentProfile.objects.get(user=self.request.user)
                return StudentAssessmentAttempt.objects.filter(student=student_profile)
            except StudentProfile.DoesNotExist:
                return StudentAssessmentAttempt.objects.none()
        elif self.request.user.user_type in ['teacher', 'admin']:
            return StudentAssessmentAttempt.objects.all()
        return StudentAssessmentAttempt.objects.none()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def assessment_statistics(request):
    """Get assessment statistics"""
    try:
        if request.user.user_type in ['teacher', 'admin']:
            stats = {
                'total_assessments': Assessment.objects.count(),
                'total_attempts': StudentAssessmentAttempt.objects.count(),
                'average_score': StudentAssessmentAttempt.objects.filter(
                    status='graded'
                ).aggregate(avg_score=Avg('percentage'))['avg_score'] or 0,
                'completion_rate': 0  # Calculate based on submitted vs started attempts
            }

            # Calculate completion rate
            total_attempts = StudentAssessmentAttempt.objects.count()
            completed_attempts = StudentAssessmentAttempt.objects.filter(
                status__in=['submitted', 'graded']
            ).count()

            if total_attempts > 0:
                stats['completion_rate'] = (completed_attempts / total_attempts) * 100

            return Response(stats, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
