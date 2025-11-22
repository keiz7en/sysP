from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .assignment_views import (
    teacher_assignments,
    assignment_detail,
    generate_ai_assignment,
    assignment_submissions,
    grade_submission
)
from .exam_views import (
    teacher_exams,
    exam_detail,
    publish_exam,
    get_exam_submissions,
    grade_submission as grade_exam_submission
)
from .grading_views import (
    get_review_queue,
    get_course_submissions,
    get_student_progress,
    publish_final_grade,
    get_course_analytics
)

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

    # Assignment Management URLs
    path('assignments/', teacher_assignments, name='teacher-assignments'),
    path('assignments/<int:assignment_id>/', assignment_detail, name='assignment-detail'),
    path('assignments/<int:assignment_id>/submissions/', assignment_submissions, name='assignment-submissions'),
    path('assignments/generate-ai/', generate_ai_assignment, name='generate-ai-assignment'),
    path('assignments/grade/<int:submission_id>/', grade_submission, name='grade-submission'),

    # Exam Management URLs
    path('exams/', teacher_exams, name='teacher-exams'),
    path('exams/<int:exam_id>/', exam_detail, name='exam-detail'),
    path('exams/<int:exam_id>/publish/', publish_exam, name='publish-exam'),
    path('exams/<int:exam_id>/submissions/', get_exam_submissions, name='exam-submissions'),
    path('exams/grade/<int:attempt_id>/', grade_exam_submission, name='grade-exam-submission'),

    # Gradebook & Grading URLs
    path('gradebook/', views.get_gradebook, name='gradebook'),
    path('gradebook/grade/', views.grade_from_gradebook, name='grade-from-gradebook'),
    path('grading/review-queue/', get_review_queue, name='review-queue'),
    path('grading/course/<int:course_id>/submissions/', get_course_submissions, name='course-submissions'),
    path('grading/student/<int:course_id>/<int:student_id>/', get_student_progress, name='student-progress'),
    path('grading/publish/<int:enrollment_id>/', publish_final_grade, name='publish-final-grade'),
    path('grading/analytics/<int:course_id>/', get_course_analytics, name='course-analytics'),

    # Existing comprehensive teacher endpoints
    path('teaching-analytics/', views.get_teaching_analytics, name='teaching-analytics'),
    path('ai-content/', views.ai_content_digitization, name='ai-content-digitization'),
    path('performance-insights/', views.get_student_performance_insights, name='performance-insights'),
    path('speech-to-text/', views.speech_to_text_transcription, name='speech-to-text'),
    path('assessment-tools/', views.advanced_assessment_tools, name='assessment-tools'),
    path('teaching-resources/', views.get_teaching_resources, name='teaching-resources'),
]
