"""
URL configuration for education_system project.
"""
from django.contrib import admin
from django.urls import path
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
]
