from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'teachers'

router = DefaultRouter()
router.register(r'profiles', views.TeacherProfileViewSet)
router.register(r'schedules', views.TeachingScheduleViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', views.TeacherDashboardView.as_view(), name='dashboard'),
    path('performance/', views.TeacherPerformanceView.as_view(), name='performance'),
    path('course-management/', views.CourseManagementView.as_view(), name='course-management'),
]
