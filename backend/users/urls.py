from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('profile/update/', views.UserProfileUpdateView.as_view(), name='user-profile-update'),
    path('profile/details/', views.UserProfileDetailView.as_view(), name='user-profile-details'),
    path('stats/', views.user_stats, name='user-stats'),
]
