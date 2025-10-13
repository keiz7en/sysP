from django.urls import path
from . import views

app_name = 'analytics'

urlpatterns = [
    path('learning-analytics/', views.LearningAnalyticsView.as_view(), name='learning-analytics'),
    path('dropout-prediction/', views.DropoutPredictionView.as_view(), name='dropout-prediction'),
    path('performance-trends/', views.PerformanceTrendsView.as_view(), name='performance-trends'),
    path('institutional/', views.InstitutionalAnalyticsView.as_view(), name='institutional'),
    path('effectiveness/', views.LearningEffectivenessView.as_view(), name='effectiveness'),
    path('admission-analysis/', views.AdmissionOutcomeAnalysisView.as_view(), name='admission-analysis'),
]
