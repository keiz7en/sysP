from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Q, Count, Avg

from .models import Course, CourseModule, CourseEnrollment, LearningPath, GameificationProgress
from .serializers import CourseSerializer, CourseModuleSerializer, CourseEnrollmentSerializer

User = get_user_model()


class CourseViewSet(viewsets.ModelViewSet):
    """ViewSet for courses"""
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type == 'student':
            # Students can see active courses
            return Course.objects.filter(status='active')
        elif self.request.user.user_type == 'teacher':
            # Teachers can see courses they teach or all active courses
            return Course.objects.filter(
                Q(instructor__user=self.request.user) | Q(status='active')
            )
        elif self.request.user.user_type == 'admin':
            # Admins can see all courses
            return Course.objects.all()
        return Course.objects.none()


class CourseModuleViewSet(viewsets.ModelViewSet):
    """ViewSet for course modules"""
    serializer_class = CourseModuleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Check for course_id in URL kwargs (nested route: /courses/<course_id>/modules/)
        course_id = self.kwargs.get('course_id')
        if not course_id:
            # Check query params if not in URL
            course_id = self.request.query_params.get('course_id')

        if course_id:
            return CourseModule.objects.filter(course_id=course_id).order_by('order')
        return CourseModule.objects.all()


class CourseEnrollmentViewSet(viewsets.ModelViewSet):
    """ViewSet for course enrollments"""
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type == 'student':
            try:
                from students.models import StudentProfile
                student_profile = StudentProfile.objects.get(user=self.request.user)
                return CourseEnrollment.objects.filter(student=student_profile)
            except StudentProfile.DoesNotExist:
                return CourseEnrollment.objects.none()
        elif self.request.user.user_type in ['teacher', 'admin']:
            return CourseEnrollment.objects.all()
        return CourseEnrollment.objects.none()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def course_statistics(request):
    """Get course statistics"""
    try:
        if request.user.user_type == 'admin':
            stats = {
                'total_courses': Course.objects.count(),
                'active_courses': Course.objects.filter(status='active').count(),
                'total_enrollments': CourseEnrollment.objects.count(),
                'average_enrollment': CourseEnrollment.objects.values('course').annotate(
                    enrollment_count=Count('id')
                ).aggregate(avg_enrollment=Avg('enrollment_count'))['avg_enrollment'] or 0
            }
            return Response(stats, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def course_syllabus(request, course_id):
    """Get AI-generated syllabus for a course"""
    try:
        # Get the course
        course = Course.objects.select_related('subject').get(id=course_id)

        # Check if student is enrolled
        if request.user.user_type == 'student':
            from students.models import StudentProfile
            student_profile = StudentProfile.objects.get(user=request.user)
            enrollment = CourseEnrollment.objects.filter(
                student=student_profile,
                course=course,
                status='active'
            ).first()

            if not enrollment:
                return Response({
                    'error': 'You must be enrolled in this course to view the syllabus'
                }, status=status.HTTP_403_FORBIDDEN)

        # Get course modules if they exist
        modules = CourseModule.objects.filter(course=course).order_by('order')

        if modules.exists():
            # Use existing modules
            chapters = [f"{module.order}. {module.title}" for module in modules]
        else:
            # Generate AI-powered syllabus based on course title and subject
            try:
                from ai_services.gemini_service import gemini_service

                if gemini_service and gemini_service.available:
                    prompt = f"""Generate a comprehensive course syllabus for:
Course: {course.title}
Subject: {course.subject.name}
Difficulty: {course.difficulty_level}
Credits: {course.credits}

Provide exactly 8-12 chapter titles that cover the complete curriculum.
Format as a JSON array of strings, each string being a chapter title.
Example: ["Introduction to Python", "Variables and Data Types", ...]

Only return the JSON array, no other text."""

                    response = gemini_service.chat_response(prompt)
                    # Try to parse JSON from response
                    import json
                    import re

                    # Extract JSON array from response
                    json_match = re.search(r'\[(.*?)\]', response, re.DOTALL)
                    if json_match:
                        chapters_raw = json.loads('[' + json_match.group(1) + ']')
                        chapters = [f"{i + 1}. {chapter}" for i, chapter in enumerate(chapters_raw)]
                    else:
                        # Fallback
                        chapters = [
                            f"1. Introduction to {course.title}",
                            f"2. Fundamentals of {course.subject.name}",
                            f"3. Core Concepts and Theory",
                            f"4. Practical Applications",
                            f"5. Advanced Topics in {course.subject.name}",
                            f"6. Real-World Projects",
                            f"7. Best Practices and Industry Standards",
                            f"8. Course Review and Final Assessment"
                        ]
                else:
                    # Fallback chapters
                    chapters = [
                        f"1. Introduction to {course.title}",
                        f"2. Fundamentals of {course.subject.name}",
                        f"3. Core Concepts and Theory",
                        f"4. Practical Applications",
                        f"5. Advanced Topics in {course.subject.name}",
                        f"6. Real-World Projects",
                        f"7. Best Practices and Industry Standards",
                        f"8. Course Review and Final Assessment"
                    ]
            except Exception as e:
                print(f"Error generating AI syllabus: {e}")
                # Fallback chapters
                chapters = [
                    f"1. Introduction to {course.title}",
                    f"2. Fundamentals of {course.subject.name}",
                    f"3. Core Concepts and Theory",
                    f"4. Practical Applications",
                    f"5. Advanced Topics in {course.subject.name}",
                    f"6. Real-World Projects",
                    f"7. Best Practices and Industry Standards",
                    f"8. Course Review and Final Assessment"
                ]

        return Response({
            'course_id': course.id,
            'course_title': course.title,
            'subject': course.subject.name,
            'description': course.description or f"Comprehensive {course.difficulty_level} level course covering {course.subject.name}",
            'chapters': chapters,
            'ai_generated': not modules.exists()
        }, status=status.HTTP_200_OK)

    except Course.DoesNotExist:
        return Response({
            'error': 'Course not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
