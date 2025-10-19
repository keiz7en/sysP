from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Avg, Count, Sum, Q
from datetime import datetime, timedelta

from .models import (
    LearningAnalytics, DropoutPrediction, PerformanceTrends,
    InstitutionalAnalytics, LearningEffectivenessMetrics, AdmissionOutcomeAnalysis
)

User = get_user_model()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def system_analytics(request):
    """Get system-wide analytics (Admin only)"""
    if request.user.user_type != 'admin':
        return Response({
            'error': 'Permission denied. Admin access required.'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        # Get latest institutional analytics
        latest_analytics = InstitutionalAnalytics.objects.last()

        if not latest_analytics:
            return Response({
                'message': 'No analytics data available yet'
            }, status=status.HTTP_200_OK)

        analytics_data = {
            'total_students': latest_analytics.total_students,
            'new_enrollments': latest_analytics.new_enrollments,
            'active_students': latest_analytics.active_students,
            'dropout_rate': latest_analytics.dropout_rate,
            'average_gpa': latest_analytics.average_gpa,
            'pass_rate': latest_analytics.pass_rate,
            'completion_rate': latest_analytics.completion_rate,
            'last_updated': latest_analytics.analysis_date
        }

        return Response(analytics_data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'error': f'Failed to fetch analytics: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def student_performance_analytics(request):
    """Get student performance analytics"""
    try:
        if request.user.user_type == 'student':
            # Students can only see their own analytics
            try:
                from students.models import StudentProfile
                student_profile = StudentProfile.objects.get(user=request.user)
                analytics = LearningAnalytics.objects.filter(
                    student=student_profile
                ).order_by('-date')[:30]  # Last 30 days

            except StudentProfile.DoesNotExist:
                return Response({
                    'error': 'Student profile not found'
                }, status=status.HTTP_404_NOT_FOUND)

        elif request.user.user_type in ['teacher', 'admin']:
            # Teachers and admins can see all student analytics
            analytics = LearningAnalytics.objects.all().order_by('-date')[:100]
        else:
            return Response({
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)

        analytics_data = []
        for record in analytics:
            analytics_data.append({
                'student_name': record.student.user.get_full_name(),
                'date': record.date,
                'time_spent': record.time_spent.total_seconds() / 3600 if record.time_spent else 0,  # Convert to hours
                'engagement_level': record.engagement_level,
                'average_quiz_score': record.average_quiz_score,
                'learning_velocity': record.learning_velocity
            })

        return Response({
            'analytics': analytics_data,
            'count': len(analytics_data)
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'error': f'Failed to fetch student analytics: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def usage_metrics(request):
    """Get usage metrics"""
    try:
        if request.user.user_type not in ['admin', 'teacher']:
            return Response({
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)

        # Get basic usage metrics from existing data
        thirty_days_ago = datetime.now().date() - timedelta(days=30)

        # Get user activity metrics
        total_users = User.objects.count()
        active_users = User.objects.filter(
            last_login__gte=datetime.now() - timedelta(days=30)
        ).count()

        # Get learning analytics metrics
        recent_learning_data = LearningAnalytics.objects.filter(
            date__gte=thirty_days_ago
        )

        total_sessions = recent_learning_data.count()
        total_time_spent = sum([
            record.time_spent.total_seconds() / 3600 if record.time_spent else 0
            for record in recent_learning_data
        ])

        # Calculate average engagement
        avg_engagement = recent_learning_data.aggregate(
            avg_quiz_attempts=Avg('quiz_attempts'),
            avg_content_interactions=Avg('content_interactions'),
            avg_discussion_posts=Avg('discussion_posts')
        )

        metrics_data = {
            'period': '30 days',
            'total_users': total_users,
            'active_users': active_users,
            'activity_rate': (active_users / total_users * 100) if total_users > 0 else 0,
            'total_learning_sessions': total_sessions,
            'total_hours_spent': round(total_time_spent, 2),
            'average_session_time': round(total_time_spent / total_sessions, 2) if total_sessions > 0 else 0,
            'engagement_metrics': {
                'avg_quiz_attempts': avg_engagement['avg_quiz_attempts'] or 0,
                'avg_content_interactions': avg_engagement['avg_content_interactions'] or 0,
                'avg_discussion_posts': avg_engagement['avg_discussion_posts'] or 0
            },
            'user_distribution': {
                'students': User.objects.filter(user_type='student').count(),
                'teachers': User.objects.filter(user_type='teacher').count(),
                'admins': User.objects.filter(user_type='admin').count()
            }
        }

        return Response({
            'metrics': metrics_data,
            'last_updated': datetime.now()
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'error': f'Failed to fetch usage metrics: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DashboardAnalyticsView(APIView):
    """Analytics for dashboard display"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            user_type = request.user.user_type

            if user_type == 'admin':
                return self.get_admin_analytics()
            elif user_type == 'teacher':
                return self.get_teacher_analytics(request.user)
            elif user_type == 'student':
                return self.get_student_analytics(request.user)
            else:
                return Response({
                    'error': 'Invalid user type'
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                'error': f'Failed to fetch analytics: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_admin_analytics(self):
        """Get admin analytics"""
        total_users = User.objects.count()
        active_users = User.objects.filter(last_login__gte=datetime.now() - timedelta(days=30)).count()

        # Get growth metrics
        current_month_users = User.objects.filter(
            date_joined__gte=datetime.now().replace(day=1)
        ).count()

        analytics = {
            'total_users': total_users,
            'active_users': active_users,
            'new_users_this_month': current_month_users,
            'activity_rate': round((active_users / total_users * 100), 2) if total_users > 0 else 0,
            'user_breakdown': {
                'students': User.objects.filter(user_type='student').count(),
                'teachers': User.objects.filter(user_type='teacher').count(),
                'admins': User.objects.filter(user_type='admin').count()
            },
            'system_health': {
                'pending_teacher_approvals': User.objects.filter(
                    user_type='teacher',
                    approval_status='pending'
                ).count() if hasattr(User._meta.get_field('approval_status'), 'choices') else 0
            }
        }

        return Response(analytics, status=status.HTTP_200_OK)

    def get_teacher_analytics(self, user):
        """Get teacher-specific analytics"""
        try:
            from teachers.models import TeacherProfile
            from courses.models import Course, CourseEnrollment

            teacher_profile = TeacherProfile.objects.get(user=user)
            teacher_courses = Course.objects.filter(instructor=teacher_profile)

            total_students = CourseEnrollment.objects.filter(
                course__in=teacher_courses,
                status='active'
            ).count()

            # Get recent activity
            recent_enrollments = CourseEnrollment.objects.filter(
                course__in=teacher_courses,
                enrollment_date__gte=datetime.now() - timedelta(days=30)
            ).count()

            analytics = {
                'courses_count': teacher_courses.count(),
                'students_count': total_students,
                'new_enrollments_month': recent_enrollments,
                'average_rating': float(teacher_profile.teaching_rating),
                'course_completion_rate': float(teacher_profile.course_completion_rate),
                'department': teacher_profile.department,
                'experience_years': teacher_profile.experience_years
            }

            return Response(analytics, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': f'Teacher analytics not available: {str(e)}'
            }, status=status.HTTP_404_NOT_FOUND)

    def get_student_analytics(self, user):
        """Get student-specific analytics"""
        try:
            from students.models import StudentProfile
            from courses.models import CourseEnrollment

            student_profile = StudentProfile.objects.get(user=user)
            enrollments = CourseEnrollment.objects.filter(student=student_profile, status='active')

            # Get learning analytics
            recent_learning = LearningAnalytics.objects.filter(
                student=student_profile,
                date__gte=datetime.now().date() - timedelta(days=30)
            )

            total_study_time = sum([
                record.time_spent.total_seconds() / 3600 if record.time_spent else 0
                for record in recent_learning
            ])

            avg_engagement = recent_learning.aggregate(
                avg_score=Avg('average_quiz_score')
            )['avg_score'] or 0

            analytics = {
                'academic_info': {
                    'student_id': student_profile.student_id,
                    'current_gpa': float(student_profile.current_gpa),
                    'total_credits': student_profile.total_credits,
                    'academic_status': student_profile.academic_status,
                    'grade_level': student_profile.grade_level
                },
                'current_semester': {
                    'enrolled_courses': enrollments.count(),
                    'study_hours_month': round(total_study_time, 2),
                    'average_performance': round(avg_engagement, 2)
                },
                'learning_preferences': {
                    'learning_style': student_profile.learning_style,
                    'preferred_difficulty': student_profile.preferred_difficulty
                }
            }

            return Response(analytics, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': f'Student analytics not available: {str(e)}'
            }, status=status.HTTP_404_NOT_FOUND)
