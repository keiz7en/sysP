from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('verify-token/', views.verify_token, name='verify_token'),
    path('profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('dashboard/', views.dashboard_data, name='dashboard_data'),

    # Admin endpoints
    path('admin/pending-teachers/', views.pending_teachers, name='pending_teachers'),
    path('admin/approve-teacher/<int:teacher_id>/', views.approve_teacher, name='approve_teacher'),
    path('admin/reject-teacher/<int:teacher_id>/', views.reject_teacher, name='reject_teacher'),
]
