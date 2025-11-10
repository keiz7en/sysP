from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'profiles', views.TeacherProfileViewSet, basename='teacher-profile')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', views.TeacherDashboardView.as_view(), name='teacher-dashboard'),
    path('courses/', views.TeacherCoursesView.as_view(), name='teacher-courses'),
    path('students/', views.StudentManagementView.as_view(), name='student-management'),
    path('students/<int:course_id>/', views.CourseStudentsView.as_view(), name='course-students'),
    path('assessments/', views.TeacherAssessmentsView.as_view(), name='teacher-assessments'),
    path('analytics/', views.TeacherAnalyticsView.as_view(), name='teacher-analytics'),
    path('add-student/', views.add_student_to_course, name='add-student'),
    path('remove-student/', views.remove_student_from_course, name='remove-student'),

    # Student Management URLs
    path('students/approve/<int:student_id>/', views.approve_student, name='approve-student'),
    path('students/reject/<int:student_id>/', views.reject_student, name='reject-student'),
    path('students/remove/<int:student_id>/', views.remove_student_from_course, name='remove-student-from-course'),

    # New comprehensive teacher endpoints
    path('teaching-analytics/', views.get_teaching_analytics, name='teaching-analytics'),
    path('ai-content/', views.ai_content_digitization, name='ai-content-digitization'),
    path('performance-insights/', views.get_student_performance_insights, name='performance-insights'),
    path('speech-to-text/', views.speech_to_text_transcription, name='speech-to-text'),
    path('assessment-tools/', views.advanced_assessment_tools, name='assessment-tools'),
    path('teaching-resources/', views.get_teaching_resources, name='teaching-resources'),
]
