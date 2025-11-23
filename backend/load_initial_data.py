#!/usr/bin/env python
"""
Script to populate database with initial sample data
Run this after deployment: python manage.py shell < load_initial_data.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'education_system.settings')
django.setup()

from django.contrib.auth import get_user_model
from students.models import StudentProfile
from teachers.models import TeacherProfile
from courses.models import Subject, Course, CourseEnrollment, Assignment, AssignmentSubmission
from assessments.models import Assessment, Question, StudentAssessmentAttempt
from datetime import datetime, timedelta
from django.utils import timezone

User = get_user_model()

print("🚀 Starting database population...")

# Create Users
print("\n1️⃣ Creating users...")

# Admin user
if not User.objects.filter(username='admin').exists():
    admin = User.objects.create_superuser(
        username='admin',
        email='admin@eduai.com',
        password='admin123',
        first_name='Admin',
        last_name='User',
        user_type='admin'
    )
    print("✅ Created admin user: admin/admin123")
else:
    admin = User.objects.get(username='admin')
    print("⏭️  Admin user already exists")

# Teachers
teachers_data = [
    {'username': 'teacher1', 'email': 'teacher1@eduai.com', 'first_name': 'John', 'last_name': 'Smith',
     'subject': 'Computer Science'},
    {'username': 'teacher2', 'email': 'teacher2@eduai.com', 'first_name': 'Sarah', 'last_name': 'Johnson',
     'subject': 'Mathematics'},
    {'username': 'teacher3', 'email': 'teacher3@eduai.com', 'first_name': 'Michael', 'last_name': 'Brown',
     'subject': 'Physics'},
]

teachers = []
for data in teachers_data:
    if not User.objects.filter(username=data['username']).exists():
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password='teacher123',
            first_name=data['first_name'],
            last_name=data['last_name'],
            user_type='teacher',
            is_active=True
        )
        teacher_profile = TeacherProfile.objects.create(
            user=user,
            employee_id=f"T{1000 + len(teachers)}",
            department=data['subject'],
            subject_specialization=data['subject'],
            years_of_experience=5,
            contact_number='+1234567890',
            office_location='Room 101'
        )
        teachers.append(teacher_profile)
        print(f"✅ Created teacher: {data['username']}/teacher123")
    else:
        user = User.objects.get(username=data['username'])
        teacher_profile, _ = TeacherProfile.objects.get_or_create(user=user)
        teachers.append(teacher_profile)
        print(f"⏭️  Teacher {data['username']} already exists")

# Students
students_data = [
    {'username': 'student1', 'email': 'student1@eduai.com', 'first_name': 'Alice', 'last_name': 'Williams'},
    {'username': 'student2', 'email': 'student2@eduai.com', 'first_name': 'Bob', 'last_name': 'Davis'},
    {'username': 'student3', 'email': 'student3@eduai.com', 'first_name': 'Charlie', 'last_name': 'Miller'},
    {'username': 'student4', 'email': 'student4@eduai.com', 'first_name': 'Diana', 'last_name': 'Wilson'},
    {'username': 'student5', 'email': 'student5@eduai.com', 'first_name': 'Eve', 'last_name': 'Moore'},
]

students = []
for i, data in enumerate(students_data):
    if not User.objects.filter(username=data['username']).exists():
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password='student123',
            first_name=data['first_name'],
            last_name=data['last_name'],
            user_type='student',
            is_active=True
        )
        student_profile = StudentProfile.objects.create(
            user=user,
            student_id=f"S{2024000 + i}",
            enrollment_date=timezone.now() - timedelta(days=90),
            current_semester=1,
            gpa=3.0 + (i * 0.2),
            major='Computer Science',
            year_of_study=1,
            contact_number='+1234567890',
            parent_contact='+1234567891'
        )
        students.append(student_profile)
        print(f"✅ Created student: {data['username']}/student123")
    else:
        user = User.objects.get(username=data['username'])
        student_profile, _ = StudentProfile.objects.get_or_create(user=user)
        students.append(student_profile)
        print(f"⏭️  Student {data['username']} already exists")

# Create Subjects
print("\n2️⃣ Creating subjects...")
subjects_data = [
    {'code': 'CS101', 'name': 'Introduction to Programming', 'category': 'computer_science'},
    {'code': 'CS102', 'name': 'Data Structures and Algorithms', 'category': 'computer_science'},
    {'code': 'MATH101', 'name': 'Calculus I', 'category': 'mathematics'},
    {'code': 'PHY101', 'name': 'Physics I', 'category': 'science'},
]

subjects = []
for data in subjects_data:
    subject, created = Subject.objects.get_or_create(
        code=data['code'],
        defaults={'name': data['name'], 'category': data['category']}
    )
    subjects.append(subject)
    print(f"{'✅ Created' if created else '⏭️  Exists'} subject: {data['code']} - {data['name']}")

# Create Courses
print("\n3️⃣ Creating courses...")
courses_data = [
    {
        'subject': subjects[0],
        'teacher': teachers[0],
        'title': 'Introduction to Python Programming',
        'description': 'Learn Python from scratch with hands-on projects',
        'credits': 3,
        'max_students': 30
    },
    {
        'subject': subjects[1],
        'teacher': teachers[0],
        'title': 'Advanced Data Structures',
        'description': 'Master algorithms and data structures',
        'credits': 4,
        'max_students': 25
    },
    {
        'subject': subjects[2],
        'teacher': teachers[1],
        'title': 'Calculus Fundamentals',
        'description': 'Introduction to differential and integral calculus',
        'credits': 4,
        'max_students': 35
    },
]

courses = []
for data in courses_data:
    course, created = Course.objects.get_or_create(
        subject=data['subject'],
        teacher=data['teacher'],
        title=data['title'],
        defaults={
            'course_code': f"{data['subject'].code}-{timezone.now().year}",
            'description': data['description'],
            'credits': data['credits'],
            'max_students': data['max_students'],
            'semester': 'Fall',
            'academic_year': 2024,
            'is_active': True,
            'status': 'approved',
            'ai_features_enabled': True
        }
    )
    courses.append(course)
    print(f"{'✅ Created' if created else '⏭️  Exists'} course: {data['title']}")

# Enroll Students
print("\n4️⃣ Enrolling students in courses...")
enrollment_count = 0
for student in students[:3]:  # Enroll first 3 students
    for course in courses[:2]:  # In first 2 courses
        enrollment, created = CourseEnrollment.objects.get_or_create(
            student=student,
            course=course,
            defaults={
                'enrollment_date': timezone.now() - timedelta(days=30),
                'status': 'active',
                'ai_access_granted': True
            }
        )
        if created:
            enrollment_count += 1
print(f"✅ Created {enrollment_count} enrollments")

# Create Assignments
print("\n5️⃣ Creating assignments...")
assignments_data = [
    {
        'course': courses[0],
        'title': 'Python Basics - Variables and Data Types',
        'description': 'Complete exercises on Python basics',
        'assignment_type': 'homework',
        'total_points': 100,
        'due_days': 7
    },
    {
        'course': courses[0],
        'title': 'Python Project - Build a Calculator',
        'description': 'Create a functional calculator program',
        'assignment_type': 'project',
        'total_points': 200,
        'due_days': 14
    },
    {
        'course': courses[1],
        'title': 'Implement Binary Search Tree',
        'description': 'Code a BST with insert, delete, and search operations',
        'assignment_type': 'lab',
        'total_points': 150,
        'due_days': 10
    },
]

assignments = []
for data in assignments_data:
    assignment, created = Assignment.objects.get_or_create(
        course=data['course'],
        title=data['title'],
        defaults={
            'description': data['description'],
            'assignment_type': data['assignment_type'],
            'total_points': data['total_points'],
            'due_date': timezone.now() + timedelta(days=data['due_days']),
            'is_published': True
        }
    )
    assignments.append(assignment)
    print(f"{'✅ Created' if created else '⏭️  Exists'} assignment: {data['title']}")

# Create Assignment Submissions
print("\n6️⃣ Creating assignment submissions...")
submission_count = 0
for enrollment in CourseEnrollment.objects.filter(status='active')[:5]:
    for assignment in Assignment.objects.filter(course=enrollment.course):
        submission, created = AssignmentSubmission.objects.get_or_create(
            assignment=assignment,
            student=enrollment.student,
            defaults={
                'submission_text': f'Sample submission by {enrollment.student.user.get_full_name()}',
                'submitted_at': timezone.now() - timedelta(days=2),
                'status': 'submitted',
                'points_earned': assignment.total_points * 0.85,
                'is_late': False
            }
        )
        if created:
            submission_count += 1
print(f"✅ Created {submission_count} submissions")

# Create Assessments (Exams/Quizzes)
print("\n7️⃣ Creating assessments...")
assessments_data = [
    {
        'course': courses[0],
        'title': 'Python Midterm Exam',
        'assessment_type': 'midterm',
        'total_marks': 100,
        'duration': 120
    },
    {
        'course': courses[0],
        'title': 'Python Syntax Quiz',
        'assessment_type': 'quiz',
        'total_marks': 50,
        'duration': 30
    },
]

assessments = []
for data in assessments_data:
    assessment, created = Assessment.objects.get_or_create(
        course=data['course'],
        title=data['title'],
        defaults={
            'assessment_type': data['assessment_type'],
            'total_marks': data['total_marks'],
            'duration_minutes': data['duration'],
            'start_datetime': timezone.now() + timedelta(days=7),
            'end_datetime': timezone.now() + timedelta(days=14),
            'is_published': True
        }
    )
    assessments.append(assessment)
    print(f"{'✅ Created' if created else '⏭️  Exists'} assessment: {data['title']}")

# Create Questions
print("\n8️⃣ Creating questions...")
if assessments:
    questions_data = [
        {
            'text': 'What is a variable in Python?',
            'question_type': 'multiple_choice',
            'marks': 10,
            'options': ['A storage location', 'A function', 'A loop', 'A class'],
            'correct_answer': 'A storage location'
        },
        {
            'text': 'Explain the difference between lists and tuples in Python.',
            'question_type': 'essay',
            'marks': 20,
            'options': None,
            'correct_answer': 'Lists are mutable, tuples are immutable'
        },
    ]

    question_count = 0
    for assessment in assessments[:1]:  # Add to first assessment
        for i, data in enumerate(questions_data):
            question, created = Question.objects.get_or_create(
                assessment=assessment,
                question_number=i + 1,
                defaults={
                    'question_text': data['text'],
                    'question_type': data['question_type'],
                    'marks': data['marks'],
                    'options': data['options'],
                    'correct_answer': data['correct_answer']
                }
            )
            if created:
                question_count += 1
    print(f"✅ Created {question_count} questions")

print("\n" + "=" * 50)
print("✅ DATABASE POPULATION COMPLETE!")
print("=" * 50)
print("\n📊 Summary:")
print(f"   👥 Users: {User.objects.count()}")
print(f"   👨‍🏫 Teachers: {TeacherProfile.objects.count()}")
print(f"   👨‍🎓 Students: {StudentProfile.objects.count()}")
print(f"   📚 Subjects: {Subject.objects.count()}")
print(f"   📖 Courses: {Course.objects.count()}")
print(f"   📝 Enrollments: {CourseEnrollment.objects.count()}")
print(f"   📄 Assignments: {Assignment.objects.count()}")
print(f"   ✍️  Submissions: {AssignmentSubmission.objects.count()}")
print(f"   📝 Assessments: {Assessment.objects.count()}")
print(f"   ❓ Questions: {Question.objects.count()}")

print("\n🔐 Login Credentials:")
print("   Admin:    admin/admin123")
print("   Teacher:  teacher1/teacher123")
print("   Student:  student1/student123")

print("\n🎉 You can now use the system with sample data!")
