from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'students'

router = DefaultRouter()
router.register(r'profiles', views.StudentProfileViewSet)
router.register(r'academic-records', views.AcademicRecordViewSet)
router.register(r'attendance', views.AttendanceRecordViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', views.StudentDashboardView.as_view(), name='dashboard'),
    path('progress/', views.LearningProgressView.as_view(), name='progress'),
    path('behavior-metrics/', views.BehaviorMetricsView.as_view(), name='behavior-metrics'),
]
