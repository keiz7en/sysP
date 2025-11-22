from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .ai_complete_views import (
    ai_academic_analysis,
    ai_personalized_content,
    ai_generate_quiz,
    ai_course_feedback_analysis,
    ai_career_guidance,
    ai_resume_analysis,
    ai_grade_essay,
    ai_performance_prediction,
    ai_chatbot_advisor,
    ai_engagement_analysis,
    ai_comprehensive_dashboard
)
from . import exam_views

router = DefaultRouter()
router.register(r'profiles', views.StudentProfileViewSet, basename='student-profile')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', views.StudentDashboardView.as_view(), name='student-dashboard'),
    path('courses/available/', views.get_available_courses, name='available-courses'),
    path('enrollments/my-enrollments/', views.get_my_enrollments, name='my-enrollments'),
    path('academic-records/', views.AcademicRecordsView.as_view(), name='academic-records'),
    path('adaptive-learning/', views.AdaptiveLearningView.as_view(), name='adaptive-learning'),
    path('career-guidance/', views.CareerGuidanceView.as_view(), name='career-guidance'),
    path('assessments/', views.AssessmentsView.as_view(), name='assessments'),
    path('learning-insights/', views.LearningInsightsView.as_view(), name='learning-insights'),
    path('academic-transcript/', views.get_academic_transcript, name='academic-transcript'),
    path('ai-progress-analysis/', views.get_ai_progress_analysis, name='ai-progress-analysis'),
    path('personalized-learning-path/', views.get_personalized_learning_path, name='personalized-learning-path'),
    path('learning-path/', views.get_personalized_learning_path, name='learning-path'),  # Frontend compatibility
    path('engagement-analytics/', views.get_engagement_analytics, name='engagement-analytics'),
    path('generate-ai-assessment/', views.generate_ai_assessment, name='generate-ai-assessment'),
    path('ai-learning-insights/', views.get_ai_learning_insights, name='ai-learning-insights'),

    # ========== ASSIGNMENT MANAGEMENT ENDPOINTS ==========
    path('assignments/', views.get_student_assignments, name='student-assignments'),
    path('submit-assignment/', views.submit_assignment, name='submit-assignment'),
    path('assignment/<int:assignment_id>/', views.get_assignment_detail, name='assignment-detail'),

    # ========== EXAM TAKING ENDPOINTS ==========
    path('exams/<int:exam_id>/start/', exam_views.start_exam, name='start-exam'),
    path('exam-attempts/<int:attempt_id>/submit/', exam_views.submit_exam, name='submit-exam'),
    path('exam-attempts/<int:attempt_id>/status/', exam_views.get_attempt_status, name='exam-attempt-status'),

    # ========== AI-POWERED ENDPOINTS (Gemini AI) ==========
    # Feature 1: Student Information & Academic Records (AI-Enhanced)
    path('ai/academic-analysis/', ai_academic_analysis, name='ai-academic-analysis'),

    # Feature 2: Personalized & Adaptive Learning (AI-Powered)
    path('ai/personalized-content/', ai_personalized_content, name='ai-personalized-content'),
    path('ai/generate-quiz/', ai_generate_quiz, name='ai-generate-quiz'),

    # Feature 3: Teacher & Course Management (AI-Enhanced)
    path('ai/feedback-analysis/', ai_course_feedback_analysis, name='ai-feedback-analysis'),

    # Feature 4: Career Guidance & Employability (AI-Powered)
    path('ai/career-guidance/', ai_career_guidance, name='ai-career-guidance'),
    path('ai/resume-analysis/', ai_resume_analysis, name='ai-resume-analysis'),

    # Feature 5: Academic Automation & Assessment (AI-Enhanced)
    path('ai/grade-essay/', ai_grade_essay, name='ai-grade-essay'),

    # Feature 6: Research & Policy Insights (AI-Powered)
    path('ai/performance-prediction/', ai_performance_prediction, name='ai-performance-prediction'),

    # Feature 7: Engagement & Accessibility (AI-Enhanced)
    path('ai/chatbot/', ai_chatbot_advisor, name='ai-chatbot'),
    path('ai/engagement-analysis/', ai_engagement_analysis, name='ai-engagement-analysis'),

    # Comprehensive AI Dashboard
    path('ai/dashboard/', ai_comprehensive_dashboard, name='ai-dashboard'),
]
