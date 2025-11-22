from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import permissions, viewsets
from rest_framework.views import APIView
from rest_framework import status as drf_status
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Q, Avg, Count, Sum
from datetime import datetime, timedelta
import json
import os

from .models import StudentProfile, AcademicRecord, AttendanceRecord, LearningProgress, StudentBehaviorMetrics
from .serializers import StudentProfileSerializer

# Import Gemini AI service
try:
    from ai_services.gemini_service import gemini_service
except ImportError:
    gemini_service = None
    print("⚠️ Gemini AI service not available in students/views.py")

# Import new GeminiService for advanced AI analysis
try:
    from ai_services.gemini_service import GeminiService
except ImportError:
    GeminiService = None
    print("⚠️ GeminiService not available in students/views.py")

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
            }, status=drf_status.HTTP_403_FORBIDDEN)

        try:
            student_profile = StudentProfile.objects.get(user=request.user)
        except StudentProfile.DoesNotExist:
            return Response({
                'error': 'Student profile not found'
            }, status=drf_status.HTTP_404_NOT_FOUND)

        # Get REAL enrollments - include ALL statuses so students see everything
        enrollments = CourseEnrollment.objects.filter(
            student=student_profile
        ).select_related('course', 'course__instructor__user', 'course__subject').order_by('-enrollment_date')

        # Separate by status
        active_enrollments = enrollments.filter(status='active')
        pending_enrollments = enrollments.filter(status='pending')
        all_enrollments = enrollments

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
                'enrollment_date': student_profile.enrollment_date.strftime(
                    '%Y-%m-%d') if student_profile.enrollment_date else 'N/A'
            },
            'enrollments_count': active_enrollments.count(),
            'pending_count': pending_enrollments.count(),
            'has_courses': active_enrollments.exists(),
            'is_new_student': not all_enrollments.exists(),
            'message': 'No courses enrolled yet. Teachers will add you to courses.' if not all_enrollments.exists() else None
        }

        # Add ALL enrollment details (active, pending, etc.)
        if all_enrollments.exists():
            enrollments_data = []
            import logging
            for enrollment in all_enrollments:
                # Verify instructor exists (safety check for data integrity)
                if not enrollment.course.instructor or not enrollment.course.instructor.user:
                    # Log the issue but don't crash - skip this enrollment
                    logging.warning(f"Course {enrollment.course.code} has no valid instructor assigned")
                    continue  # Skip enrollments with invalid instructor data

                enrollments_data.append({
                    'id': enrollment.id,
                    'course_id': enrollment.course.id,
                    'course_title': enrollment.course.title,
                    'course_code': enrollment.course.code,
                    'instructor_name': enrollment.course.instructor.user.get_full_name(),  # REAL from DB
                    'instructor_id': enrollment.course.instructor.id,  # For verification
                    'progress_percentage': float(enrollment.completion_percentage),
                    'enrollment_date': enrollment.enrollment_date.strftime('%Y-%m-%d'),
                    'status': enrollment.status,
                    'credits': enrollment.course.credits,
                    'difficulty_level': enrollment.course.difficulty_level,
                    'ai_enabled': enrollment.ai_features_unlocked,  # FIXED: Use enrollment's ai_features_unlocked
                    'ai_features_unlocked': enrollment.ai_features_unlocked,  # Explicit field
                    'subject': enrollment.course.subject.name if enrollment.course.subject else 'General'
                })

            # Only add enrollments_data if we have valid enrollments
            if enrollments_data:
                dashboard_data['current_enrollments'] = enrollments_data
            else:
                dashboard_data['has_courses'] = False
                dashboard_data['is_new_student'] = True
                dashboard_data['message'] = 'No valid course enrollments. Teachers will add you to courses.'

        return Response(dashboard_data, status=drf_status.HTTP_200_OK)


class AcademicRecordsView(APIView):
    """REAL Academic Records - only shows actual enrollments and grades"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            student = request.user.student_profile

            # Get all enrollments for the student
            enrollments = CourseEnrollment.objects.filter(
                student=student
            ).select_related('course', 'course__instructor__user', 'course__subject')

            # Build academic records array
            academic_records = []
            for enrollment in enrollments:
                # Skip enrollments with missing instructor or instructor user
                if not enrollment.course.instructor or not enrollment.course.instructor.user:
                    continue

                # Determine grade based on final score
                grade = 'In Progress'
                if enrollment.status == 'completed':
                    score = enrollment.final_score or 0
                    if score >= 90:
                        grade = 'A'
                    elif score >= 80:
                        grade = 'B'
                    elif score >= 70:
                        grade = 'C'
                    elif score >= 60:
                        grade = 'D'
                    else:
                        grade = 'F'

                academic_records.append({
                    'course_title': enrollment.course.title,
                    'course_code': enrollment.course.code,
                    'instructor': enrollment.course.instructor.user.get_full_name(),
                    'grade': grade,
                    'credits': enrollment.course.credits,
                    'semester': f"{enrollment.course.subject.name if enrollment.course.subject else 'General'} - {enrollment.enrollment_date.strftime('%B %Y')}",
                    'progress_percentage': float(enrollment.completion_percentage),
                    'final_score': float(enrollment.final_score) if enrollment.final_score else 0.0,
                    'status': enrollment.status
                })

            # Calculate GPA - only completed enrollments with valid instructor
            completed_enrollments = [
                e for e in enrollments
                if e.status == 'completed'
                   and e.final_score
                   and (e.course.instructor and e.course.instructor.user)
            ]
            total_grade_points = sum(
                (e.final_score / 25) * e.course.credits
                for e in completed_enrollments if e.final_score
            )
            total_credits = sum(e.course.credits for e in completed_enrollments)
            current_gpa = (total_grade_points / total_credits) if total_credits > 0 else 0.0

            # Calculate GPA by semester
            gpa_by_semester = {}
            semester_map = {}
            for enrollment in completed_enrollments:
                semester = f"{enrollment.course.subject.name if enrollment.course.subject else 'General'} - {enrollment.enrollment_date.strftime('%B %Y')}"
                if semester not in semester_map:
                    semester_map[semester] = []
                semester_map[semester].append(enrollment)

            for semester, enrols in semester_map.items():
                sem_grade_points = sum((e.final_score / 25) * e.course.credits for e in enrols if e.final_score)
                sem_credits = sum(e.course.credits for e in enrols)
                gpa_by_semester[semester] = (sem_grade_points / sem_credits) if sem_credits > 0 else 0.0

            # AI-Powered Analysis
            ai_feedback = None
            if academic_records:  # Only generate AI feedback if there are records
                try:
                    gemini = GeminiService() if GeminiService else None

                    # Prepare data for AI analysis
                    analysis_prompt = f"""Analyze this student's academic performance and provide personalized feedback:

Student: {request.user.get_full_name()}
Current GPA: {current_gpa:.2f}
Total Credits: {total_credits}
Completed Courses: {len(completed_enrollments)}
In Progress: {len([e for e in enrollments if e.status == 'active'])}

Academic Records:
{chr(10).join([f"- {r['course_title']}: {r['grade']} ({r['final_score']:.1f}%) - {r['status']}" for r in academic_records])}

GPA Trend by Semester:
{chr(10).join([f"- {sem}: {gpa:.2f}" for sem, gpa in gpa_by_semester.items()])}

Provide a comprehensive academic analysis with:
1. Overall Performance Assessment (2-3 sentences)
2. Key Strengths (3-4 specific points)
3. Areas for Improvement (2-3 specific points)
4. Personalized Recommendations (4-5 actionable items)
5. Risk Level (low/medium/high) with explanation
6. Next Steps (3-4 immediate action items)

Format as JSON:
{{
    "overall_assessment": "...",
    "strengths": ["...", "...", "..."],
    "improvements": ["...", "..."],
    "recommendations": ["...", "...", "...", "..."],
    "risk_level": "low/medium/high",
    "risk_explanation": "...",
    "next_steps": ["...", "...", "..."],
    "motivational_message": "..."
}}"""

                    if gemini and hasattr(gemini, 'generate_content'):
                        ai_response = gemini.generate_content(analysis_prompt)

                        # Parse JSON response
                        import json
                        import re
                        json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
                        if json_match:
                            ai_feedback = json.loads(json_match.group())
                            ai_feedback['ai_powered'] = True
                            ai_feedback['model'] = 'Gemini 1.5 Flash'
                    else:
                        raise Exception("GeminiService is not available")
                except Exception as e:
                    print(f"AI Analysis Error: {str(e)}")
                    # Provide fallback feedback
                    progress_msg = (
                        f"You have completed {len(completed_enrollments)} courses and are currently enrolled in {len([e for e in enrollments if e.status == 'active'])} active courses."
                    )
                    if current_gpa >= 3.0:
                        progress_msg += " Your academic performance is excellent!"
                    else:
                        progress_msg += " Keep working to improve your results!"

                    ai_feedback = {
                        'overall_assessment': progress_msg,
                        'strengths': [
                            f"Completed {total_credits} credits",
                            "Demonstrated commitment to learning",
                            "Consistently engaged in courses",
                            "Good attendance record" if current_gpa >= 2.0 else "Needs attendance improvement"
                        ],
                        'improvements': [
                            "Increase participation in class discussions",
                            "Seek additional help in challenging subjects" if current_gpa < 3.0 else "Continue current study strategies",
                            "Aim to improve assignment scores"
                        ],
                        'recommendations': [
                            "Set aside dedicated study time each day",
                            "Review course materials regularly",
                            "Use practice exercises and flashcards",
                            "Join peer study groups or forums",
                            "Take regular breaks to avoid burnout"
                        ],
                        'risk_level': 'low' if current_gpa >= 3.0 else 'medium' if current_gpa >= 2.5 else 'high',
                        'risk_explanation': f"GPA of {current_gpa:.2f} is {'excellent' if current_gpa >= 3.0 else 'moderate, improvement recommended' if current_gpa >= 2.5 else 'below optimal'}",
                        'next_steps': [
                            "Complete remaining coursework",
                            "Consult your instructor for feedback",
                            "Review weak areas before assessments",
                            "Develop a targeted study plan"
                        ],
                        'motivational_message': "Every step forward is progress. Stay consistent and trust the process!",
                        'ai_powered': False,
                        'model': 'Fallback (Gemini API error)'
                    }

            transcript_data = {
                'student_info': {
                    'student_id': student.student_id,
                    'full_name': request.user.get_full_name(),
                    'current_gpa': float(current_gpa),
                    'total_credits': total_credits,
                    'academic_standing': 'Good Standing' if current_gpa >= 2.0 else 'Probation',
                    'enrollment_date': student.enrollment_date.isoformat() if student.enrollment_date else None
                },
                'academic_records': academic_records,
                'gpa_by_semester': gpa_by_semester,
                'ai_feedback': ai_feedback
            }

            return Response(transcript_data)
        except Exception as e:
            import traceback
            print(f"Error in AcademicRecordsView: {traceback.format_exc()}")
            return Response({'error': str(e)}, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdaptiveLearningView(APIView):
    """AI-Powered Adaptive Learning - personalized learning paths"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.user_type != 'student':
            return Response({'error': 'Student access only'}, status=drf_status.HTTP_403_FORBIDDEN)

        try:
            student_profile = StudentProfile.objects.get(user=request.user)

            # Get active enrollments
            enrollments = CourseEnrollment.objects.filter(
                student=student_profile
            ).select_related('course', 'course__subject')

            if not enrollments.exists():
                return Response({
                    'learning_paths': [],
                    'message': 'No active courses. Enroll in courses to see adaptive learning paths.',
                    'student_learning_style': student_profile.learning_style or 'Not set',
                    'overall_progress': 0,
                    'total_courses': 0,
                    'preferred_difficulty': student_profile.preferred_difficulty,
                    'ai_recommendations': None
                })

            learning_paths = []
            completed_courses = []
            in_progress_courses = []

            for enrollment in enrollments:
                course_info = {
                    'course_title': enrollment.course.title,
                    'course_code': enrollment.course.code,
                    'difficulty_level': enrollment.course.difficulty_level,
                    'progress_percentage': float(enrollment.completion_percentage),
                    'estimated_completion': enrollment.course.end_date.strftime(
                        '%B %d, %Y') if enrollment.course.end_date else 'Not set',
                    'duration_weeks': ((enrollment.course.end_date - enrollment.course.start_date).days // 7) if (
                                enrollment.course.end_date and enrollment.course.start_date) else 0,
                    'credits': enrollment.course.credits,
                    'status': enrollment.status,
                    'final_score': float(enrollment.final_score) if enrollment.final_score else 0.0,
                    'description': enrollment.course.description[
                        :200] if enrollment.course.description else 'No description available'
                }

                learning_paths.append(course_info)

                # Track completed vs in-progress
                if enrollment.status == 'completed':
                    completed_courses.append(course_info)
                elif enrollment.status == 'active':
                    in_progress_courses.append(course_info)

            overall_progress = enrollments.aggregate(avg_progress=Avg('completion_percentage'))['avg_progress'] or 0

            # AI-Powered Recommendations
            ai_recommendations = None
            try:
                gemini = GeminiService() if GeminiService else None

                # Prepare data for AI analysis
                learning_style = student_profile.learning_style or 'adaptive'
                completed_courses = [p for p in learning_paths if p['status'] == 'completed']
                in_progress_courses = [p for p in learning_paths if p['status'] == 'active']

                ai_prompt = f"""Analyze this student's learning journey and provide personalized adaptive learning recommendations:

Student: {request.user.get_full_name()}
Learning Style: {learning_style}
Overall Progress: {overall_progress:.1f}%
Total Courses: {len(learning_paths)}
Completed: {len(completed_courses)}
In Progress: {len(in_progress_courses)}

Courses in Progress:
{chr(10).join([f"- {c['course_title']}: {c['progress_percentage']:.1f}% complete" for c in in_progress_courses]) if in_progress_courses else "None"}

Completed Courses:
{chr(10).join([f"- {c['course_title']}: {c['final_score']:.1f}%" for c in completed_courses]) if completed_courses else "None"}

Generate personalized adaptive learning recommendations:
1. Learning Path Analysis (2-3 sentences about their learning journey)
2. Personalized Study Tips (4-5 specific tips based on their learning style)
3. Next Course Recommendations (3-4 courses they should take next with reasons)
4. Study Schedule Optimization (3-4 actionable schedule improvements)
5. Learning Style Adjustments (2-3 suggestions to optimize their approach)
6. Progress Milestones (4-5 specific milestones with timeframes)
7. Motivational Strategy (personalized encouragement based on their progress)

Format as JSON:
{{
    "learning_path_analysis": "...",
    "study_tips": ["...", "...", "...", "..."],
    "next_courses": [
        {{"title": "...", "reason": "...", "difficulty": "beginner/intermediate/advanced"}},
        ...
    ],
    "schedule_optimization": ["...", "...", "..."],
    "learning_style_adjustments": ["...", "..."],
    "milestones": [
        {{"milestone": "...", "timeframe": "...", "actionable": "..."}},
        ...
    ],
    "motivational_message": "..."
}}"""

                if gemini and hasattr(gemini, 'generate_content'):
                    ai_response = gemini.generate_content(ai_prompt)

                    # Parse JSON response
                    import json
                    import re
                    json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
                    if json_match:
                        ai_recommendations = json.loads(json_match.group())
                        ai_recommendations['ai_powered'] = True
                        ai_recommendations['model'] = 'Gemini 1.5 Flash'
                else:
                    raise Exception("GeminiService not available")

            except Exception as e:
                print(f"AI Recommendations Error: {str(e)}")
                # Fallback recommendations
                progress_msg = f"You are making progress with {len(in_progress_courses)} active courses and {len(completed_courses)} completed courses."
                if overall_progress >= 70:
                    progress_msg += " Excellent progress!"
                else:
                    progress_msg += " Keep going!"

                ai_recommendations = {
                    'learning_path_analysis': progress_msg,
                    'study_tips': [
                        "Set aside dedicated study time each day",
                        "Review course materials before and after class",
                        "Practice with real-world examples",
                        "Join study groups or discussion forums",
                        "Take regular breaks to avoid burnout"
                    ],
                    'next_courses': [
                        {'title': 'Advanced concepts in your field', 'reason': 'Build on current knowledge',
                         'difficulty': 'intermediate'},
                        {'title': 'Practical projects course', 'reason': 'Apply what you have learned',
                         'difficulty': 'intermediate'},
                        {'title': 'Industry certification prep', 'reason': 'Validate your skills',
                         'difficulty': 'advanced'}
                    ],
                    'schedule_optimization': [
                        "Study during your peak energy hours",
                        "Break large topics into smaller chunks",
                        "Use the Pomodoro Technique (25 min focus + 5 min break)",
                        "Review previous material before starting new content"
                    ],
                    'learning_style_adjustments': [
                        f"Your {learning_style} learning style is well-suited for online learning",
                        "Try mixing different learning methods for better retention"
                    ],
                    'milestones': [
                        {'milestone': 'Complete current course modules', 'timeframe': '2 weeks',
                         'actionable': 'Focus on one module per week'},
                        {'milestone': 'Achieve 80%+ on assignments', 'timeframe': '1 month',
                         'actionable': 'Review feedback and improve'},
                        {'milestone': 'Finish one course completely', 'timeframe': '6 weeks',
                         'actionable': 'Maintain consistent study schedule'},
                        {'milestone': 'Enroll in advanced course', 'timeframe': '2 months',
                         'actionable': 'Build strong foundation first'}
                    ],
                    'motivational_message': "Every step forward is progress. Stay consistent and trust the process!",
                    'ai_powered': False
                }

            return Response({
                'learning_paths': learning_paths,
                'student_learning_style': learning_style,
                'preferred_difficulty': student_profile.preferred_difficulty,
                'overall_progress': round(float(overall_progress), 1),
                'total_courses': enrollments.count(),
                'ai_recommendations': ai_recommendations
            })

        except StudentProfile.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=drf_status.HTTP_404_NOT_FOUND)


class CareerGuidanceView(APIView):
    """REAL Career Guidance - actual job market data only"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.user_type != 'student':
            return Response({'error': 'Student access only'}, status=drf_status.HTTP_403_FORBIDDEN)

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
                progress = float(enrollment.completion_percentage)

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
            return Response({'error': 'Student profile not found'}, status=drf_status.HTTP_404_NOT_FOUND)


class AssessmentsView(APIView):
    """REAL Assessments - shows both Assessment model AND Exam model (teacher-created exams)"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.user_type != 'student':
            return Response({'error': 'Student access only'}, status=drf_status.HTTP_403_FORBIDDEN)

        try:
            student_profile = StudentProfile.objects.get(user=request.user)

            # Get enrolled courses
            enrollments = CourseEnrollment.objects.filter(
                student=student_profile,
                status='active'
            ).select_related('course')

            print(f"\n=== DEBUG: Student {student_profile.user.username} ===")
            print(f"Total enrollments: {enrollments.count()}")
            for enr in enrollments:
                print(f"  - Enrolled in: {enr.course.code} ({enr.course.title}) - Status: {enr.status}")

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
            print(f"Enrolled course IDs: {[c.id for c in enrolled_courses]}")
            print(f"Enrolled course codes: {[c.code for c in enrolled_courses]}")

            # ========== GET EXAMS FROM EXAM MODEL (Teacher Created) ==========
            from courses.models import Exam, ExamAttempt

            # Get published exams from teacher's Exam model - Include ALL published exams, not just future ones
            teacher_exams = Exam.objects.filter(
                course__in=enrolled_courses,
                status='published'
            ).select_related('course').order_by('due_date')

            print(f"\nFound {teacher_exams.count()} published exams")
            for exam in teacher_exams:
                print(f"  - Exam: {exam.title} ({exam.exam_type}) in {exam.course.code} - Due: {exam.due_date}")

            # Get ALL exams (for debugging)
            all_exams = Exam.objects.all().select_related('course')
            print(f"\nTotal exams in database: {all_exams.count()}")
            for exam in all_exams:
                print(
                    f"  - Exam: {exam.title} ({exam.exam_type}) in {exam.course.code} - Status: {exam.status} - Due: {exam.due_date}")

            # Get student's exam attempts
            student_exam_attempts = ExamAttempt.objects.filter(
                student=student_profile
            ).values_list('exam_id', flat=True)

            print(f"Student has attempted {len(student_exam_attempts)} exams")
            print(f"Attempted exam IDs: {list(student_exam_attempts)}")

            # ========== GET ASSESSMENTS FROM ASSESSMENT MODEL ==========
            # Get assessments from assessments app
            upcoming_assessments_from_app = Assessment.objects.filter(
                course__in=enrolled_courses
            ).order_by('available_until') if Assessment else []

            # Check which assessments student has already completed
            student_attempts = StudentAssessmentAttempt.objects.filter(
                student=student_profile,
                status__in=['submitted', 'graded']
            ).values_list('assessment_id', flat=True) if StudentAssessmentAttempt else []

            # ========== COMBINE BOTH SOURCES ==========
            assessments_data = []

            # Add teacher-created exams (show all, let frontend handle filtering)
            for exam in teacher_exams:
                # Convert due_date to date for comparison if it's a datetime
                exam_due_date = exam.due_date
                if isinstance(exam_due_date, datetime):
                    exam_due_date_only = exam_due_date.date()
                else:
                    exam_due_date_only = exam_due_date

                # For display, convert to string
                due_date_str = exam.due_date
                if isinstance(due_date_str, datetime):
                    due_date_str = due_date_str.strftime('%Y-%m-%d')
                elif not isinstance(due_date_str, str):
                    due_date_str = str(due_date_str)

                # Check if student has submitted (not just attempted)
                has_submitted = ExamAttempt.objects.filter(
                    exam=exam,
                    student=student_profile,
                    submitted_at__isnull=False
                ).exists()

                assessments_data.append({
                    'id': exam.id,
                    'title': exam.title,
                    'course': exam.course.title,
                    'course_id': exam.course.id,
                    'course_code': exam.course.code,
                    'type': exam.exam_type,  # 'Quiz', 'Mid', 'Final'
                    'total_marks': exam.total_marks,
                    'due_date': due_date_str,
                    'duration': exam.duration_minutes,
                    'description': exam.description,
                    'questions_count': exam.questions_count,
                    'created_by_teacher': exam.course.instructor.user.get_full_name() if exam.course.instructor else 'Unknown',
                    'source': 'exam_model',  # Flag to identify source
                    'status': 'completed' if has_submitted else (
                        'upcoming' if exam_due_date_only >= timezone.now().date() else 'overdue'),
                    'attempted': has_submitted
                })

            print(f"\nTotal assessments to show: {len(assessments_data)}")
            for a in assessments_data:
                print(f"  - {a['title']} ({a['type']}) - Course: {a['course_code']} - Status: {a['status']}")

            # Add assessments from assessments app
            for assessment in upcoming_assessments_from_app:
                if assessment.id not in student_attempts:
                    assessments_data.append({
                        'id': assessment.id,
                        'title': assessment.title,
                        'course': assessment.course.title,
                        'course_id': assessment.course.id,
                        'type': assessment.type,
                        'total_marks': assessment.total_marks,
                        'due_date': assessment.available_until.strftime('%Y-%m-%d'),
                        'duration': assessment.duration_minutes if hasattr(assessment,
                                                                           'duration_minutes') and assessment.duration_minutes else 60,
                        'description': assessment.description,
                        'questions_count': assessment.questions.count() if hasattr(assessment, 'questions') else 0,
                        'created_by_teacher': assessment.course.instructor.user.get_full_name() if assessment.course.instructor else 'Unknown',
                        'source': 'assessment_model'  # Flag to identify source
                    })

            # Get completed assessments with results (both sources)
            recent_results = []

            # Get completed exams from Exam model
            completed_exam_attempts = ExamAttempt.objects.filter(
                student=student_profile,
                submitted_at__isnull=False
            ).select_related('exam', 'exam__course').order_by('-submitted_at')

            for attempt in completed_exam_attempts:
                recent_results.append({
                    'assessment_title': attempt.exam.title,
                    'course': attempt.exam.course.title,
                    'course_id': attempt.exam.course.id,
                    'type': attempt.exam.exam_type,
                    'score': float(attempt.percentage) if attempt.percentage else 0,
                    'total_marks': attempt.exam.total_marks,
                    'submitted_at': attempt.submitted_at.strftime('%Y-%m-%d %H:%M') if attempt.submitted_at else 'N/A',
                    'graded_by': attempt.graded_by.user.get_full_name() if getattr(attempt, 'graded_by',
                                                                                   None) else 'Auto-graded',
                    'source': 'exam_model'
                })

            # Get completed assessments from Assessment model
            completed_attempts = StudentAssessmentAttempt.objects.filter(
                student=student_profile,
                status='graded'
            ).select_related('assessment', 'assessment__course').order_by('-submitted_at')

            for attempt in completed_attempts:
                recent_results.append({
                    'assessment_title': attempt.assessment.title,
                    'course': attempt.assessment.course.title,
                    'course_id': attempt.assessment.course.id,
                    'type': attempt.assessment.type,
                    'score': float(attempt.percentage) if attempt.percentage else 0,
                    'total_marks': attempt.assessment.total_marks,
                    'submitted_at': attempt.submitted_at.strftime('%Y-%m-%d %H:%M') if attempt.submitted_at else 'N/A',
                    'graded_by': attempt.assessment.course.instructor.user.get_full_name(),
                    'source': 'assessment_model'
                })

            # Calculate average score from all completed assessments
            all_scores = [r['score'] for r in recent_results if r['score'] > 0]
            avg_score = sum(all_scores) / len(all_scores) if all_scores else 0

            return Response({
                'upcoming_assessments': assessments_data,
                'recent_results': recent_results[:10],  # Limit to last 10
                'summary': {
                    'total_upcoming': len(assessments_data),
                    'completed_total': len(recent_results),
                    'average_score': round(float(avg_score), 1) if avg_score else 0,
                    'enrolled_courses': len(enrolled_courses),
                    'exams_from_teachers': len([a for a in assessments_data if a['source'] == 'exam_model']),
                    'assessments_from_system': len([a for a in assessments_data if a['source'] == 'assessment_model'])
                }
            })

        except StudentProfile.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=drf_status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import traceback
            print(f"Error in AssessmentsView: {traceback.format_exc()}")
            return Response({'error': f'Server error: {str(e)}'}, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_career_guidance(request):
    """Comprehensive AI-powered career guidance using Gemini"""
    if request.user.user_type != 'student':
        return Response({'error': 'Student access only'}, status=drf_status.HTTP_403_FORBIDDEN)

    try:
        student_profile = StudentProfile.objects.get(user=request.user)
        guidance_type = request.data.get('type', 'comprehensive')  # comprehensive, skills, career_path, training

        # Get student's current courses and performance
        enrollments = CourseEnrollment.objects.filter(
            student=student_profile
        ).select_related('course', 'course__subject')

        courses_info = []
        for enrollment in enrollments:
            courses_info.append({
                'title': enrollment.course.title,
                'subject': enrollment.course.subject.name if enrollment.course.subject else 'General',
                'progress': float(enrollment.completion_percentage),
                'status': enrollment.status,
                'final_score': float(enrollment.final_score) if enrollment.final_score else None
            })

        # Prepare context for AI
        student_context = f"""Student Profile:
Name: {request.user.get_full_name()}
Learning Style: {student_profile.learning_style or 'adaptive'}
Current GPA: {float(student_profile.current_gpa)}
Total Credits: {student_profile.total_credits}

Current Courses ({len(courses_info)}):
{chr(10).join([f"- {c['title']} ({c['subject']}): {c['progress']:.1f}% complete, Status: {c['status']}" + (f", Score: {c['final_score']:.1f}%" if c['final_score'] else "") for c in courses_info]) if courses_info else "No courses enrolled yet"}

Completed Courses: {len([c for c in courses_info if c['status'] == 'completed'])}
In Progress: {len([c for c in courses_info if c['status'] == 'active'])}
"""

        # Generate AI guidance based on type
        try:
            gemini = GeminiService() if GeminiService else None

            if guidance_type == 'comprehensive':
                ai_prompt = f"""{student_context}

Provide comprehensive career guidance for this student with:

1. **Career Recommendations** (3-4 career paths):
   - Career title
   - Match percentage (0-100)
   - Salary range (realistic for their region)
   - Required skills
   - Skills they already have from courses
   - Missing skills they need to develop
   - Preparation timeline
   - Industry sectors

2. **Skill Gap Analysis**:
   - Current skills (from courses)
   - High-demand market skills they're missing
   - Priority level for each skill (critical/high/medium)
   - Learning resources for each skill gap

3. **Training Recommendations**:
   - Specific training programs or courses
   - Duration and cost
   - Career outcomes

4. **Next Steps** (5-6 actionable items with timelines)

Format as JSON:
{{
    "career_recommendations": [
        {{
            "title": "...",
            "match_percentage": 85,
            "salary_range": {{"min": 50000, "max": 90000}},
            "required_skills": ["...", "..."],
            "student_has": ["..."],
            "needs_to_learn": ["..."],
            "preparation_timeline": "...",
            "industries": ["...", "..."]
        }}
    ],
    "skill_gaps": [
        {{
            "skill": "...",
            "priority": "critical/high/medium",
            "market_demand": "Very High/High/Medium",
            "learning_resources": ["...", "..."],
            "estimated_time": "..."
        }}
    ],
    "training_programs": [
        {{
            "title": "...",
            "provider": "...",
            "duration": "...",
            "cost": "...",
            "career_outcomes": ["...", "..."]
        }}
    ],
    "next_steps": [
        {{
            "step": "...",
            "timeline": "...",
            "priority": "high/medium/low"
        }}
    ],
    "motivational_message": "..."
}}"""

                if gemini and hasattr(gemini, 'generate_content'):
                    ai_response = gemini.generate_content(ai_prompt)

                    # Parse JSON response
                    import json
                    import re
                    json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
                    if json_match:
                        guidance_data = json.loads(json_match.group())
                        guidance_data['ai_powered'] = True
                        guidance_data['model'] = 'Gemini 1.5 Flash'
                        return Response(guidance_data, status=drf_status.HTTP_200_OK)

            # Fallback to structured mock data
            raise Exception("Using fallback data")

        except Exception as e:
            print(f"AI Career Guidance Error: {str(e)}")

            # Fallback comprehensive career guidance
            subjects_studied = list(set([c['subject'] for c in courses_info]))
            has_programming = any(
                'programming' in c['title'].lower() or 'python' in c['title'].lower() for c in courses_info)
            has_data = any('data' in c['title'].lower() for c in courses_info)
            has_ml = any('machine learning' in c['title'].lower() or 'ai' in c['title'].lower() for c in courses_info)

            career_recommendations = []

            if has_programming:
                career_recommendations.append({
                    'title': 'Software Developer',
                    'match_percentage': 80,
                    'salary_range': {'min': 40000, 'max': 85000},
                    'required_skills': ['Programming', 'Problem Solving', 'Version Control', 'Testing'],
                    'student_has': ['Programming'],
                    'needs_to_learn': ['Version Control (Git)', 'Software Testing', 'System Design'],
                    'preparation_timeline': '6-9 months',
                    'industries': ['Technology', 'Finance', 'E-commerce', 'Startups']
                })

            if has_data or has_programming:
                career_recommendations.append({
                    'title': 'Data Analyst',
                    'match_percentage': 75,
                    'salary_range': {'min': 35000, 'max': 70000},
                    'required_skills': ['Data Analysis', 'SQL', 'Excel', 'Visualization'],
                    'student_has': ['Data Analysis Basics'] if has_data else [],
                    'needs_to_learn': ['SQL', 'Tableau/Power BI', 'Statistical Analysis'],
                    'preparation_timeline': '4-6 months',
                    'industries': ['Technology', 'Consulting', 'Healthcare', 'Retail']
                })

            if has_ml or has_programming:
                career_recommendations.append({
                    'title': 'AI/ML Engineer',
                    'match_percentage': 70 if has_ml else 60,
                    'salary_range': {'min': 55000, 'max': 110000},
                    'required_skills': ['Machine Learning', 'Python', 'Deep Learning', 'Mathematics'],
                    'student_has': ['Python'] if has_programming else [],
                    'needs_to_learn': ['Machine Learning Algorithms', 'TensorFlow/PyTorch', 'Advanced Math'],
                    'preparation_timeline': '10-15 months',
                    'industries': ['AI Research', 'Technology Giants', 'Startups', 'Autonomous Systems']
                })

            if not career_recommendations:
                career_recommendations.append({
                    'title': 'Technology Trainee',
                    'match_percentage': 65,
                    'salary_range': {'min': 25000, 'max': 45000},
                    'required_skills': ['Basic Programming', 'Problem Solving', 'Communication'],
                    'student_has': [],
                    'needs_to_learn': ['Programming Fundamentals', 'Web Development', 'Database Basics'],
                    'preparation_timeline': '3-6 months',
                    'industries': ['Technology', 'IT Services', 'Consulting']
                })

            skill_gaps = [
                {
                    'skill': 'Python Programming',
                    'priority': 'critical' if not has_programming else 'low',
                    'market_demand': 'Very High',
                    'learning_resources': ['Python for Everybody (Coursera)', 'Codecademy Python', 'Real Python'],
                    'estimated_time': '2-3 months'
                },
                {
                    'skill': 'Data Analysis',
                    'priority': 'high' if not has_data else 'medium',
                    'market_demand': 'High',
                    'learning_resources': ['Google Data Analytics Certificate', 'DataCamp', 'Kaggle Learn'],
                    'estimated_time': '2-4 months'
                },
                {
                    'skill': 'Machine Learning',
                    'priority': 'high' if not has_ml else 'medium',
                    'market_demand': 'Very High',
                    'learning_resources': ['Andrew Ng ML Course (Coursera)', 'Fast.ai', 'Hands-On ML Book'],
                    'estimated_time': '4-6 months'
                }
            ]

            training_programs = [
                {
                    'title': 'Complete Python Developer Bootcamp',
                    'provider': 'Udemy',
                    'duration': '12 weeks',
                    'cost': '$99 (frequently on sale $12-15)',
                    'career_outcomes': ['Python Developer', 'Backend Engineer', 'Data Analyst']
                },
                {
                    'title': 'Google Data Analytics Professional Certificate',
                    'provider': 'Coursera',
                    'duration': '6 months',
                    'cost': '$49/month',
                    'career_outcomes': ['Data Analyst', 'Business Analyst', 'Data Visualization Specialist']
                },
                {
                    'title': 'Machine Learning Specialization',
                    'provider': 'Stanford (Coursera)',
                    'duration': '3 months',
                    'cost': '$49/month',
                    'career_outcomes': ['ML Engineer', 'Data Scientist', 'AI Researcher']
                }
            ]

            next_steps = [
                {'step': 'Complete current enrolled courses with excellence', 'timeline': 'Ongoing',
                 'priority': 'high'},
                {'step': 'Start building a GitHub portfolio with projects', 'timeline': '1 month', 'priority': 'high'},
                {'step': 'Enroll in a specialized skill course (Python/ML/Data)', 'timeline': '2 weeks',
                 'priority': 'high'},
                {'step': 'Join tech communities and networking events', 'timeline': '1 month', 'priority': 'medium'},
                {'step': 'Apply for internships or entry-level positions', 'timeline': '3-4 months',
                 'priority': 'medium'},
                {'step': 'Build 2-3 portfolio projects demonstrating skills', 'timeline': '2-3 months',
                 'priority': 'high'}
            ]

            guidance_data = {
                'career_recommendations': career_recommendations,
                'skill_gaps': skill_gaps,
                'training_programs': training_programs,
                'next_steps': next_steps,
                'motivational_message': 'Your learning journey is progressing well! Focus on building practical skills and a strong portfolio to stand out in the job market. Every course you complete brings you closer to your career goals.',
                'ai_powered': False,
                'model': 'Fallback (Gemini not available)'
            }

            return Response(guidance_data, status=drf_status.HTTP_200_OK)

    except StudentProfile.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=drf_status.HTTP_404_NOT_FOUND)
    except Exception as e:
        import traceback
        print(f"Career Guidance Error: {traceback.format_exc()}")
        return Response({'error': f'Server error: {str(e)}'}, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)


class LearningInsightsView(APIView):
    """REAL Learning Insights - only actual tracked data"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.user_type != 'student':
            return Response({'error': 'Student access only'}, status=drf_status.HTTP_403_FORBIDDEN)

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
            return Response({'error': 'Student profile not found'}, status=drf_status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_academic_transcript(request):
    """Generate automated academic transcript"""
    try:
        student = request.user.student_profile

        # Get all enrollments for the student
        enrollments = CourseEnrollment.objects.filter(
            student=student
        ).select_related('course', 'course__instructor__user', 'course__subject')

        # Build academic records array
        academic_records = []
        for enrollment in enrollments:
            # Determine grade based on final score
            grade = 'In Progress'
            if enrollment.status == 'completed':
                score = enrollment.final_score or 0
                if score >= 90:
                    grade = 'A'
                elif score >= 80:
                    grade = 'B'
                elif score >= 70:
                    grade = 'C'
                elif score >= 60:
                    grade = 'D'
                else:
                    grade = 'F'

            academic_records.append({
                'course_title': enrollment.course.title,
                'course_code': enrollment.course.code,
                'instructor': enrollment.course.instructor.user.get_full_name() if enrollment.course.instructor else 'N/A',
                'grade': grade,
                'credits': enrollment.course.credits,
                'semester': f"{enrollment.course.subject.name if enrollment.course.subject else 'General'} - {enrollment.enrolled_at.strftime('%B %Y')}",
                'progress_percentage': float(enrollment.completion_percentage),
                'final_score': float(enrollment.final_score) if enrollment.final_score else 0.0,
                'status': enrollment.status
            })

        # Calculate GPA
        completed_enrollments = [e for e in enrollments if e.status == 'completed' and e.final_score]
        total_grade_points = sum(
            (e.final_score / 25) * e.course.credits
            for e in completed_enrollments if e.final_score
        )
        total_credits = sum(e.course.credits for e in completed_enrollments)
        current_gpa = (total_grade_points / total_credits) if total_credits > 0 else 0.0

        # Calculate GPA by semester
        gpa_by_semester = {}
        semester_map = {}
        for enrollment in completed_enrollments:
            semester = f"{enrollment.course.subject.name if enrollment.course.subject else 'General'} - {enrollment.enrolled_at.strftime('%B %Y')}"
            if semester not in semester_map:
                semester_map[semester] = []
            semester_map[semester].append(enrollment)

        for semester, enrols in semester_map.items():
            sem_grade_points = sum((e.final_score / 25) * e.course.credits for e in enrols if e.final_score)
            sem_credits = sum(e.course.credits for e in enrols)
            gpa_by_semester[semester] = (sem_grade_points / sem_credits) if sem_credits > 0 else 0.0

        transcript_data = {
            'student_info': {
                'student_id': student.student_id,
                'full_name': request.user.get_full_name(),
                'current_gpa': float(current_gpa),
                'total_credits': total_credits,
                'academic_standing': 'Good Standing' if current_gpa >= 2.0 else 'Probation',
                'enrollment_date': student.enrollment_date.isoformat() if student.enrollment_date else None
            },
            'academic_records': academic_records,
            'gpa_by_semester': gpa_by_semester
        }

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
        return Response({'error': str(e)}, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_personalized_learning_path(request):
    """AI-generated personalized learning path - Fixed for frontend compatibility"""
    try:
        if request.user.user_type != 'student':
            return Response({'error': 'Student access only'}, status=drf_status.HTTP_403_FORBIDDEN)

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
                progress = float(enrollment.completion_percentage)
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
        return Response({'error': 'Student profile not found'}, status=drf_status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Server error: {str(e)}'}, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)


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
        return Response({'error': str(e)}, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_ai_assessment(request):
    """Generate AI-powered assessment questions using Gemini"""
    try:
        if request.user.user_type != 'student':
            return Response({'error': 'Student access only'}, status=drf_status.HTTP_403_FORBIDDEN)

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
                return Response(assessment_data, status=drf_status.HTTP_200_OK)
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

        return Response(assessment_data, status=drf_status.HTTP_200_OK)

    except StudentProfile.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=drf_status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f" Server error in generate_ai_assessment: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({'error': f'Server error: {str(e)}'}, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_ai_learning_insights(request):
    """Get AI-powered learning insights with REAL data from database and Gemini AI analysis"""
    try:
        if request.user.user_type != 'student':
            return Response({'error': 'Student access only'}, status=drf_status.HTTP_403_FORBIDDEN)

        student_profile = StudentProfile.objects.get(user=request.user)

        # ========== CALCULATE REAL METRICS FROM DATABASE ==========

        # Get all active enrollments
        enrollments = CourseEnrollment.objects.filter(
            student=student_profile
        ).select_related('course', 'course__subject')

        if not enrollments.exists():
            # Return initial state for new students
            return Response({
                'performance_analysis': {
                    'overall_trend': 'new_student',
                    'strongest_areas': [],
                    'areas_needing_attention': ['Enroll in courses to start learning'],
                    'grade_prediction': 0.0
                },
                'learning_patterns': {
                    'optimal_study_time': 'Not enough data yet',
                    'attention_span': 'Not enough data yet',
                    'learning_efficiency': 0,
                    'retention_rate': 0
                },
                'ai_recommendations': [
                    {
                        'title': 'Enroll in Your First Course',
                        'description': 'Start your learning journey by enrolling in courses that match your interests and career goals.',
                        'priority': 'high',
                        'impact': 'Kickstart your education and unlock AI-powered insights'
                    },
                    {
                        'title': 'Explore Available Courses',
                        'description': 'Browse the course catalog to find subjects that interest you. Look for courses that align with your career aspirations.',
                        'priority': 'high',
                        'impact': 'Choose the right path for your future'
                    },
                    {
                        'title': 'Set Learning Goals',
                        'description': 'Define what you want to achieve. Clear goals will help you stay motivated and track progress effectively.',
                        'priority': 'medium',
                        'impact': 'Provides direction and motivation'
                    }
                ],
                'study_optimization': {
                    'suggested_schedule': 'Enroll in courses to get personalized study schedule recommendations',
                    'focus_areas': ['Course Selection', 'Goal Setting'],
                    'time_allocation': 'Start with 1-2 courses and dedicate 2-3 hours per week per course'
                },
                'study_metrics': {
                    'total_study_hours': 0,
                    'average_session_minutes': 0,
                    'courses_analyzed': 0,
                    'average_score': 0
                },
                'ai_powered': False,
                'model': 'Welcome Mode - Enroll in courses to unlock AI insights'
            }, status=drf_status.HTTP_200_OK)

        # ========== CALCULATE REAL STUDY TIME FROM LEARNING ANALYTICS ==========
        thirty_days_ago = timezone.now() - timedelta(days=30)

        # Try to get real analytics data
        learning_analytics = None
        try:
            learning_analytics = LearningAnalytics.objects.filter(
                student=student_profile,
                date__gte=thirty_days_ago
            ).aggregate(
                total_time=Sum('time_spent'),
                session_count=Count('id')
            )
        except:
            pass

        # Calculate study hours from analytics or estimate from course progress
        if learning_analytics and learning_analytics['total_time']:
            total_seconds = learning_analytics['total_time'].total_seconds()
            total_study_hours = int(total_seconds / 3600)
            session_count = learning_analytics['session_count'] or 1
            avg_session_minutes = int((total_seconds / session_count) / 60)
        else:
            # Estimate based on course progress (1% progress ≈ 30 min study)
            total_progress = sum([float(e.completion_percentage) for e in enrollments])
            total_study_hours = int((total_progress * 30) / 60)  # Convert minutes to hours
            avg_session_minutes = 45  # Default estimate

        # Ensure minimum values
        total_study_hours = max(1, total_study_hours) if total_study_hours > 0 else 0
        avg_session_minutes = max(20, avg_session_minutes) if avg_session_minutes > 0 else 0

        # ========== CALCULATE REAL COURSE PERFORMANCE ==========
        courses_data = []
        total_score = 0
        scored_courses = 0
        strongest_courses = []
        weakest_courses = []

        for enrollment in enrollments:
            # Get assessment scores for this course
            try:
                assessment_scores = StudentAssessmentAttempt.objects.filter(
                    student=student_profile,
                    assessment__course=enrollment.course,
                    status='graded'
                ).aggregate(
                    avg_score=Avg('percentage'),
                    count=Count('id')
                )

                avg_score = assessment_scores['avg_score']
                assessment_count = assessment_scores['count']

                if avg_score is not None and avg_score > 0:
                    score_float = float(avg_score)
                    courses_data.append({
                        'title': enrollment.course.title,
                        'score': score_float,
                        'progress': float(enrollment.completion_percentage),
                        'assessments_taken': assessment_count
                    })
                    total_score += score_float
                    scored_courses += 1

                    # Track strongest and weakest
                    if score_float >= 80:
                        strongest_courses.append(enrollment.course.title)
                    elif score_float < 70:
                        weakest_courses.append(enrollment.course.title)
                else:
                    # In progress courses
                    courses_data.append({
                        'title': enrollment.course.title,
                        'score': 0,
                        'progress': float(enrollment.completion_percentage),
                        'assessments_taken': 0
                    })
            except Exception as e:
                # Skip courses with no assessments
                courses_data.append({
                    'title': enrollment.course.title,
                    'score': 0,
                    'progress': float(enrollment.completion_percentage),
                    'assessments_taken': 0
                })

        # Calculate average score
        average_score = int(total_score / scored_courses) if scored_courses > 0 else 0

        # Calculate retention and efficiency based on real performance
        if average_score > 0:
            retention_rate = min(95, max(60, average_score - 10))  # Correlate with performance
            learning_efficiency = min(90, max(50, average_score - 5))
        else:
            retention_rate = 70  # Default for students without scored assessments
            learning_efficiency = 75

        # Prepare data for AI analysis
        student_data = {
            'learning_style': student_profile.learning_style or 'adaptive',
            'gpa': float(student_profile.current_gpa),
            'study_hours': total_study_hours,
            'avg_session': avg_session_minutes,
            'courses': courses_data,
            'total_courses': enrollments.count(),
            'scored_courses': scored_courses,
            'average_score': average_score,
            'strongest_courses': strongest_courses[:3],  # Top 3
            'weakest_courses': weakest_courses[:3]  # Bottom 3
        }

        # ========== USE GEMINI AI FOR INTELLIGENT ANALYSIS ==========
        insights_data = None
        ai_powered = False

        if gemini_service and gemini_service.available and len(courses_data) > 0:
            try:
                print(f"🤖 Calling Gemini AI for learning insights analysis...")
                insights_data = gemini_service.analyze_learning_insights(student_data)
                ai_powered = True
                print(f"✅ Gemini AI analysis complete!")
            except Exception as e:
                print(f"⚠️ Gemini AI error: {str(e)}")
                insights_data = None

        # ========== FALLBACK ANALYSIS IF AI NOT AVAILABLE ==========
        if not insights_data:
            # Determine trend based on actual data
            if average_score >= 85:
                overall_trend = 'improving'
                trend_desc = 'excellent'
            elif average_score >= 70:
                overall_trend = 'stable'
                trend_desc = 'good'
            else:
                overall_trend = 'needs_attention'
                trend_desc = 'needs improvement'

            # Build strengths from actual performance
            strengths = []
            if strongest_courses:
                strengths.append(f"Excelling in: {', '.join(strongest_courses)}")
            if average_score >= 80:
                strengths.append("Strong academic performance")
            if total_study_hours >= 100:
                strengths.append("Consistent study habits")
            if not strengths:
                strengths = ["Building learning foundation", "Active course participation"]

            # Build areas needing attention
            improvements = []
            if weakest_courses:
                improvements.append(f"Focus more on: {', '.join(weakest_courses)}")
            if average_score < 75:
                improvements.append("Improve assessment scores")
            if avg_session_minutes < 30:
                improvements.append("Increase study session length")
            if not improvements:
                improvements = ["Maintain current pace", "Challenge yourself with advanced topics"]

            # Generate recommendations based on data
            recommendations = [
                {
                    'title': 'Optimize Your Study Schedule',
                    'description': f'With {total_study_hours}h study time this month, try breaking into {int(total_study_hours / avg_session_minutes * 60) if avg_session_minutes > 0 else "multiple"} focused sessions for better retention.',
                    'priority': 'high',
                    'impact': 'Can improve retention by 15-20%'
                },
                {
                    'title': 'Focus on Weaker Areas',
                    'description': f'Dedicate extra time to {weakest_courses[0] if weakest_courses else "challenging topics"}. Use practice problems and seek help when needed.',
                    'priority': 'high' if weakest_courses else 'medium',
                    'impact': 'Direct improvement in overall GPA'
                },
                {
                    'title': 'Leverage Your Strengths',
                    'description': f'You\'re doing great in {strongest_courses[0] if strongest_courses else "several areas"}! Use these skills to help others and reinforce your knowledge.',
                    'priority': 'medium',
                    'impact': 'Reinforces knowledge and builds confidence'
                },
                {
                    'title': 'Take Strategic Breaks',
                    'description': f'With {avg_session_minutes}-minute sessions, take 5-10 minute breaks to maintain focus and prevent burnout.',
                    'priority': 'medium',
                    'impact': 'Improves concentration and reduces fatigue'
                }
            ]

            # Predict future GPA based on current trend
            if average_score >= 80:
                grade_prediction = min(4.0, float(student_profile.current_gpa) + 0.3)
            elif average_score >= 70:
                grade_prediction = min(4.0, float(student_profile.current_gpa) + 0.1)
            else:
                grade_prediction = max(2.0, float(student_profile.current_gpa) - 0.1)

            insights_data = {
                'performance_analysis': {
                    'overall_trend': overall_trend,
                    'strongest_areas': strengths,
                    'areas_needing_attention': improvements,
                    'grade_prediction': round(grade_prediction, 2)
                },
                'learning_patterns': {
                    'optimal_study_time': 'Morning (9 AM - 12 PM)' if average_score >= 75 else 'Evening (7 PM - 10 PM)',
                    'attention_span': f'{avg_session_minutes}-{avg_session_minutes + 15} minutes',
                    'learning_efficiency': learning_efficiency,
                    'retention_rate': retention_rate
                },
                'ai_recommendations': recommendations,
                'study_optimization': {
                    'suggested_schedule': f'{int(total_study_hours / 4)} hours per week, divided into {int(total_study_hours / (avg_session_minutes / 60)) if avg_session_minutes > 0 else "multiple"} sessions',
                    'focus_areas': strongest_courses[:2] + weakest_courses[:2] if (
                                strongest_courses or weakest_courses) else ['Core concepts', 'Practice problems'],
                    'time_allocation': f'Spend 40% on {weakest_courses[0] if weakest_courses else "weaker areas"}, 30% on practice, 30% on review'
                },
                'ai_powered': False,
                'model': 'Statistical Analysis (Gemini AI unavailable)'
            }

        # ========== ADD REAL METRICS TO RESPONSE ==========
        insights_data['study_metrics'] = {
            'total_study_hours': total_study_hours,
            'average_session_minutes': avg_session_minutes,
            'courses_analyzed': len(courses_data),
            'average_score': average_score
        }

        insights_data['ai_powered'] = ai_powered
        if ai_powered:
            insights_data['model'] = 'Gemini 2.5 Flash'

        return Response(insights_data, status=drf_status.HTTP_200_OK)

    except StudentProfile.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=drf_status.HTTP_404_NOT_FOUND)
    except Exception as e:
        import traceback
        print(f"❌ Error in get_ai_learning_insights: {traceback.format_exc()}")
        return Response({'error': f'Server error: {str(e)}'}, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_available_courses(request):
    """
    Get all courses available for student enrollment
    ONLY shows courses with REAL instructors assigned from database
    NO dummy or placeholder data
    """
    if not hasattr(request.user, 'user_type') or request.user.user_type != 'student':
        return Response({
            'error': 'Only students can view available courses'
        }, status=drf_status.HTTP_403_FORBIDDEN)

    try:
        from courses.models import Course, CourseEnrollment
        from students.models import StudentProfile

        student = StudentProfile.objects.get(user=request.user)

        # Get ONLY courses with REAL instructor assignments
        # Filter: must have instructor, instructor must exist, and course must be approved/active
        available_courses = Course.objects.filter(
            status__in=['approved', 'active'],
            instructor__isnull=False  # MUST have an instructor
        ).select_related(
            'instructor__user',
            'subject'
        ).prefetch_related('enrollments')

        # Get student's current enrollments
        student_enrollments = CourseEnrollment.objects.filter(
            student=student
        ).values_list('course_id', flat=True)

        courses_data = []
        for course in available_courses:
            # Double-check instructor exists (safety check)
            if not course.instructor or not course.instructor.user:
                continue  # Skip courses without valid instructor

            # Check if already enrolled
            is_enrolled = course.id in student_enrollments
            enrollment_status = None

            if is_enrolled:
                enrollment = CourseEnrollment.objects.get(student=student, course=course)
                enrollment_status = enrollment.status

            courses_data.append({
                'id': course.id,
                'title': course.title,
                'code': course.code,
                'description': course.description or 'No description provided',
                'credits': course.credits,
                'difficulty_level': course.difficulty_level,
                'instructor_name': course.instructor.user.get_full_name(),  # REAL instructor name from DB
                'instructor_id': course.instructor.id,  # Include instructor ID for verification
                'subject_name': course.subject.name if course.subject else 'General',
                'subject_code': course.subject.code if course.subject else 'N/A',
                'current_enrollments': course.enrolled_count,
                'enrollment_limit': course.enrollment_limit,
                'is_enrolled': is_enrolled,
                'enrollment_status': enrollment_status,
                'can_enroll': not is_enrolled and course.enrolled_count < course.enrollment_limit,
                'start_date': course.start_date.isoformat() if course.start_date else None,
                'end_date': course.end_date.isoformat() if course.end_date else None,
                'status': course.status
            })

        return Response({
            'available_courses': courses_data,
            'total_courses': len(courses_data),
            'enrolled_count': len(student_enrollments),
            'message': 'Showing only courses with assigned instructors. Contact your teacher to request enrollment.' if len(
                courses_data) > 0 and len(
                student_enrollments) == 0 else None
        })

    except StudentProfile.DoesNotExist:
        return Response({
            'error': 'Student profile not found'
        }, status=drf_status.HTTP_404_NOT_FOUND)
    except Exception as e:
        import traceback
        print(f"Error getting available courses: {traceback.format_exc()}")
        return Response({
            'error': f'Server error: {str(e)}'
        }, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_enrollments(request):
    """
    Get all enrollments for the logged-in student
    Shows current, pending, and completed courses
    """
    if not hasattr(request.user, 'user_type') or request.user.user_type != 'student':
        return Response({
            'error': 'Only students can view enrollments'
        }, status=drf_status.HTTP_403_FORBIDDEN)

    try:
        from courses.models import CourseEnrollment
        from students.models import StudentProfile

        student = StudentProfile.objects.get(user=request.user)

        enrollments = CourseEnrollment.objects.filter(
            student=student
        ).select_related(
            'course__instructor__user',
            'course__subject'
        ).order_by('-enrollment_date')

        enrollments_data = []
        for enrollment in enrollments:
            enrollments_data.append({
                'id': enrollment.id,
                'course': {
                    'id': enrollment.course.id,
                    'title': enrollment.course.title,
                    'code': enrollment.course.code,
                    'subject': enrollment.course.subject.name,
                    'instructor': enrollment.course.instructor.user.get_full_name()
                },
                'status': enrollment.status,
                'enrollment_date': enrollment.enrollment_date.isoformat(),
                'completion_percentage': float(enrollment.completion_percentage),
                'grade': enrollment.grade,
                'ai_features_unlocked': enrollment.ai_features_unlocked,
                'approved_by': enrollment.approved_by.get_full_name() if enrollment.approved_by else None,
                'approved_at': enrollment.approved_at.isoformat() if enrollment.approved_at else None,
                'rejection_reason': enrollment.rejection_reason
            })

        # Categorize enrollments
        pending = [e for e in enrollments_data if e['status'] == 'pending']
        active = [e for e in enrollments_data if e['status'] == 'active']
        completed = [e for e in enrollments_data if e['status'] == 'completed']
        rejected = [e for e in enrollments_data if e['status'] == 'rejected']

        return Response({
            'all_enrollments': enrollments_data,
            'by_status': {
                'pending': pending,
                'active': active,
                'completed': completed,
                'rejected': rejected
            },
            'counts': {
                'total': len(enrollments_data),
                'pending': len(pending),
                'active': len(active),
                'completed': len(completed),
                'rejected': len(rejected)
            }
        })

    except StudentProfile.DoesNotExist:
        return Response({
            'error': 'Student profile not found'
        }, status=drf_status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to fetch enrollments: {str(e)}'
        }, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_student_assignments(request):
    """Get all assignments for student's enrolled courses - REAL DATA ONLY"""
    if request.user.user_type != 'student':
        return Response({'error': 'Student access only'}, status=drf_status.HTTP_403_FORBIDDEN)

    try:
        import os
        student_profile = StudentProfile.objects.get(user=request.user)

        # Get enrolled courses
        enrollments = CourseEnrollment.objects.filter(
            student=student_profile,
            status='active'
        ).select_related('course')

        enrolled_courses = [e.course for e in enrollments]

        if not enrolled_courses:
            return Response({
                'assignments': [],
                'total_assignments': 0,
                'pending_count': 0,
                'submitted_count': 0,
                'graded_count': 0,
                'message': 'No active course enrollments. Enroll in courses to see assignments.'
            }, status=drf_status.HTTP_200_OK)

        # Get assignments from enrolled courses
        from courses.models import Assignment, AssignmentSubmission

        assignments = Assignment.objects.filter(
            course__in=enrolled_courses,
            is_published=True
        ).select_related('course').order_by('due_date')

        if not assignments.exists():
            return Response({
                'assignments': [],
                'total_assignments': 0,
                'pending_count': 0,
                'submitted_count': 0,
                'graded_count': 0,
                'message': 'No assignments published yet. Your teachers will publish assignments soon.'
            }, status=drf_status.HTTP_200_OK)

        assignments_data = []
        for assignment in assignments:
            # Check if student has submitted
            try:
                submission = AssignmentSubmission.objects.get(
                    assignment=assignment,
                    student=student_profile
                )

                # Determine status
                if submission.points_earned is not None:
                    status = 'graded'
                else:
                    status = 'submitted'

                submission_data = {
                    'id': submission.id,
                    'submitted_at': submission.submitted_at.isoformat(),
                    'submission_text': submission.submission_text,
                    'points_earned': float(submission.points_earned) if submission.points_earned else None,
                    'feedback': submission.feedback,
                    'is_late': submission.is_late,
                    'percentage_score': submission.percentage_score if submission.points_earned else 0
                }

                # Add file info if exists
                if submission.file_upload:
                    submission_data['file'] = {
                        'url': submission.file_upload.url,
                        'filename': submission.file_name,
                        'size': submission.file_size
                    }

                # Add AI detection if performed
                if submission.ai_detection_performed:
                    submission_data['ai_detection'] = {
                        'score': float(submission.ai_detection_score) if submission.ai_detection_score else 0,
                        'is_flagged': submission.is_flagged_ai,
                        'flag_reason': submission.flag_reason,
                        'result': submission.ai_detection_result
                    }

            except AssignmentSubmission.DoesNotExist:
                # Not submitted yet - determine if pending or overdue
                is_overdue = timezone.now() > assignment.due_date
                status = 'overdue' if is_overdue else 'pending'
                submission_data = None

            assignment_data = {
                'id': assignment.id,
                'title': assignment.title,
                'description': assignment.description,
                'course_title': assignment.course.title,
                'course_id': assignment.course.id,
                'due_date': assignment.due_date.isoformat(),
                'max_points': float(assignment.max_points),
                'assignment_type': assignment.assignment_type,
                'status': status,
                'submission': submission_data
            }

            # Add attachment if exists
            if assignment.attachment_file:
                assignment_data['attachment'] = {
                    'url': assignment.attachment_file.url,
                    'filename': assignment.attachment_filename or os.path.basename(assignment.attachment_file.name),
                    'size': assignment.attachment_file.size if hasattr(assignment.attachment_file, 'size') else 0
                }

            assignments_data.append(assignment_data)

        # Calculate counts
        pending_count = len([a for a in assignments_data if a['status'] in ['pending', 'overdue']])
        submitted_count = len([a for a in assignments_data if a['status'] == 'submitted'])
        graded_count = len([a for a in assignments_data if a['status'] == 'graded'])

        return Response({
            'assignments': assignments_data,
            'total_assignments': len(assignments_data),
            'pending_count': pending_count,
            'submitted_count': submitted_count,
            'graded_count': graded_count,
            'enrolled_courses_count': len(enrolled_courses)
        }, status=drf_status.HTTP_200_OK)

    except StudentProfile.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=drf_status.HTTP_404_NOT_FOUND)
    except Exception as e:
        import traceback
        print(f"Error fetching assignments: {traceback.format_exc()}")
        return Response({'error': f'Server error: {str(e)}'}, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_assignment(request):
    """Submit an assignment with file upload and AI detection"""
    if request.user.user_type != 'student':
        return Response({'error': 'Student access only'}, status=drf_status.HTTP_403_FORBIDDEN)

    try:
        student_profile = StudentProfile.objects.get(user=request.user)

        # Get assignment ID
        assignment_id = request.data.get('assignment_id')
        if not assignment_id:
            return Response({'error': 'assignment_id is required'}, status=drf_status.HTTP_400_BAD_REQUEST)

        # Get assignment
        from courses.models import Assignment, AssignmentSubmission
        try:
            assignment = Assignment.objects.get(id=assignment_id)
        except Assignment.DoesNotExist:
            return Response({'error': 'Assignment not found'}, status=drf_status.HTTP_404_NOT_FOUND)

        # Check if student is enrolled in the course
        if not CourseEnrollment.objects.filter(
                student=student_profile,
                course=assignment.course,
                status='active'
        ).exists():
            return Response({'error': 'You are not enrolled in this course'}, status=drf_status.HTTP_403_FORBIDDEN)

        # Check if already submitted
        if AssignmentSubmission.objects.filter(assignment=assignment, student=student_profile).exists():
            return Response({'error': 'You have already submitted this assignment'}, status=drf_status.HTTP_400_BAD_REQUEST)

        # Get submission data
        submission_text = request.data.get('submission_text', '')
        file_upload = request.FILES.get('file')

        # Validate - need at least one of text or file
        if not submission_text and not file_upload:
            return Response({'error': 'Please provide either text submission or file upload'},
                            status=drf_status.HTTP_400_BAD_REQUEST)

        # Check if late
        is_late = timezone.now() > assignment.due_date

        # Create submission
        submission = AssignmentSubmission.objects.create(
            assignment=assignment,
            student=student_profile,
            submission_text=submission_text,
            is_late=is_late
        )

        # Handle file upload
        if file_upload:
            submission.file_upload = file_upload
            submission.file_name = file_upload.name
            submission.file_size = file_upload.size
            submission.save()

        # Perform AI detection on text
        ai_detection_result = None
        if submission_text:
            # Import detection function from assignment_views
            from teachers.assignment_views import detect_ai_content
            ai_detection_result = detect_ai_content(submission_text)

            submission.ai_detection_performed = True
            submission.ai_detection_timestamp = timezone.now()
            submission.ai_detection_score = ai_detection_result['confidence']
            submission.ai_detection_result = ai_detection_result
            submission.is_flagged_ai = ai_detection_result['is_ai_generated']
            if submission.is_flagged_ai:
                submission.flag_reason = ai_detection_result['warning']
            submission.save()

        response_data = {
            'success': True,
            'message': 'Assignment submitted successfully!',
            'submission': {
                'id': submission.id,
                'submitted_at': submission.submitted_at.isoformat(),
                'is_late': is_late,
                'has_file': bool(file_upload),
                'has_text': bool(submission_text)
            }
        }

        # Include AI detection results if performed
        if ai_detection_result:
            response_data['ai_detection'] = ai_detection_result

        return Response(response_data, status=drf_status.HTTP_201_CREATED)

    except StudentProfile.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=drf_status.HTTP_404_NOT_FOUND)
    except Exception as e:
        import traceback
        print(f"Error submitting assignment: {traceback.format_exc()}")
        return Response({'error': f'Server error: {str(e)}'}, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_assignment_detail(request, assignment_id):
    """Get detailed information about a specific assignment"""
    if request.user.user_type != 'student':
        return Response({'error': 'Student access only'}, status=drf_status.HTTP_403_FORBIDDEN)

    try:
        student_profile = StudentProfile.objects.get(user=request.user)

        # Get assignment
        from courses.models import Assignment, AssignmentSubmission
        try:
            assignment = Assignment.objects.select_related('course').get(id=assignment_id)
        except Assignment.DoesNotExist:
            return Response({'error': 'Assignment not found'}, status=drf_status.HTTP_404_NOT_FOUND)

        # Check if student is enrolled
        if not CourseEnrollment.objects.filter(
                student=student_profile,
                course=assignment.course,
                status='active'
        ).exists():
            return Response({'error': 'You are not enrolled in this course'}, status=drf_status.HTTP_403_FORBIDDEN)

        # Get submission if exists
        try:
            submission = AssignmentSubmission.objects.get(
                assignment=assignment,
                student=student_profile
            )
            has_submitted = True
            submission_data = {
                'id': submission.id,
                'submitted_at': submission.submitted_at.isoformat(),
                'submission_text': submission.submission_text,
                'points_earned': float(submission.points_earned) if submission.points_earned else None,
                'feedback': submission.feedback,
                'is_late': submission.is_late,
                'is_graded': submission.points_earned is not None
            }

            if submission.file_upload:
                submission_data['file'] = {
                    'url': submission.file_upload.url,
                    'filename': submission.file_name,
                    'size': submission.file_size
                }

            if submission.ai_detection_performed:
                submission_data['ai_detection'] = {
                    'score': float(submission.ai_detection_score) if submission.ai_detection_score else 0,
                    'is_flagged': submission.is_flagged_ai,
                    'flag_reason': submission.flag_reason
                }
        except AssignmentSubmission.DoesNotExist:
            has_submitted = False
            submission_data = None

        assignment_data = {
            'id': assignment.id,
            'title': assignment.title,
            'description': assignment.description,
            'course_title': assignment.course.title,
            'course_code': assignment.course.code,
            'due_date': assignment.due_date.isoformat(),
            'max_points': float(assignment.max_points),
            'assignment_type': assignment.assignment_type,
            'has_submitted': has_submitted,
            'submission': submission_data
        }

        # Add attachment if exists
        if assignment.attachment_file:
            assignment_data['attachment'] = {
                'url': assignment.attachment_file.url,
                'filename': assignment.attachment_filename,
                'size': assignment.attachment_file.size if hasattr(assignment.attachment_file, 'size') else 0
            }

        return Response(assignment_data)

    except StudentProfile.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=drf_status.HTTP_404_NOT_FOUND)
    except Exception as e:
        import traceback
        print(f"Error getting assignment detail: {traceback.format_exc()}")
        return Response({'error': f'Server error: {str(e)}'}, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)
