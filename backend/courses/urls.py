from django.urls import path
from . import views

app_name = 'courses'

urlpatterns = [
    path('', views.CourseViewSet.as_view({'get': 'list', 'post': 'create'}), name='course-list'),
    path('<int:pk>/', views.CourseViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='course-detail'),
    path('modules/', views.CourseModuleViewSet.as_view({'get': 'list', 'post': 'create'}), name='module-list'),
    path('modules/<int:pk>/', views.CourseModuleViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='module-detail'),
    path('enrollments/', views.CourseEnrollmentViewSet.as_view({'get': 'list', 'post': 'create'}), name='enrollment-list'),
    path('enrollments/<int:pk>/', views.CourseEnrollmentViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='enrollment-detail'),
    path('statistics/', views.course_statistics, name='course-statistics'),
]
