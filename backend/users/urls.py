from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('verify-token/', views.verify_token, name='verify_token'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('dashboard/', views.dashboard_data, name='dashboard'),
    path('change-password/', views.change_password, name='change-password'),

    # Admin endpoints
    path('admin/pending-teachers/', views.pending_teachers, name='pending_teachers'),
    path('admin/pending-students/', views.pending_students, name='pending_students'),
    path('admin/approve-teacher/<int:teacher_id>/', views.approve_teacher, name='approve_teacher'),
    path('admin/reject-teacher/<int:teacher_id>/', views.reject_teacher, name='reject_teacher'),
    path('admin/approve-student/<int:student_id>/', views.approve_student, name='approve_student'),
    path('admin/reject-student/<int:student_id>/', views.reject_student, name='reject_student'),
    path('all-users/', views.all_users, name='all_users'),
    path('toggle-status/<int:user_id>/', views.toggle_user_status, name='toggle_user_status'),
]
