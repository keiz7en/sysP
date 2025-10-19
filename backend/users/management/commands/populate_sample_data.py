from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime, timedelta, date
import random

from users.models import User, UserProfile
from students.models import StudentProfile, LearningProgress, StudentBehaviorMetrics
from teachers.models import TeacherProfile
from courses.models import Course, CourseEnrollment
from assessments.models import Assessment, StudentAssessmentAttempt
from analytics.models import LearningAnalytics, InstitutionalAnalytics
from career.models import JobMarketData
from chatbot.models import ChatSession, ChatMessage

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate database with realistic sample data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting data population...'))

        # Set admin user type
        try:
            admin_user = User.objects.get(username='admin')
            admin_user.user_type = 'admin'
            admin_user.first_name = 'System'
            admin_user.last_name = 'Administrator'
            admin_user.approval_status = 'approved'
            admin_user.save()
            UserProfile.objects.get_or_create(user=admin_user)
            self.stdout.write(self.style.SUCCESS('Admin user configured'))
        except User.DoesNotExist:
            self.stdout.write(self.style.WARNING('Admin user not found'))
            return

        # Create sample teachers
        teachers_data = [
            {
                'username': 'dr.johnson', 'email': 'johnson@eduai.com', 'password': 'teacher123',
                'first_name': 'Dr. Michael', 'last_name': 'Johnson',
                'department': 'Computer Science', 'specialization': ['Algorithms', 'Data Structures'],
                'experience_years': 8
            },
            {
                'username': 'prof.smith', 'email': 'smith@eduai.com', 'password': 'teacher123',
                'first_name': 'Prof. Sarah', 'last_name': 'Smith',
                'department': 'Mathematics', 'specialization': ['Calculus', 'Statistics'],
                'experience_years': 12
            }
        ]

        created_teachers = []
        for teacher_data in teachers_data:
            if not User.objects.filter(email=teacher_data['email']).exists():
                teacher = User.objects.create_user(
                    username=teacher_data['username'],
                    email=teacher_data['email'],
                    password=teacher_data['password'],
                    first_name=teacher_data['first_name'],
                    last_name=teacher_data['last_name'],
                    user_type='teacher',
                    approval_status='approved',
                    approved_by=admin_user,
                    approved_at=timezone.now()
                )

                UserProfile.objects.get_or_create(user=teacher)

                teacher_profile = TeacherProfile.objects.create(
                    user=teacher,
                    employee_id=f"EMP{random.randint(1000, 9999)}",
                    department=teacher_data['department'],
                    specialization=teacher_data['specialization'],
                    experience_years=teacher_data['experience_years'],
                    is_approved=True,
                    approved_by=admin_user,
                    approved_at=timezone.now(),
                    teaching_rating=random.uniform(4.0, 5.0)
                )

                created_teachers.append(teacher_profile)
                self.stdout.write(f'Created teacher: {teacher.get_full_name()}')

        # Create sample students (approved for demo purposes)
        students_data = [
            {
                'username': 'alice.cooper', 'email': 'alice@student.eduai.com', 'password': 'student123',
                'first_name': 'Alice', 'last_name': 'Cooper',
                'grade_level': 'Sophomore', 'gpa': 3.8
            },
            {
                'username': 'bob.wilson', 'email': 'bob@student.eduai.com', 'password': 'student123',
                'first_name': 'Bob', 'last_name': 'Wilson',
                'grade_level': 'Junior', 'gpa': 3.2
            },
            {
                'username': 'carol.davis', 'email': 'carol@student.eduai.com', 'password': 'student123',
                'first_name': 'Carol', 'last_name': 'Davis',
                'grade_level': 'Senior', 'gpa': 3.9
            }
        ]

        created_students = []
        for student_data in students_data:
            if not User.objects.filter(email=student_data['email']).exists():
                student = User.objects.create_user(
                    username=student_data['username'],
                    email=student_data['email'],
                    password=student_data['password'],
                    first_name=student_data['first_name'],
                    last_name=student_data['last_name'],
                    user_type='student',
                    approval_status='approved',  # For demo purposes
                    approved_by=admin_user,
                    approved_at=timezone.now()
                )

                UserProfile.objects.get_or_create(user=student)

                student_profile = StudentProfile.objects.create(
                    user=student,
                    student_id=f"{random.randint(100000, 999999)}",
                    grade_level=student_data['grade_level'],
                    current_gpa=student_data['gpa'],
                    academic_status='active',
                    total_credits=random.randint(30, 120)
                )

                created_students.append(student_profile)
                self.stdout.write(f'Created student: {student.get_full_name()}')

        # Create courses
        courses_data = [
            {'title': 'Introduction to Programming', 'code': 'CS101', 'credits': 3},
            {'title': 'Data Structures', 'code': 'CS201', 'credits': 4},
            {'title': 'Calculus I', 'code': 'MATH101', 'credits': 4}
        ]

        created_courses = []
        for i, course_data in enumerate(courses_data):
            if not Course.objects.filter(code=course_data['code']).exists():
                instructor = created_teachers[i % len(created_teachers)] if created_teachers else None

                if instructor:
                    course = Course.objects.create(
                        title=course_data['title'],
                        code=course_data['code'],
                        description=f"Learn {course_data['title']}",
                        instructor=instructor,
                        credits=course_data['credits'],
                        is_active=True,
                        enrollment_limit=30,
                        start_date=date.today() - timedelta(days=30),
                        end_date=date.today() + timedelta(days=90)
                    )
                    created_courses.append(course)
                    self.stdout.write(f'Created course: {course.title}')

        # Create enrollments
        for student in created_students:
            for course in created_courses[:2]:  # Each student in 2 courses
                CourseEnrollment.objects.get_or_create(
                    student=student,
                    course=course,
                    defaults={
                        'progress_percentage': random.uniform(60, 95),
                        'status': 'active'
                    }
                )

        # Create assessments
        for course in created_courses:
            assessment = Assessment.objects.create(
                course=course,
                title=f"{course.code} - Midterm Exam",
                description=f"Midterm examination for {course.title}",
                type='test',
                total_marks=100,
                available_from=timezone.now() - timedelta(days=10),
                available_until=timezone.now() + timedelta(days=10)
            )

            # Create attempts
            for enrollment in CourseEnrollment.objects.filter(course=course):
                if random.random() < 0.8:  # 80% attempt rate
                    StudentAssessmentAttempt.objects.create(
                        student=enrollment.student,
                        assessment=assessment,
                        attempt_number=1,
                        started_at=timezone.now() - timedelta(days=5),
                        submitted_at=timezone.now() - timedelta(days=4),
                        total_score=random.uniform(70, 95),
                        percentage=random.uniform(70, 95),
                        status='graded'
                    )

        # Create analytics
        for student in created_students:
            for i in range(30):
                LearningAnalytics.objects.create(
                    student=student,
                    date=date.today() - timedelta(days=i),
                    time_spent=timedelta(hours=random.randint(2, 6)),
                    average_quiz_score=random.uniform(75, 95),
                    engagement_level=random.choice(['medium', 'high'])
                )

        # Create institutional analytics
        InstitutionalAnalytics.objects.get_or_create(
            institution_name='EduAI University',
            analysis_date=date.today(),
            defaults={
                'total_students': len(created_students),
                'active_students': len(created_students),
                'average_gpa': 3.6,
                'pass_rate': 88.7,
                'completion_rate': 82.3
            }
        )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created:\n'
                f'- {len(created_teachers)} teachers\n'
                f'- {len(created_students)} students\n'
                f'- {len(created_courses)} courses\n'
                f'- Real data populated!'
            )
        )
