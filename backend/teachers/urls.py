from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'teachers'

router = DefaultRouter()
router.register(r'profiles', views.TeacherProfileViewSet)
router.register(r'schedules', views.TeachingScheduleViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # Teacher dashboard
    path('dashboard/', views.TeacherDashboardView.as_view(), name='teacher_dashboard'),

    # Student management
    path('students/', views.StudentManagementView.as_view(), name='student_management'),
    path('students/add/', views.StudentManagementView.as_view(), name='add_student'),
    path('students/remove/<str:student_id>/', views.StudentManagementView.as_view(), name='remove_student'),
    path('students/bulk-upload/', views.BulkStudentUploadView.as_view(), name='bulk_student_upload'),

    # Course management
    path('courses/', views.TeacherCoursesView.as_view(), name='teacher_courses'),

    # Legacy endpoints (if any exist)
    path('profile/', views.TeacherDashboardView.as_view(), name='teacher_profile'),
    path('performance/', views.TeacherPerformanceView.as_view(), name='performance'),
    path('course-management/', views.CourseManagementView.as_view(), name='course-management'),
]
