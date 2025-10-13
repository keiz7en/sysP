from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
import random
import string
from datetime import datetime, date

from .models import TeacherProfile
from students.models import StudentProfile
from courses.models import Course, CourseEnrollment
from users.models import User, UserProfile
from users.serializers import UserSerializer

User = get_user_model()


class TeacherDashboardView(APIView):
    """Teacher dashboard with overview statistics"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Verify user is a teacher
            if request.user.user_type != 'teacher':
                return Response(
                    {'error': 'Access denied. Teacher account required.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            if not hasattr(request.user, 'teacher_profile'):
                return Response(
                    {'error': 'Teacher profile not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )

            teacher_profile = request.user.teacher_profile

            # Get teacher's courses
            courses = Course.objects.filter(instructor=teacher_profile)

            # Calculate statistics
            total_courses = courses.count()
            total_students = CourseEnrollment.objects.filter(course__in=courses).count()
            active_students = CourseEnrollment.objects.filter(
                course__in=courses, status='active'
            ).count()

            # Get recent enrollments
            recent_enrollments = CourseEnrollment.objects.filter(
                course__in=courses
            ).select_related('student', 'course').order_by('-enrollment_date')[:10]

            dashboard_data = {
                'teacher_info': {
                    'name': f"{request.user.first_name} {request.user.last_name}",
                    'employee_id': teacher_profile.employee_id,
                    'department': teacher_profile.department,
                    'experience_years': teacher_profile.experience_years,
                    'teaching_rating': float(teacher_profile.teaching_rating)
                },
                'statistics': {
                    'total_courses': total_courses,
                    'total_students': total_students,
                    'active_students': active_students,
                    'completion_rate': float(teacher_profile.course_completion_rate)
                },
                'recent_enrollments': [
                    {
                        'student_name': f"{enrollment.student.user.first_name} {enrollment.student.user.last_name}",
                        'student_id': enrollment.student.student_id,
                        'course_title': enrollment.course.title,
                        'enrollment_date': enrollment.enrollment_date,
                        'progress': float(enrollment.progress_percentage)
                    }
                    for enrollment in recent_enrollments
                ]
            }

            return Response(dashboard_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StudentManagementView(APIView):
    """Teacher can add, view, and remove students"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all students enrolled in teacher's courses"""
        try:
            if request.user.user_type != 'teacher':
                return Response(
                    {'error': 'Access denied. Teacher account required.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            teacher_profile = request.user.teacher_profile
            courses = Course.objects.filter(instructor=teacher_profile)

            # Get all students enrolled in teacher's courses
            enrollments = CourseEnrollment.objects.filter(
                course__in=courses
            ).select_related('student', 'course', 'student__user')

            students_data = []
            for enrollment in enrollments:
                student = enrollment.student
                students_data.append({
                    'id': student.id,
                    'student_id': student.student_id,
                    'name': f"{student.user.first_name} {student.user.last_name}",
                    'email': student.user.email,
                    'phone': student.user.phone_number,
                    'grade_level': student.grade_level,
                    'current_gpa': float(student.current_gpa),
                    'academic_status': student.academic_status,
                    'enrollment_date': enrollment.enrollment_date,
                    'course_title': enrollment.course.title,
                    'progress': float(enrollment.progress_percentage),
                    'status': enrollment.status
                })

            return Response({
                'students': students_data,
                'total_count': len(students_data)
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        """Add a new student to a course"""
        try:
            if request.user.user_type != 'teacher':
                return Response(
                    {'error': 'Access denied. Teacher account required.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            data = request.data
            course_id = data.get('course_id')

            # Validate required fields
            required_fields = ['first_name', 'last_name', 'email', 'course_id']
            for field in required_fields:
                if not data.get(field):
                    return Response(
                        {'error': f'{field} is required'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            # Verify teacher owns the course
            teacher_profile = request.user.teacher_profile
            course = get_object_or_404(Course, id=course_id, instructor=teacher_profile)

            # Check if email already exists
            if User.objects.filter(email=data['email']).exists():
                return Response(
                    {'error': 'Email already registered'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            with transaction.atomic():
                # Generate unique username and student ID
                username = self.generate_username(data['first_name'], data['last_name'])
                student_id = self.generate_student_id()

                # Generate temporary password
                temp_password = self.generate_temp_password()

                # Create user account
                user = User.objects.create_user(
                    username=username,
                    email=data['email'],
                    password=temp_password,
                    first_name=data['first_name'],
                    last_name=data['last_name'],
                    user_type='student',
                    phone_number=data.get('phone_number', ''),
                    address=data.get('address', '')
                )

                # Create user profile
                UserProfile.objects.create(
                    user=user,
                    bio=data.get('bio', ''),
                    preferred_language='en'
                )

                # Create student profile
                student_profile = StudentProfile.objects.create(
                    user=user,
                    student_id=student_id,
                    grade_level=data.get('grade_level', ''),
                    guardian_name=data.get('guardian_name', ''),
                    guardian_phone=data.get('guardian_phone', ''),
                    guardian_email=data.get('guardian_email', ''),
                    emergency_contact=data.get('emergency_contact', ''),
                    emergency_phone=data.get('emergency_phone', ''),
                    learning_style=data.get('learning_style', 'adaptive')
                )

                # Enroll student in the course
                enrollment = CourseEnrollment.objects.create(
                    student=student_profile,
                    course=course,
                    status='active'
                )

                return Response({
                    'message': 'Student added successfully',
                    'student': {
                        'id': student_profile.id,
                        'student_id': student_id,
                        'name': f"{user.first_name} {user.last_name}",
                        'username': username,
                        'email': user.email,
                        'temporary_password': temp_password,
                        'course_title': course.title
                    }
                }, status=status.HTTP_201_CREATED)

        except Course.DoesNotExist:
            return Response(
                {'error': 'Course not found or access denied'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, student_id):
        """Remove a student from teacher's course"""
        try:
            if request.user.user_type != 'teacher':
                return Response(
                    {'error': 'Access denied. Teacher account required.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            teacher_profile = request.user.teacher_profile
            courses = Course.objects.filter(instructor=teacher_profile)

            # Find the enrollment
            enrollment = get_object_or_404(
                CourseEnrollment,
                student__student_id=student_id,
                course__in=courses
            )

            # Remove the enrollment (soft delete by changing status)
            enrollment.status = 'dropped'
            enrollment.save()

            return Response({
                'message': 'Student removed from course successfully'
            }, status=status.HTTP_200_OK)

        except CourseEnrollment.DoesNotExist:
            return Response(
                {'error': 'Student not found in your courses'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def generate_username(self, first_name, last_name):
        """Generate unique username"""
        base_username = f"{first_name.lower()}.{last_name.lower()}"
        username = base_username
        counter = 1

        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        return username

    def generate_student_id(self):
        """Generate unique 4-7 digit student ID"""
        while True:
            # Generate random ID between 4-7 digits
            length = random.randint(4, 7)
            student_id = ''.join(random.choices(string.digits, k=length))

            # Ensure it doesn't start with 0
            if student_id[0] != '0' and not StudentProfile.objects.filter(student_id=student_id).exists():
                return student_id

    def generate_temp_password(self):
        """Generate temporary password for new students"""
        # Generate 8-character password with letters and numbers
        return ''.join(random.choices(string.ascii_letters + string.digits, k=8))


class TeacherCoursesView(APIView):
    """Manage teacher's courses"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all courses taught by the teacher"""
        try:
            if request.user.user_type != 'teacher':
                return Response(
                    {'error': 'Access denied. Teacher account required.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            teacher_profile = request.user.teacher_profile
            courses = Course.objects.filter(instructor=teacher_profile)

            courses_data = []
            for course in courses:
                enrolled_count = CourseEnrollment.objects.filter(
                    course=course, status='active'
                ).count()

                courses_data.append({
                    'id': course.id,
                    'title': course.title,
                    'code': course.code,
                    'description': course.description,
                    'credits': course.credits,
                    'difficulty_level': course.difficulty_level,
                    'start_date': course.start_date,
                    'end_date': course.end_date,
                    'enrolled_students': enrolled_count,
                    'enrollment_limit': course.enrollment_limit,
                    'is_active': course.is_active
                })

            return Response({
                'courses': courses_data,
                'total_count': len(courses_data)
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BulkStudentUploadView(APIView):
    """Upload multiple students via CSV or JSON"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Bulk add students from CSV/JSON data"""
        try:
            if request.user.user_type != 'teacher':
                return Response(
                    {'error': 'Access denied. Teacher account required.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            data = request.data
            course_id = data.get('course_id')
            students_data = data.get('students', [])

            if not course_id or not students_data:
                return Response(
                    {'error': 'course_id and students data are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Verify teacher owns the course
            teacher_profile = request.user.teacher_profile
            course = get_object_or_404(Course, id=course_id, instructor=teacher_profile)

            successful_additions = []
            failed_additions = []

            for student_data in students_data:
                try:
                    with transaction.atomic():
                        # Validate required fields
                        if not all([student_data.get('first_name'), student_data.get('last_name'),
                                    student_data.get('email')]):
                            failed_additions.append({
                                'data': student_data,
                                'error': 'Missing required fields: first_name, last_name, email'
                            })
                            continue

                        # Check if email already exists
                        if User.objects.filter(email=student_data['email']).exists():
                            failed_additions.append({
                                'data': student_data,
                                'error': 'Email already registered'
                            })
                            continue

                        # Generate unique username and student ID
                        username = self.generate_username(student_data['first_name'], student_data['last_name'])
                        student_id = self.generate_student_id()
                        temp_password = self.generate_temp_password()

                        # Create user account
                        user = User.objects.create_user(
                            username=username,
                            email=student_data['email'],
                            password=temp_password,
                            first_name=student_data['first_name'],
                            last_name=student_data['last_name'],
                            user_type='student',
                            phone_number=student_data.get('phone_number', ''),
                            address=student_data.get('address', '')
                        )

                        # Create user profile
                        UserProfile.objects.create(user=user)

                        # Create student profile
                        student_profile = StudentProfile.objects.create(
                            user=user,
                            student_id=student_id,
                            grade_level=student_data.get('grade_level', ''),
                            guardian_name=student_data.get('guardian_name', ''),
                            guardian_phone=student_data.get('guardian_phone', ''),
                            guardian_email=student_data.get('guardian_email', ''),
                            learning_style=student_data.get('learning_style', 'adaptive')
                        )

                        # Enroll in course
                        CourseEnrollment.objects.create(
                            student=student_profile,
                            course=course,
                            status='active'
                        )

                        successful_additions.append({
                            'student_id': student_id,
                            'name': f"{user.first_name} {user.last_name}",
                            'username': username,
                            'email': user.email,
                            'temporary_password': temp_password
                        })

                except Exception as e:
                    failed_additions.append({
                        'data': student_data,
                        'error': str(e)
                    })

            return Response({
                'message': f'Bulk upload completed. {len(successful_additions)} students added successfully.',
                'successful_additions': successful_additions,
                'failed_additions': failed_additions,
                'course_title': course.title
            }, status=status.HTTP_200_OK)

        except Course.DoesNotExist:
            return Response(
                {'error': 'Course not found or access denied'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def generate_username(self, first_name, last_name):
        """Generate unique username"""
        base_username = f"{first_name.lower()}.{last_name.lower()}"
        username = base_username
        counter = 1

        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        return username

    def generate_student_id(self):
        """Generate unique 4-7 digit student ID"""
        while True:
            length = random.randint(4, 7)
            student_id = ''.join(random.choices(string.digits, k=length))

            if student_id[0] != '0' and not StudentProfile.objects.filter(student_id=student_id).exists():
                return student_id

    def generate_temp_password(self):
        """Generate temporary password"""
        return ''.join(random.choices(string.ascii_letters + string.digits, k=8))
