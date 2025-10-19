from django.urls import path
from . import views

app_name = 'career'

urlpatterns = [
    path('recommendations/', views.career_recommendations, name='career-recommendations'),
    path('job-market/', views.job_market_data, name='job-market-data'),
    path('skill-assessment/', views.SkillAssessmentView.as_view(), name='skill-assessment'),
    path('training-programs/', views.training_programs, name='training-programs'),
]
