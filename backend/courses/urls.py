from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views, management_views, enrollment_views, grading_views, admin_analytics_views

app_name = 'courses'

router = DefaultRouter()
router.register(r'subjects', management_views.SubjectViewSet, basename='subject')
router.register(r'subject-requests', management_views.TeacherSubjectRequestViewSet,
                basename='teacher-subject-request')
router.register(r'teacher-approved-subjects', management_views.TeacherApprovedSubjectViewSet,
                basename='teacher-approved-subject')
router.register(r'courses', management_views.CourseViewSet, basename='course')
router.register(r'course-enrollments', management_views.CourseEnrollmentViewSet, basename='course-enrollment')
router.register(r'modules', views.CourseModuleViewSet, basename='module')

urlpatterns = [
    path('', include(router.urls)),

    # Subject Management - Frontend compatible URLs
    path('subject-requests/my_requests/', management_views.get_my_subject_requests, name='my_subject_requests'),
    path('approved-subjects/my_subjects/', management_views.get_my_approved_subjects, name='my_approved_subjects'),

    # Enrollment Management (NEW - Implements UML Enrollment Sequence)
    path('enrollments/request/', enrollment_views.request_enrollment, name='request_enrollment'),
    path('enrollments/pending/', enrollment_views.get_pending_enrollments, name='get_pending_enrollments'),
    path('enrollments/pending_enrollments/', enrollment_views.get_pending_enrollments,
         name='get_pending_enrollments_underscore'),  # Frontend compatibility
    path('enrollments/<int:enrollment_id>/approve/', enrollment_views.approve_enrollment, name='approve_enrollment'),
    path('enrollments/<int:enrollment_id>/reject/', enrollment_views.reject_enrollment, name='reject_enrollment'),
    path('enrollments/<int:enrollment_id>/ai-access/', enrollment_views.check_ai_access, name='check_ai_access'),
    path('enrollments/<int:enrollment_id>/details/', enrollment_views.get_enrollment_details,
         name='get_enrollment_details'),

    # Grading Management (NEW - Implements UML Grading Sequence)
    path('assignments/submit/', grading_views.submit_assignment, name='submit_assignment'),
    path('grading/pending/', grading_views.get_pending_grading, name='get_pending_grading'),
    path('grading/submission/<int:submission_id>/', grading_views.get_submission_details,
         name='get_submission_details'),
    path('grading/submission/<int:submission_id>/grade/', grading_views.grade_submission, name='grade_submission'),
    path('grading/final-grades/pending/', grading_views.get_pending_final_grades, name='get_pending_final_grades'),
    path('grading/grade/<int:grade_id>/publish/', grading_views.publish_grade, name='publish_grade'),
    path('grading/enrollments/<int:enrollment_id>/breakdown/', grading_views.get_grade_breakdown,
         name='get_grade_breakdown'),

    # Teacher Rating (Implements Phase 6 of Grading Sequence)
    path('ratings/submit/', grading_views.submit_teacher_rating, name='submit_teacher_rating'),
    path('ratings/my-ratings/', grading_views.get_teacher_ratings, name='get_teacher_ratings'),
    path('statistics/', views.course_statistics, name='course-statistics'),

    # Admin Analytics Endpoints
    path('analytics/dashboard/', admin_analytics_views.get_admin_dashboard_stats, name='admin-dashboard-stats'),
    path('analytics/activity-logs/', admin_analytics_views.get_activity_logs, name='activity-logs'),
    path('analytics/course/<uuid:course_id>/', admin_analytics_views.get_course_analytics, name='course-analytics'),
    path('analytics/risk-analysis/', admin_analytics_views.get_student_risk_analysis, name='student-risk-analysis'),

    # Course Modules - Nested route for specific course
    path('<int:course_id>/modules/', views.CourseModuleViewSet.as_view({'get': 'list'}), name='course-modules'),
    path('<int:course_id>/syllabus/', views.course_syllabus, name='course-syllabus'),
]
