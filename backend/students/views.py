from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, permissions, viewsets
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Q, Avg, Count, Sum
from datetime import datetime, timedelta
import json

from .models import StudentProfile, AcademicRecord, AttendanceRecord, LearningProgress, StudentBehaviorMetrics
from .serializers import StudentProfileSerializer

# Import Gemini AI service
try:
    from ai_services.gemini_service import gemini_service
except ImportError:
    gemini_service = None
    print("⚠️ Gemini AI service not available in students/views.py")

# Safe imports for other apps
try:
    from courses.models import Course, CourseEnrollment
except ImportError:
    Course = None
    CourseEnrollment = None

try:
    from assessments.models import Assessment, StudentAssessmentAttempt
except ImportError:
    Assessment = None
    StudentAssessmentAttempt = None

try:
    from analytics.models import LearningAnalytics
except ImportError:
    LearningAnalytics = None

try:
    from career.models import JobMarketData
except ImportError:
    JobMarketData = None

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

        # Return comprehensive student dashboard data
        dashboard_data = {
            'student_info': {
                'student_id': student_profile.student_id,
                'name': f"{request.user.first_name} {request.user.last_name}",
                'grade_level': student_profile.grade_level,
                'current_gpa': float(student_profile.current_gpa),
                'total_credits': student_profile.total_credits,
                'academic_status': student_profile.academic_status,
                'learning_style': student_profile.learning_style,
                'enrollment_date': student_profile.enrollment_date.strftime('%Y-%m-%d')
            },
            'enrollments_count': enrollments.count(),
            'has_courses': enrollments.exists(),
            'is_new_student': not enrollments.exists(),
            'message': 'No courses enrolled yet. Teachers will add you to courses.' if not enrollments.exists() else None
        }

        # If student has courses, add enrollment details
        if enrollments.exists():
            enrollments_data = []
            for enrollment in enrollments:
                enrollments_data.append({
                    'course_title': enrollment.course.title,
                    'course_code': enrollment.course.code,
                    'instructor_name': enrollment.course.instructor.user.get_full_name(),
                    'progress_percentage': float(enrollment.progress_percentage),
                    'enrollment_date': enrollment.enrollment_date.strftime('%Y-%m-%d'),
                    'status': enrollment.status
                })
            dashboard_data['current_enrollments'] = enrollments_data

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


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_academic_transcript(request):
    """Generate automated academic transcript"""
    try:
        student = request.user.student_profile
        academic_records = student.academic_records.all().order_by('-year', '-semester')

        transcript_data = {
            'student_info': {
                'name': request.user.get_full_name(),
                'student_id': student.student_id,
                'program': 'Computer Science',  # Add program field to model later
                'current_gpa': float(student.current_gpa),
                'total_credits': student.total_credits,
                'academic_status': student.academic_status
            },
            'academic_records': [],
            'semester_summary': {},
            'overall_statistics': {
                'total_courses': 0,
                'credits_earned': student.total_credits,
                'cumulative_gpa': float(student.current_gpa),
                'graduation_progress': min(100, (student.total_credits / 120) * 100)
            }
        }

        # Group by semester/year
        semester_groups = {}
        for record in academic_records:
            key = f"{record.semester} {record.year}"
            if key not in semester_groups:
                semester_groups[key] = []
            semester_groups[key].append({
                'course': record.course.title,
                'course_code': record.course.code,
                'credits': record.credits,
                'grade': record.grade,
                'gpa_points': float(record.gpa_points)
            })

        transcript_data['academic_records'] = semester_groups
        transcript_data['overall_statistics']['total_courses'] = len(academic_records)

        return Response(transcript_data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_ai_progress_analysis(request):
    """AI analysis of academic progress and dropout risk"""
    try:
        student = request.user.student_profile

        # Simulate AI analysis
        progress_analysis = {
            'academic_performance': {
                'current_gpa': float(student.current_gpa),
                'trend': 'improving' if student.current_gpa > 3.0 else 'needs_attention',
                'percentile': min(95, max(5, int((float(student.current_gpa) / 4.0) * 100))),
                'strengths': ['Problem Solving', 'Mathematical Reasoning'],
                'weaknesses': ['Time Management', 'Essay Writing'] if student.current_gpa < 3.5 else []
            },
            'dropout_risk': {
                'risk_level': 'low' if student.current_gpa > 3.0 else 'medium',
                'risk_score': max(0.1, 1.0 - (float(student.current_gpa) / 4.0)),
                'risk_factors': ['Low GPA'] if student.current_gpa < 3.0 else [],
                'protective_factors': ['High Engagement', 'Regular Attendance', 'Good Study Habits'],
                'recommendations': [
                    'Continue current study pattern' if student.current_gpa > 3.5 else 'Consider tutoring support',
                    'Join study groups',
                    'Meet with academic advisor regularly'
                ]
            },
            'learning_velocity': {
                'current_pace': 'optimal',
                'credits_per_semester': 15,
                'projected_graduation': '2025-05-01',
                'acceleration_opportunities': ['Summer courses', 'Online electives']
            },
            'skill_development': {
                'technical_skills': 85,
                'soft_skills': 75,
                'domain_expertise': 80,
                'improvement_areas': ['Communication', 'Leadership']
            }
        }

        return Response(progress_analysis)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_personalized_learning_path(request):
    """AI-generated personalized learning path - Fixed for frontend compatibility"""
    try:
        if request.user.user_type != 'student':
            return Response({'error': 'Student access only'}, status=status.HTTP_403_FORBIDDEN)

        student_profile = StudentProfile.objects.get(user=request.user)

        # Get real enrollments
        enrollments = CourseEnrollment.objects.filter(
            student=student_profile,
            status='active'
        ).select_related('course')

        # If no enrollments, return sample data structure
        if not enrollments.exists():
            sample_learning_data = {
                'learning_paths': [
                    {
                        'id': 1,
                        'course_title': 'Introduction to Computer Science',
                        'current_module': 'Getting Started with Programming',
                        'progress_percentage': 0.0,
                        'difficulty_level': 'Beginner',
                        'learning_style': 'visual',
                        'estimated_completion': '3 months',
                        'next_milestone': 'Complete first programming assignment',
                        'ai_recommendations': [
                            'Start with basic concepts and build foundation',
                            'Practice coding daily for best results',
                            'Use visual learning resources'
                        ],
                        'strengths': ['Logical thinking', 'Problem-solving aptitude'],
                        'areas_for_improvement': ['Programming syntax', 'Algorithm design']
                    },
                    {
                        'id': 2,
                        'course_title': 'Mathematics for Computer Science',
                        'current_module': 'Discrete Mathematics Basics',
                        'progress_percentage': 0.0,
                        'difficulty_level': 'Intermediate',
                        'learning_style': 'kinesthetic',
                        'estimated_completion': '4 months',
                        'next_milestone': 'Master set theory and logic',
                        'ai_recommendations': [
                            'Focus on hands-on problem solving',
                            'Work through plenty of practice problems',
                            'Connect abstract concepts to real applications'
                        ],
                        'strengths': ['Mathematical reasoning', 'Pattern recognition'],
                        'areas_for_improvement': ['Abstract thinking', 'Proof techniques']
                    }
                ],
                'overall_progress': 0.0,
                'learning_style': student_profile.learning_style or 'adaptive',
                'ai_insights': {
                    'learning_velocity': 1.0,
                    'engagement_score': 85.0,
                    'difficulty_preference': student_profile.preferred_difficulty or 'intermediate',
                    'recommended_study_time': 2.5
                }
            }
            return Response(sample_learning_data)

        # Use Gemini AI to generate personalized learning paths
        if gemini_service:
            learning_paths = gemini_service.generate_learning_paths(student_profile, enrollments)
        else:
            # If Gemini AI is not available, use default logic
            learning_paths = []
            total_progress = 0

            for idx, enrollment in enumerate(enrollments):
                course = enrollment.course
                progress = float(enrollment.progress_percentage)
                total_progress += progress

                # Generate AI recommendations based on progress
                ai_recommendations = []
                if progress < 25:
                    ai_recommendations = [
                        'Focus on understanding fundamental concepts',
                        'Complete introductory materials first',
                        'Ask questions during lectures'
                    ]
                elif progress < 50:
                    ai_recommendations = [
                        'Practice applying concepts through exercises',
                        'Review previous materials if needed',
                        'Start working on practical projects'
                    ]
                elif progress < 75:
                    ai_recommendations = [
                        'Focus on advanced topics and applications',
                        'Prepare for assessments and evaluations',
                        'Consider peer tutoring opportunities'
                    ]
                else:
                    ai_recommendations = [
                        'Prepare for final assessments',
                        'Focus on course completion',
                        'Plan next learning steps'
                    ]

                # Determine difficulty level
                difficulty_map = {
                    'beginner': 'Beginner',
                    'intermediate': 'Intermediate',
                    'advanced': 'Advanced',
                    'expert': 'Expert'
                }
                difficulty = difficulty_map.get(
                    getattr(course, 'difficulty_level', 'intermediate').lower(),
                    'Intermediate'
                )

                # Generate next milestone based on progress
                if progress < 25:
                    next_milestone = f"Complete foundational modules of {course.title}"
                elif progress < 50:
                    next_milestone = f"Finish mid-course projects in {course.title}"
                elif progress < 75:
                    next_milestone = f"Prepare for final assessments in {course.title}"
                else:
                    next_milestone = f"Complete {course.title} successfully"

                learning_path = {
                    'id': idx + 1,
                    'course_title': course.title,
                    'current_module': f"Module {int(progress / 25) + 1}: {course.title} Content",
                    'progress_percentage': progress,
                    'difficulty_level': difficulty,
                    'learning_style': student_profile.learning_style or 'adaptive',
                    'estimated_completion': course.end_date.strftime('%B %Y') if hasattr(course,
                                                                                     'end_date') and course.end_date else '4 months',
                    'next_milestone': next_milestone,
                    'ai_recommendations': ai_recommendations,
                    'strengths': [
                        'Consistent study habits',
                        'Good progress pace' if progress > 50 else 'Building foundation'
                    ],
                    'areas_for_improvement': [
                        'Time management' if progress < 30 else 'Advanced concepts',
                        'Practical application' if progress < 60 else 'Exam preparation'
                    ]
                }
                learning_paths.append(learning_path)

        # Calculate overall metrics
        overall_progress = total_progress / len(enrollments) if enrollments else 0

        # Determine learning velocity based on progress
        learning_velocity = 1.2 if overall_progress > 70 else 1.0 if overall_progress > 40 else 0.8

        # Calculate engagement score
        engagement_score = min(100, max(50, overall_progress + 20))

        learning_data = {
            'learning_paths': learning_paths,
            'overall_progress': round(overall_progress, 1),
            'learning_style': student_profile.learning_style or 'adaptive',
            'ai_insights': {
                'learning_velocity': learning_velocity,
                'engagement_score': engagement_score,
                'difficulty_preference': student_profile.preferred_difficulty or 'intermediate',
                'recommended_study_time': 2.5 if overall_progress < 50 else 3.0
            }
        }

        return Response(learning_data)

    except StudentProfile.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_engagement_analytics(request):
    """Student engagement and interaction analytics"""
    try:
        student = request.user.student_profile

        # Simulate engagement data
        engagement_data = {
            'overall_engagement': {
                'score': 85,
                'level': 'high',
                'trend': 'increasing',
                'comparison_to_peers': 'above_average'
            },
            'interaction_patterns': {
                'login_frequency': 'daily',
                'session_duration': '2.5 hours avg',
                'peak_activity_hours': ['14:00-16:00', '19:00-21:00'],
                'preferred_content_types': ['Interactive', 'Video', 'Text'],
                'discussion_participation': 75
            },
            'learning_behavior': {
                'quiz_attempts_per_week': 8,
                'average_response_time': '45 seconds',
                'help_seeking_behavior': 'moderate',
                'collaboration_index': 80,
                'self_regulation_score': 85
            },
            'recommendations': [
                'Continue current engagement pattern',
                'Consider peer tutoring opportunities',
                'Explore advanced challenge problems'
            ]
        }

        return Response(engagement_data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_ai_assessment(request):
    """Generate AI-powered assessment questions using Gemini"""
    try:
        if request.user.user_type != 'student':
            return Response({'error': 'Student access only'}, status=status.HTTP_403_FORBIDDEN)

        student_profile = StudentProfile.objects.get(user=request.user)

        # Get parameters from request
        topic = request.data.get('topic', 'Computer Science')
        difficulty = request.data.get('difficulty', 'intermediate')
        num_questions = request.data.get('num_questions', 5)
        assessment_type = request.data.get('assessment_type', 'quiz')

        print(
            f" Generating AI Assessment: topic={topic}, difficulty={difficulty}, num_questions={num_questions}, type={assessment_type}")

        # Use Gemini AI to generate assessment
        if gemini_service and gemini_service.available:
            try:
                print(" Gemini service is available, calling generate_ai_assessment...")
                assessment_data = gemini_service.generate_ai_assessment(
                    topic=topic,
                    difficulty=difficulty,
                    num_questions=num_questions,
                    assessment_type=assessment_type
                )
                print(f" Generated assessment: {assessment_data.get('assessment_title', 'Unknown')}")
                return Response(assessment_data, status=status.HTTP_200_OK)
            except Exception as e:
                print(f" Gemini AI error: {str(e)}")
                # Continue to fallback

        print(" Using fallback mock assessment")
        # Fallback mock assessment
        assessment_data = {
            'assessment_title': f"{topic} {assessment_type.title()}",
            'total_duration': num_questions * 2,
            'questions': [],
            'passing_score': 60,
            'ai_generated': False,
            'model': 'Mock (Gemini API encountered an error)'
        }

        for i in range(num_questions):
            assessment_data['questions'].append({
                'question': f"Question {i + 1}: What is an important concept in {topic}?",
                'options': ['Option A', 'Option B', 'Option C', 'Option D'] if assessment_type != 'essay' else [],
                'correct_answer': 'A',
                'explanation': f"This is the correct answer because it demonstrates understanding of {topic}.",
                'points': 10 if assessment_type != 'essay' else 20,
                'type': 'multiple_choice' if assessment_type != 'essay' else 'essay'
            })

        return Response(assessment_data, status=status.HTTP_200_OK)

    except StudentProfile.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f" Server error in generate_ai_assessment: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({'error': f'Server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_ai_learning_insights(request):
    """Get AI-powered learning insights and recommendations using Gemini"""
    try:
        if request.user.user_type != 'student':
            return Response({'error': 'Student access only'}, status=status.HTTP_403_FORBIDDEN)

        student_profile = StudentProfile.objects.get(user=request.user)

        # Get student's course performance
        enrollments = CourseEnrollment.objects.filter(
            student=student_profile,
            status='active'
        ).select_related('course')

        # Prepare student data for AI analysis
        student_data = {
            'learning_style': student_profile.learning_style or 'adaptive',
            'gpa': float(student_profile.current_gpa),
            'study_hours': 120,  # Can be calculated from analytics
            'avg_session': 50,  # Average study session in minutes
            'courses': []
        }

        # Add course performance data
        total_score = 0
        scored_courses = 0

        for enrollment in enrollments:
            assessment_scores = StudentAssessmentAttempt.objects.filter(
                student=student_profile,
                assessment__course=enrollment.course,
                status='graded'
            ).aggregate(avg_score=Avg('percentage'))

            avg_score = assessment_scores['avg_score']
            if avg_score is not None:
                student_data['courses'].append({
                    'title': enrollment.course.title,
                    'score': float(avg_score),
                    'progress': float(enrollment.progress_percentage)
                })
                total_score += float(avg_score)
                scored_courses += 1

        # Use Gemini AI to generate insights
        if gemini_service and gemini_service.available and scored_courses > 0:
            insights_data = gemini_service.analyze_learning_insights(student_data)
        else:
            # Fallback insights
            insights_data = {
                'performance_analysis': {
                    'overall_trend': 'improving' if student_data['gpa'] > 3.0 else 'stable',
                    'strongest_areas': ['Problem Solving', 'Consistent Study Habits'],
                    'areas_needing_attention': ['Time Management', 'Advanced Topics'],
                    'grade_prediction': min(4.0, student_data['gpa'] + 0.2)
                },
                'learning_patterns': {
                    'optimal_study_time': '10:00 AM - 12:00 PM',
                    'attention_span': '45-50 minutes',
                    'learning_efficiency': 85,
                    'retention_rate': 80
                },
                'ai_recommendations': [
                    {
                        'title': 'Optimize Study Schedule',
                        'description': 'Schedule challenging subjects during peak concentration hours',
                        'priority': 'high',
                        'impact': 'Could improve performance by 15%'
                    },
                    {
                        'title': 'Take Regular Breaks',
                        'description': 'Use 45-minute study blocks with 10-minute breaks',
                        'priority': 'medium',
                        'impact': 'Improves retention and reduces fatigue'
                    },
                    {
                        'title': 'Active Recall Practice',
                        'description': 'Use flashcards and self-testing for better retention',
                        'priority': 'high',
                        'impact': 'Significantly improves long-term memory'
                    }
                ],
                'study_optimization': {
                    'suggested_schedule': 'Morning sessions for complex topics, evening for review',
                    'focus_areas': ['Advanced concepts', 'Practice problems'],
                    'time_allocation': 'Spend 40% on weak areas, 30% on practice, 30% on review'
                },
                'ai_powered': False,
                'model': 'Mock (Gemini API not configured)'
            }

        # Add study metrics
        insights_data['study_metrics'] = {
            'total_study_hours': student_data['study_hours'],
            'average_session_minutes': student_data['avg_session'],
            'courses_analyzed': scored_courses,
            'average_score': round(total_score / scored_courses, 1) if scored_courses > 0 else 0
        }

        return Response(insights_data, status=status.HTTP_200_OK)

    except StudentProfile.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
