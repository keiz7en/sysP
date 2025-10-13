from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    # Authentication endpoints
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('verify-token/', views.verify_token, name='verify_token'),

    # Profile endpoints  
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('dashboard/', views.dashboard_data, name='dashboard'),
]
