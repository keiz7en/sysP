from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'assessments'

router = DefaultRouter()
router.register(r'assessments', views.AssessmentViewSet)
router.register(r'questions', views.QuestionViewSet)
router.register(r'attempts', views.StudentAssessmentAttemptViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('ai-grading/', views.AIGradingView.as_view(), name='ai-grading'),
    path('analytics/', views.AssessmentAnalyticsView.as_view(), name='analytics'),
    path('auto-generate/', views.AutoGenerateQuestionsView.as_view(), name='auto-generate'),
]
