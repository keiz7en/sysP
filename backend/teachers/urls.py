from django.urls import path
from . import views

app_name = 'teachers'

urlpatterns = [
    # Teacher dashboard
    path('dashboard/', views.TeacherDashboardView.as_view(), name='teacher_dashboard'),

    # Student management
    path('students/', views.StudentManagementView.as_view(), name='student_management'),
    path('students/add/', views.StudentManagementView.as_view(), name='add_student'),
    path('students/remove/<str:student_id>/', views.StudentManagementView.as_view(), name='remove_student'),
    path('students/bulk-upload/', views.BulkStudentUploadView.as_view(), name='bulk_student_upload'),

    # Course management
    path('courses/', views.TeacherCoursesView.as_view(), name='teacher_courses'),

    # Profile and performance
    path('profile/', views.TeacherDashboardView.as_view(), name='teacher_profile'),
]
