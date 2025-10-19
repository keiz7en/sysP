from django.urls import path
from . import views

app_name = 'analytics'

urlpatterns = [
    path('system/', views.system_analytics, name='system-analytics'),
    path('student-performance/', views.student_performance_analytics, name='student-performance'),
    path('usage-metrics/', views.usage_metrics, name='usage-metrics'),
    path('dashboard/', views.DashboardAnalyticsView.as_view(), name='dashboard-analytics'),
]
