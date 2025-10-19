from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'profiles', views.StudentProfileViewSet, basename='student-profile')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', views.StudentDashboardView.as_view(), name='student-dashboard'),
    path('academic-records/', views.AcademicRecordsView.as_view(), name='academic-records'),
    path('adaptive-learning/', views.AdaptiveLearningView.as_view(), name='adaptive-learning'),
    path('career-guidance/', views.CareerGuidanceView.as_view(), name='career-guidance'),
    path('assessments/', views.AssessmentsView.as_view(), name='assessments'),
    path('learning-insights/', views.LearningInsightsView.as_view(), name='learning-insights'),
]
