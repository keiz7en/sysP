from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views
from .admin_views import SystemSettingsView
from .user_management_views import UserManagementViewSet

router = DefaultRouter()
router.register(r'manage', UserManagementViewSet, basename='user-manage')

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('verify-token/', views.verify_token, name='verify_token'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('dashboard/', views.dashboard_data, name='dashboard'),
    path('change-password/', views.change_password, name='change-password'),
    path('delete-account/', views.delete_account, name='delete-account'),
    path('delete-user/<int:user_id>/', views.delete_user_account, name='delete-user-account'),

    # Admin endpoints
    path('admin/pending-teachers/', views.pending_teachers, name='pending_teachers'),
    path('admin/pending-students/', views.pending_students, name='pending_students'),
    path('admin/approve-teacher/<int:teacher_id>/', views.approve_teacher, name='approve_teacher'),
    path('admin/reject-teacher/<int:teacher_id>/', views.reject_teacher, name='reject_teacher'),
    path('admin/approve-student/<int:student_id>/', views.approve_student, name='approve_student'),
    path('admin/reject-student/<int:student_id>/', views.reject_student, name='reject_student'),
    path('admin/system-settings/', SystemSettingsView.as_view(), name='system_settings'),
    path('all-users/', views.all_users, name='all_users'),
    path('toggle-status/<int:user_id>/', views.toggle_user_status, name='toggle_user_status'),
] + router.urls
