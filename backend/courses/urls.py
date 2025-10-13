from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'courses'

router = DefaultRouter()
router.register(r'courses', views.CourseViewSet)
router.register(r'modules', views.CourseModuleViewSet)
router.register(r'enrollments', views.CourseEnrollmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('learning-paths/', views.LearningPathView.as_view(), name='learning-paths'),
    path('gamification/', views.GamificationView.as_view(), name='gamification'),
    path('adaptive-content/', views.AdaptiveContentView.as_view(), name='adaptive-content'),
]
