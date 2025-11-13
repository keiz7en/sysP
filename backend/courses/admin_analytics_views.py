"""
Admin Dashboard Analytics Views
Provides comprehensive analytics for admin dashboard
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Avg, Q, F
from django.db.models.functions import TruncMonth, TruncWeek
from django.utils import timezone
from datetime import timedelta

from .models import (
    Course, CourseEnrollment, Assignment, AssignmentSubmission,
    Grade, TeacherRating, Certificate, StudentFeedback, ActivityLog
)
from students.models import StudentProfile
from teachers.models import TeacherProfile


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_admin_dashboard_stats(request):
    """Get comprehensive dashboard statistics for admin"""
    if request.user.user_type != 'admin':
        return Response({
            'error': 'Admin access required'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        # Overall statistics
        total_students = StudentProfile.objects.filter(user__is_active=True).count()
        total_teachers = TeacherProfile.objects.filter(status='approved').count()
        total_courses = Course.objects.filter(status__in=['active', 'approved']).count()
        total_enrollments = CourseEnrollment.objects.filter(status__in=['active', 'completed']).count()

        # Active students (enrolled in at least one course)
        active_students = CourseEnrollment.objects.filter(
            status='active'
        ).values('student').distinct().count()

        # Course completion rate
        completed_enrollments = CourseEnrollment.objects.filter(status='completed').count()
        completion_rate = (completed_enrollments / total_enrollments * 100) if total_enrollments > 0 else 0

        # Average grades
        avg_grade_score = Grade.objects.filter(is_published=True).aggregate(
            avg=Avg('final_score')
        )['avg'] or 0

        # Grade distribution
        grade_distribution = Grade.objects.filter(is_published=True).values('letter_grade').annotate(
            count=Count('id')
        ).order_by('letter_grade')

        # Teacher performance metrics
        avg_teacher_rating = TeacherRating.objects.aggregate(
            avg=Avg('rating')
        )['avg'] or 0

        # Recent activity (last 7 days)
        week_ago = timezone.now() - timedelta(days=7)
        recent_activity = {
            'new_enrollments': CourseEnrollment.objects.filter(enrollment_date__gte=week_ago).count(),
            'grades_published': Grade.objects.filter(published_at__gte=week_ago).count(),
            'certificates_issued': Certificate.objects.filter(created_at__gte=week_ago).count(),
            'ai_feedbacks_generated': StudentFeedback.objects.filter(generated_at__gte=week_ago).count()
        }

        # Top performing students
        top_students = Grade.objects.filter(
            is_published=True
        ).values(
            'student__user__first_name',
            'student__user__last_name',
            'student__student_id'
        ).annotate(
            avg_score=Avg('final_score'),
            courses_completed=Count('id')
        ).order_by('-avg_score')[:10]

        # Top rated teachers
        top_teachers = TeacherRating.objects.values(
            'teacher__user__first_name',
            'teacher__user__last_name',
            'teacher__employee_id'
        ).annotate(
            avg_rating=Avg('rating'),
            total_ratings=Count('id')
        ).filter(total_ratings__gte=3).order_by('-avg_rating')[:10]

        # Enrollment trends (last 6 months by month)
        six_months_ago = timezone.now() - timedelta(days=180)
        enrollment_trends = CourseEnrollment.objects.filter(
            enrollment_date__gte=six_months_ago
        ).annotate(
            month=TruncMonth('enrollment_date')
        ).values('month').annotate(
            count=Count('id')
        ).order_by('month')

        # Course popularity
        popular_courses = CourseEnrollment.objects.filter(
            status__in=['active', 'completed']
        ).values(
            'course__title',
            'course__code'
        ).annotate(
            enrollment_count=Count('id'),
            completion_rate=Count('id', filter=Q(status='completed')) * 100.0 / Count('id')
        ).order_by('-enrollment_count')[:10]

        # Dropout prediction (students with low progress and no recent activity)
        at_risk_students = CourseEnrollment.objects.filter(
            status='active',
            completion_percentage__lt=30,
            updated_at__lt=timezone.now() - timedelta(days=14)
        ).select_related('student__user', 'course').count()

        # AI feedback insights
        ai_feedback_stats = StudentFeedback.objects.aggregate(
            total=Count('id'),
            high_risk=Count('id', filter=Q(risk_level='high')),
            medium_risk=Count('id', filter=Q(risk_level='medium')),
            low_risk=Count('id', filter=Q(risk_level='low')),
            avg_confidence=Avg('confidence_score')
        )

        # Certificate statistics
        certificate_stats = Certificate.objects.aggregate(
            total_issued=Count('id'),
            this_month=Count('id', filter=Q(
                issue_date__gte=timezone.now().replace(day=1)
            ))
        )

        return Response({
            'overview': {
                'total_students': total_students,
                'active_students': active_students,
                'total_teachers': total_teachers,
                'total_courses': total_courses,
                'total_enrollments': total_enrollments,
                'completion_rate': round(completion_rate, 2)
            },
            'performance': {
                'average_grade': round(float(avg_grade_score), 2),
                'average_teacher_rating': round(float(avg_teacher_rating), 2),
                'grade_distribution': list(grade_distribution),
                'at_risk_students': at_risk_students
            },
            'recent_activity': recent_activity,
            'top_performers': {
                'students': [
                    {
                        'name': f"{s['student__user__first_name']} {s['student__user__last_name']}",
                        'student_id': s['student__student_id'],
                        'avg_score': round(float(s['avg_score']), 2),
                        'courses_completed': s['courses_completed']
                    }
                    for s in top_students
                ],
                'teachers': [
                    {
                        'name': f"{t['teacher__user__first_name']} {t['teacher__user__last_name']}",
                        'employee_id': t['teacher__employee_id'],
                        'avg_rating': round(float(t['avg_rating']), 2),
                        'total_ratings': t['total_ratings']
                    }
                    for t in top_teachers
                ]
            },
            'trends': {
                'enrollments': [
                    {
                        'month': trend['month'].strftime('%Y-%m'),
                        'count': trend['count']
                    }
                    for trend in enrollment_trends
                ],
                'popular_courses': [
                    {
                        'course': f"{c['course__code']} - {c['course__title']}",
                        'enrollments': c['enrollment_count'],
                        'completion_rate': round(float(c['completion_rate']), 2)
                    }
                    for c in popular_courses
                ]
            },
            'ai_insights': {
                'total_feedbacks': ai_feedback_stats['total'] or 0,
                'risk_distribution': {
                    'high': ai_feedback_stats['high_risk'] or 0,
                    'medium': ai_feedback_stats['medium_risk'] or 0,
                    'low': ai_feedback_stats['low_risk'] or 0
                },
                'avg_confidence': round(float(ai_feedback_stats['avg_confidence'] or 0), 2),
                'at_risk_students': at_risk_students
            },
            'certificates': {
                'total_issued': certificate_stats['total_issued'] or 0,
                'issued_this_month': certificate_stats['this_month'] or 0
            }
        })

    except Exception as e:
        return Response({
            'error': f'Failed to fetch dashboard stats: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_activity_logs(request):
    """Get recent activity logs"""
    if request.user.user_type != 'admin':
        return Response({
            'error': 'Admin access required'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        limit = int(request.GET.get('limit', 50))
        action_type = request.GET.get('action_type', None)

        logs = ActivityLog.objects.select_related('user').order_by('-timestamp')

        if action_type:
            logs = logs.filter(action_type=action_type)

        logs = logs[:limit]

        logs_data = []
        for log in logs:
            logs_data.append({
                'id': log.id,
                'user': log.user.get_full_name() if log.user else 'System',
                'action_type': log.action_type,
                'description': log.description,
                'target_model': log.target_model,
                'timestamp': log.timestamp.isoformat(),
                'ip_address': log.ip_address,
                'metadata': log.metadata
            })

        return Response({
            'activity_logs': logs_data,
            'total': len(logs_data)
        })

    except Exception as e:
        return Response({
            'error': f'Failed to fetch activity logs: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_course_analytics(request, course_id):
    """Get detailed analytics for a specific course"""
    if request.user.user_type not in ['admin', 'teacher']:
        return Response({
            'error': 'Admin or teacher access required'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        course = Course.objects.get(id=course_id)

        # Enrollment statistics
        total_enrolled = CourseEnrollment.objects.filter(course=course).count()
        active_enrolled = CourseEnrollment.objects.filter(
            course=course,
            status='active'
        ).count()
        completed = CourseEnrollment.objects.filter(
            course=course,
            status='completed'
        ).count()

        # Completion rate
        completion_rate = (completed / total_enrolled * 100) if total_enrolled > 0 else 0

        # Average completion percentage for active students
        avg_progress = CourseEnrollment.objects.filter(
            course=course,
            status='active'
        ).aggregate(avg=Avg('completion_percentage'))['avg'] or 0

        # Grade statistics
        grades_stats = Grade.objects.filter(
            course=course,
            is_published=True
        ).aggregate(
            avg_score=Avg('final_score'),
            total_graded=Count('id')
        )

        # Assignment statistics
        assignments = Assignment.objects.filter(course=course)
        assignment_stats = {
            'total': assignments.count(),
            'by_type': assignments.values('assignment_type').annotate(
                count=Count('id')
            )
        }

        # Submission rate
        total_expected_submissions = assignments.count() * active_enrolled
        actual_submissions = AssignmentSubmission.objects.filter(
            assignment__course=course
        ).count()
        submission_rate = (
                    actual_submissions / total_expected_submissions * 100) if total_expected_submissions > 0 else 0

        # Teacher rating for this course
        course_ratings = TeacherRating.objects.filter(course=course)
        rating_stats = course_ratings.aggregate(
            avg_rating=Avg('rating'),
            total_ratings=Count('id')
        )

        # Student performance distribution
        grade_distribution = Grade.objects.filter(
            course=course,
            is_published=True
        ).values('letter_grade').annotate(
            count=Count('id')
        ).order_by('letter_grade')

        return Response({
            'course': {
                'id': course.id,
                'title': course.title,
                'code': course.code,
                'instructor': course.instructor.user.get_full_name(),
                'status': course.status
            },
            'enrollment': {
                'total': total_enrolled,
                'active': active_enrolled,
                'completed': completed,
                'completion_rate': round(completion_rate, 2),
                'avg_progress': round(float(avg_progress), 2)
            },
            'performance': {
                'avg_score': round(float(grades_stats['avg_score'] or 0), 2),
                'total_graded': grades_stats['total_graded'] or 0,
                'grade_distribution': list(grade_distribution)
            },
            'assignments': {
                'total': assignment_stats['total'],
                'by_type': list(assignment_stats['by_type']),
                'submission_rate': round(submission_rate, 2)
            },
            'ratings': {
                'avg_rating': round(float(rating_stats['avg_rating'] or 0), 2),
                'total_ratings': rating_stats['total_ratings'] or 0
            }
        })

    except Course.DoesNotExist:
        return Response({
            'error': 'Course not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to fetch course analytics: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_student_risk_analysis(request):
    """Get list of at-risk students with predictive analytics"""
    if request.user.user_type != 'admin':
        return Response({
            'error': 'Admin access required'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        # Find at-risk students based on multiple factors
        two_weeks_ago = timezone.now() - timedelta(days=14)

        at_risk_enrollments = CourseEnrollment.objects.filter(
            Q(status='active') &
            (
                    Q(completion_percentage__lt=30, updated_at__lt=two_weeks_ago) |  # Low progress, no activity
                    Q(completion_percentage__lt=50, enrollment_date__lt=timezone.now() - timedelta(days=60))
            # Slow progress
            )
        ).select_related('student__user', 'course')

        risk_data = []
        for enrollment in at_risk_enrollments:
            # Get latest AI feedback if available
            latest_feedback = StudentFeedback.objects.filter(
                student=enrollment.student,
                enrollment=enrollment
            ).order_by('-generated_at').first()

            # Calculate risk score (0-100)
            risk_score = 0
            risk_factors = []

            # Factor 1: Low completion percentage
            if enrollment.completion_percentage < 20:
                risk_score += 40
                risk_factors.append('Very low progress (<20%)')
            elif enrollment.completion_percentage < 50:
                risk_score += 25
                risk_factors.append('Low progress (<50%)')

            # Factor 2: Inactive for 2+ weeks
            days_since_update = (timezone.now() - enrollment.updated_at).days
            if days_since_update > 30:
                risk_score += 30
                risk_factors.append(f'Inactive for {days_since_update} days')
            elif days_since_update > 14:
                risk_score += 20
                risk_factors.append(f'Inactive for {days_since_update} days')

            # Factor 3: Poor recent performance
            recent_submissions = AssignmentSubmission.objects.filter(
                student=enrollment.student,
                assignment__course=enrollment.course,
                points_earned__isnull=False
            ).order_by('-submitted_at')[:3]

            if recent_submissions.exists():
                avg_recent_score = sum(s.percentage_score for s in recent_submissions) / len(recent_submissions)
                if avg_recent_score < 60:
                    risk_score += 20
                    risk_factors.append(f'Low recent scores ({avg_recent_score:.1f}%)')

            # Factor 4: AI feedback indicates high risk
            if latest_feedback and latest_feedback.risk_level == 'high':
                risk_score += 10
                risk_factors.append('AI identified as high risk')

            risk_level = 'critical' if risk_score >= 70 else 'high' if risk_score >= 50 else 'medium'

            risk_data.append({
                'student': {
                    'name': enrollment.student.user.get_full_name(),
                    'id': enrollment.student.student_id,
                    'email': enrollment.student.user.email
                },
                'course': {
                    'title': enrollment.course.title,
                    'code': enrollment.course.code
                },
                'risk_score': min(risk_score, 100),
                'risk_level': risk_level,
                'risk_factors': risk_factors,
                'current_progress': float(enrollment.completion_percentage),
                'days_inactive': days_since_update,
                'enrollment_id': enrollment.id,
                'recommended_actions': [
                    'Send personalized encouragement email',
                    'Schedule one-on-one meeting with instructor',
                    'Provide additional learning resources',
                    'Consider peer mentoring program'
                ]
            })

        # Sort by risk score
        risk_data.sort(key=lambda x: x['risk_score'], reverse=True)

        return Response({
            'at_risk_students': risk_data,
            'total_at_risk': len(risk_data),
            'risk_distribution': {
                'critical': len([r for r in risk_data if r['risk_level'] == 'critical']),
                'high': len([r for r in risk_data if r['risk_level'] == 'high']),
                'medium': len([r for r in risk_data if r['risk_level'] == 'medium'])
            }
        })

    except Exception as e:
        return Response({
            'error': f'Failed to analyze student risk: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
