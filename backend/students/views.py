from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Q, Avg, Count, Sum
from django.utils import timezone
from datetime import datetime, timedelta, date

from .models import StudentProfile, AcademicRecord, AttendanceRecord, LearningProgress, StudentBehaviorMetrics
from .serializers import StudentProfileSerializer
from courses.models import Course, CourseEnrollment
from assessments.models import Assessment, StudentAssessmentAttempt
from analytics.models import LearningAnalytics
from career.models import JobMarketData

User = get_user_model()


class StudentProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for student profiles"""
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type == 'student':
            return StudentProfile.objects.filter(user=self.request.user)
        elif self.request.user.user_type in ['teacher', 'admin']:
            return StudentProfile.objects.all()
        return StudentProfile.objects.none()


class StudentDashboardView(APIView):
    """Student dashboard with REAL data only"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.user_type != 'student':
            return Response({
                'error': 'This endpoint is only accessible to students'
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            student_profile = StudentProfile.objects.get(user=request.user)
        except StudentProfile.DoesNotExist:
            return Response({
                'error': 'Student profile not found'
            }, status=status.HTTP_404_NOT_FOUND)

        # Get REAL enrollments only
        enrollments = CourseEnrollment.objects.filter(
            student=student_profile,
            status='active'
        ).select_related('course', 'course__instructor__user')

        # Only return data if it exists
        dashboard_data = {
            'student_info': {
                'student_id': student_profile.student_id,
                'name': f"{request.user.first_name} {request.user.last_name}",
                'grade_level': student_profile.grade_level,
                'current_gpa': float(student_profile.current_gpa),
                'academic_status': student_profile.academic_status
            },
            'enrollments_count': enrollments.count(),
            'has_courses': enrollments.exists()
        }

        return Response(dashboard_data, status=status.HTTP_200_OK)


class AcademicRecordsView(APIView):
    """REAL Academic Records - only shows actual enrollments and grades"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.user_type != 'student':
            return Response({'error': 'Student access only'}, status=status.HTTP_403_FORBIDDEN)

        try:
            student_profile = StudentProfile.objects.get(user=request.user)

            # Get REAL enrollments only
            enrollments = CourseEnrollment.objects.filter(
                student=student_profile,
                status='active'
            ).select_related('course', 'course__instructor__user')

            if not enrollments.exists():
                return Response({
                    'academic_records': [],
                    'summary': {
                        'message': 'No courses enrolled yet',
                        'current_gpa': 0.0,
                        'total_credits': 0,
                        'total_courses': 0
                    }
                })

            academic_records = []
            total_credits = 0

            for enrollment in enrollments:
                # Only show grades if teacher has actually submitted them
                submitted_attempts = StudentAssessmentAttempt.objects.filter(
                    student=student_profile,
                    assessment__course=enrollment.course,
                    status='graded'  # Only graded by teacher
                )

                if submitted_attempts.exists():
                    avg_score = submitted_attempts.aggregate(avg=Avg('percentage'))['avg']
                    grade, gpa_points = self.calculate_grade(avg_score)
                else:
                    # No grade yet - show as in progress
                    grade = 'In Progress'
                    gpa_points = 0.0

                total_credits += enrollment.course.credits

                academic_records.append({
                    'course_title': enrollment.course.title,
                    'course_code': enrollment.course.code,
                    'instructor': enrollment.course.instructor.user.get_full_name(),
                    'semester': 'Fall 2024',
                    'grade': grade,
                    'credits': enrollment.course.credits,
                    'progress_percentage': float(enrollment.progress_percentage),
                    'enrollment_date': enrollment.enrollment_date.strftime('%Y-%m-%d'),
                    'has_submitted_work': submitted_attempts.exists()
                })

            # Calculate GPA only from graded courses
            graded_courses = [r for r in academic_records if r['grade'] != 'In Progress']
            current_gpa = 0.0
            if graded_courses:
                total_points = sum(self.calculate_grade_points(r['grade']) * r['credits'] for r in graded_courses)
                total_graded_credits = sum(r['credits'] for r in graded_courses)
                current_gpa = total_points / total_graded_credits if total_graded_credits > 0 else 0.0

            return Response({
                'academic_records': academic_records,
                'summary': {
                    'current_gpa': round(current_gpa, 2),
                    'total_credits': total_credits,
                    'total_courses': enrollments.count(),
                    'graded_courses': len(graded_courses),
                    'in_progress_courses': len(academic_records) - len(graded_courses)
                }
            })

        except StudentProfile.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)

    def calculate_grade(self, percentage):
        """Convert percentage to letter grade and GPA points"""
        if percentage >= 93:
            return 'A', 4.0
        elif percentage >= 90:
            return 'A-', 3.7
        elif percentage >= 87:
            return 'B+', 3.3
        elif percentage >= 83:
            return 'B', 3.0
        elif percentage >= 80:
            return 'B-', 2.7
        elif percentage >= 77:
            return 'C+', 2.3
        elif percentage >= 73:
            return 'C', 2.0
        elif percentage >= 70:
            return 'C-', 1.7
        elif percentage >= 60:
            return 'D', 1.0
        else:
            return 'F', 0.0

    def calculate_grade_points(self, grade):
        """Convert letter grade to GPA points"""
        grade_map = {
            'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
            'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0.0
        }
        return grade_map.get(grade, 0.0)


class AdaptiveLearningView(APIView):
    """REAL Adaptive Learning - only actual course data"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.user_type != 'student':
            return Response({'error': 'Student access only'}, status=status.HTTP_403_FORBIDDEN)

        try:
            student_profile = StudentProfile.objects.get(user=request.user)

            # Get real course enrollments only
            enrollments = CourseEnrollment.objects.filter(
                student=student_profile,
                status='active'
            ).select_related('course')

            if not enrollments.exists():
                return Response({
                    'learning_paths': [],
                    'message': 'No active courses. Enroll in courses to see adaptive learning paths.',
                    'student_learning_style': student_profile.learning_style or 'Not set',
                    'overall_progress': 0
                })

            learning_paths = []
            for enrollment in enrollments:
                learning_paths.append({
                    'course_title': enrollment.course.title,
                    'course_code': enrollment.course.code,
                    'difficulty_level': enrollment.course.difficulty_level.title() if hasattr(enrollment.course,
                                                                                              'difficulty_level') else 'Intermediate',
                    'progress_percentage': float(enrollment.progress_percentage),
                    'estimated_completion': enrollment.course.end_date.strftime('%Y-%m-%d'),
                    'learning_objectives': enrollment.course.learning_objectives or [],
                    'duration_weeks': enrollment.course.duration_weeks if hasattr(enrollment.course,
                                                                                  'duration_weeks') else 12,
                    'credits': enrollment.course.credits
                })

            overall_progress = enrollments.aggregate(avg_progress=Avg('progress_percentage'))['avg_progress'] or 0

            return Response({
                'learning_paths': learning_paths,
                'student_learning_style': student_profile.learning_style or 'adaptive',
                'preferred_difficulty': student_profile.preferred_difficulty,
                'overall_progress': round(float(overall_progress), 1),
                'total_courses': enrollments.count()
            })

        except StudentProfile.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)


class CareerGuidanceView(APIView):
    """REAL Career Guidance - actual job market data only"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.user_type != 'student':
            return Response({'error': 'Student access only'}, status=status.HTTP_403_FORBIDDEN)

        try:
            student_profile = StudentProfile.objects.get(user=request.user)

            # Get real job market data from database
            job_opportunities = JobMarketData.objects.all().order_by('-growth_rate')

            if not job_opportunities.exists():
                return Response({
                    'job_opportunities': [],
                    'message': 'No job market data available yet.',
                    'skill_assessment': {},
                    'career_paths': []
                })

            opportunities = []
            for job in job_opportunities:
                opportunities.append({
                    'job_title': job.job_title,
                    'industry': job.industry,
                    'location': job.location,
                    'average_salary': job.average_salary,
                    'required_skills': job.required_skills,
                    'growth_rate': job.growth_rate,
                    'demand_level': getattr(job, 'demand_level', 'Medium'),
                    'last_updated': job.last_updated.strftime('%Y-%m-%d') if hasattr(job, 'last_updated') else 'N/A'
                })

            # Get student's actual courses for skill assessment
            enrollments = CourseEnrollment.objects.filter(
                student=student_profile,
                status='active'
            ).select_related('course')

            skill_assessment = {}
            for enrollment in enrollments:
                course_title = enrollment.course.title.lower()
                progress = float(enrollment.progress_percentage)

                if 'python' in course_title:
                    skill_assessment['Python Programming'] = progress
                elif 'data' in course_title:
                    skill_assessment['Data Analysis'] = progress
                elif 'math' in course_title:
                    skill_assessment['Mathematics'] = progress
                elif 'computer' in course_title or 'programming' in course_title:
                    skill_assessment['Programming'] = progress

            return Response({
                'job_opportunities': opportunities,
                'skill_assessment': skill_assessment,
                'enrolled_courses': [e.course.title for e in enrollments],
                'total_jobs_available': job_opportunities.count()
            })

        except StudentProfile.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)


class AssessmentsView(APIView):
    """REAL Assessments - only actual teacher-created assessments"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.user_type != 'student':
            return Response({'error': 'Student access only'}, status=status.HTTP_403_FORBIDDEN)

        try:
            student_profile = StudentProfile.objects.get(user=request.user)

            # Get enrolled courses
            enrollments = CourseEnrollment.objects.filter(
                student=student_profile,
                status='active'
            ).select_related('course')

            if not enrollments.exists():
                return Response({
                    'upcoming_assessments': [],
                    'recent_results': [],
                    'message': 'No courses enrolled. Enroll in courses to see assessments.',
                    'summary': {
                        'total_upcoming': 0,
                        'completed_this_month': 0,
                        'average_score': 0
                    }
                })

            enrolled_courses = [enrollment.course for enrollment in enrollments]

            # Get actual assessments created by teachers
            upcoming_assessments = Assessment.objects.filter(
                course__in=enrolled_courses,
                available_until__gte=timezone.now()
            ).order_by('available_until')

            # Check which assessments student has already completed
            student_attempts = StudentAssessmentAttempt.objects.filter(
                student=student_profile,
                status__in=['submitted', 'graded']
            ).values_list('assessment_id', flat=True)

            assessments_data = []
            for assessment in upcoming_assessments:
                if assessment.id not in student_attempts:
                    assessments_data.append({
                        'id': assessment.id,
                        'title': assessment.title,
                        'course': assessment.course.title,
                        'type': assessment.type,
                        'total_marks': assessment.total_marks,
                        'due_date': assessment.available_until.strftime('%Y-%m-%d'),
                        'description': assessment.description,
                        'created_by_teacher': assessment.course.instructor.user.get_full_name()
                    })

            # Get completed assessments with results
            completed_attempts = StudentAssessmentAttempt.objects.filter(
                student=student_profile,
                status='graded'
            ).select_related('assessment', 'assessment__course').order_by('-submitted_at')

            recent_results = []
            for attempt in completed_attempts:
                recent_results.append({
                    'assessment_title': attempt.assessment.title,
                    'course': attempt.assessment.course.title,
                    'score': float(attempt.percentage) if attempt.percentage else 0,
                    'total_marks': attempt.assessment.total_marks,
                    'submitted_at': attempt.submitted_at.strftime('%Y-%m-%d %H:%M') if attempt.submitted_at else 'N/A',
                    'graded_by': attempt.assessment.course.instructor.user.get_full_name()
                })

            avg_score = completed_attempts.aggregate(avg=Avg('percentage'))['avg'] or 0

            return Response({
                'upcoming_assessments': assessments_data,
                'recent_results': recent_results,
                'summary': {
                    'total_upcoming': len(assessments_data),
                    'completed_total': completed_attempts.count(),
                    'average_score': round(float(avg_score), 1) if avg_score else 0,
                    'enrolled_courses': len(enrolled_courses)
                }
            })

        except StudentProfile.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)


class LearningInsightsView(APIView):
    """REAL Learning Insights - only actual tracked data"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.user_type != 'student':
            return Response({'error': 'Student access only'}, status=status.HTTP_403_FORBIDDEN)

        try:
            student_profile = StudentProfile.objects.get(user=request.user)

            # Get real analytics data only
            thirty_days_ago = timezone.now().date() - timedelta(days=30)
            analytics = LearningAnalytics.objects.filter(
                student=student_profile,
                date__gte=thirty_days_ago
            ).order_by('-date')

            if not analytics.exists():
                return Response({
                    'performance_metrics': {
                        'message': 'No learning data recorded yet. Start studying to see insights!',
                        'total_study_hours': 0,
                        'average_session_minutes': 0,
                        'retention_rate': 0,
                        'focus_score': 0
                    },
                    'course_performance': [],
                    'learning_patterns': {
                        'message': 'No learning patterns available yet'
                    },
                    'recommendations': ['Start taking courses to see personalized learning insights']
                })

            # Calculate real metrics from actual data
            total_study_time = analytics.aggregate(
                total_time=Sum('time_spent')
            )['total_time'] or timedelta(0)

            total_hours = total_study_time.total_seconds() / 3600
            avg_session = total_hours / max(analytics.count(), 1)

            # Get course performance from actual enrollments
            enrollments = CourseEnrollment.objects.filter(
                student=student_profile,
                status='active'
            ).select_related('course')

            course_performance = []
            for enrollment in enrollments:
                assessment_scores = StudentAssessmentAttempt.objects.filter(
                    student=student_profile,
                    assessment__course=enrollment.course,
                    status='graded'
                ).aggregate(avg_score=Avg('percentage'))

                avg_score = assessment_scores['avg_score']
                if avg_score is not None:
                    course_performance.append({
                        'course_name': enrollment.course.title,
                        'score_percentage': round(float(avg_score), 0),
                        'assessments_completed': StudentAssessmentAttempt.objects.filter(
                            student=student_profile,
                            assessment__course=enrollment.course,
                            status='graded'
                        ).count()
                    })

            return Response({
                'performance_metrics': {
                    'total_study_hours': round(total_hours, 0),
                    'average_session_minutes': round(avg_session * 60, 0),
                    'days_active': analytics.count(),
                    'total_sessions': analytics.count()
                },
                'course_performance': course_performance,
                'learning_patterns': {
                    'most_active_days': analytics.count(),
                    'engagement_levels': list(analytics.values_list('engagement_level', flat=True))
                },
                'data_period': f'Last {analytics.count()} days with recorded activity'
            })

        except StudentProfile.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)
