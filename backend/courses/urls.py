from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views, management_views

app_name = 'courses'

router = DefaultRouter()
router.register(r'subjects', management_views.SubjectViewSet, basename='subject')
router.register(r'subject-requests', management_views.TeacherSubjectRequestViewSet, basename='subject-request')
router.register(r'approved-subjects', management_views.TeacherApprovedSubjectViewSet, basename='approved-subject')
router.register(r'courses', management_views.CourseViewSet, basename='course')
router.register(r'enrollments', management_views.CourseEnrollmentViewSet, basename='enrollment')

urlpatterns = [
    path('', include(router.urls)),
    path('statistics/', views.course_statistics, name='course-statistics'),
]
