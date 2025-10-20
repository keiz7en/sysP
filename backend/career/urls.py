from django.urls import path
from . import views

urlpatterns = [
    # Original endpoints (working)
    path('recommendations/', views.career_recommendations, name='career-recommendations'),
    path('market-data/', views.job_market_data, name='job-market-data'),
    path('skill-assessment/', views.SkillAssessmentView.as_view(), name='skill-assessment'),
    path('training-programs/', views.training_programs, name='training-programs'),

    # New comprehensive career endpoints (fixed names)
    path('ai-resume-analysis/', views.ai_resume_analysis, name='ai-resume-analysis'),
    path('skill-gap-analysis/', views.get_skill_gap_analysis, name='skill-gap-analysis'),
    path('career-guidance/', views.get_career_recommendations, name='career-guidance'),
    path('training-resources/', views.get_training_programs, name='training-resources'),
    path('market-insights/', views.get_market_insights, name='market-insights'),
]
