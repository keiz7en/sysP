from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'career'

router = DefaultRouter()
router.register(r'skills', views.SkillViewSet)
router.register(r'job-market', views.JobMarketDataViewSet)
router.register(r'resumes', views.ResumeViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('skill-assessment/', views.SkillAssessmentView.as_view(), name='skill-assessment'),
    path('job-recommendations/', views.JobRecommendationView.as_view(), name='job-recommendations'),
    path('resume-optimization/', views.ResumeOptimizationView.as_view(), name='resume-optimization'),
    path('training-programs/', views.TrainingProgramView.as_view(), name='training-programs'),
]
