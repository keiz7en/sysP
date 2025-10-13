from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import authenticate
from .models import User, UserProfile
from .serializers import UserSerializer, UserProfileSerializer, UserUpdateSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserProfileUpdateView(generics.UpdateAPIView):
    """Update user profile information"""
    serializer_class = UserUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserProfileDetailView(generics.RetrieveUpdateAPIView):
    """Get and update extended user profile"""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_stats(request):
    """Get user statistics"""
    user = request.user
    stats = {
        'user_type': user.user_type,
        'is_verified': user.is_verified,
        'join_date': user.date_joined,
        'last_login': user.last_login,
    }

    if user.user_type == 'student':
        from students.models import StudentProfile
        try:
            student_profile = StudentProfile.objects.get(user=user)
            stats.update({
                'enrollment_count': student_profile.enrolled_courses.count(),
                'completed_assessments': student_profile.assessment_results.count(),
            })
        except StudentProfile.DoesNotExist:
            pass

    elif user.user_type == 'teacher':
        from teachers.models import TeacherProfile
        try:
            teacher_profile = TeacherProfile.objects.get(user=user)
            stats.update({
                'courses_teaching': teacher_profile.courses.count(),
                'total_students': sum(course.enrolled_students.count() for course in teacher_profile.courses.all()),
            })
        except TeacherProfile.DoesNotExist:
            pass

    return Response(stats)
