"""
URL configuration for education_system project.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def api_health(request):
    return Response({
        'status': 'success',
        'message': 'EduAI Backend API is running!',
        'version': '1.0.0'
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', api_health, name='api_health'),

    # App URLs
    path('api/users/', include('users.urls')),
    path('api/students/', include('students.urls')),
    path('api/teachers/', include('teachers.urls')),
    path('api/courses/', include('courses.urls')),
    path('api/assessments/', include('assessments.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/career/', include('career.urls')),
    path('api/chatbot/', include('chatbot.urls')),
]
