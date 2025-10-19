from django.urls import path
from . import views

app_name = 'assessments'

urlpatterns = [
    path('', views.AssessmentViewSet.as_view({'get': 'list', 'post': 'create'}), name='assessment-list'),
    path('<int:pk>/', views.AssessmentViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='assessment-detail'),
    path('questions/', views.QuestionViewSet.as_view({'get': 'list', 'post': 'create'}), name='question-list'),
    path('questions/<int:pk>/', views.QuestionViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='question-detail'),
    path('attempts/', views.StudentAssessmentAttemptViewSet.as_view({'get': 'list', 'post': 'create'}), name='attempt-list'),
    path('attempts/<int:pk>/', views.StudentAssessmentAttemptViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='attempt-detail'),
    path('statistics/', views.assessment_statistics, name='assessment-statistics'),
]
