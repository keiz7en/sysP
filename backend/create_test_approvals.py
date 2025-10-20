#!/usr/bin/env python
import os
import sys
import django
from django.conf import settings

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'education_system.settings')
django.setup()

from django.contrib.auth import get_user_model
from users.models import UserProfile, TeacherApproval
from teachers.models import TeacherProfile
from django.db import transaction
import random

User = get_user_model()


def generate_employee_id():
    """Generate an employee ID for teachers"""
    return 'EMP' + ''.join(random.choices('0123456789', k=4))


def create_pending_teachers():
    """Create test teachers that need approval"""
    teachers_data = [
        {
            'username': 'john.smith.teacher',
            'email': 'john.smith.teacher@test.com',
            'first_name': 'John',
            'last_name': 'Smith',
            'department': 'Computer Science',
            'experience_years': 5,
            'qualifications': ['PhD in Computer Science', 'Machine Learning Certification'],
            'specialization': ['AI', 'Machine Learning', 'Python Programming'],
            'reason_for_joining': 'I want to share my knowledge in AI and help students develop practical programming skills.'
        },
        {
            'username': 'sarah.johnson.teacher',
            'email': 'sarah.johnson.teacher@test.com',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'department': 'Mathematics',
            'experience_years': 8,
            'qualifications': ['Masters in Mathematics', 'Teaching Certificate'],
            'specialization': ['Calculus', 'Statistics', 'Linear Algebra'],
            'reason_for_joining': 'I am passionate about making mathematics accessible and engaging for all students.'
        },
        {
            'username': 'mike.wilson.teacher',
            'email': 'mike.wilson.teacher@test.com',
            'first_name': 'Mike',
            'last_name': 'Wilson',
            'department': 'Physics',
            'experience_years': 3,
            'qualifications': ['PhD in Physics', 'Research Experience'],
            'specialization': ['Quantum Physics', 'Thermodynamics'],
            'reason_for_joining': 'I want to inspire the next generation of physicists and researchers.'
        }
    ]

    created_teachers = []

    for teacher_data in teachers_data:
        try:
            with transaction.atomic():
                # Check if user already exists
                if User.objects.filter(username=teacher_data['username']).exists():
                    print(f"Teacher {teacher_data['username']} already exists, skipping...")
                    continue

                # Create user
                user = User.objects.create_user(
                    username=teacher_data['username'],
                    email=teacher_data['email'],
                    password='teacher123',  # Simple password for testing
                    first_name=teacher_data['first_name'],
                    last_name=teacher_data['last_name'],
                    user_type='teacher',
                    approval_status='pending'
                )

                # Create user profile (check if it doesn't exist)
                profile, created = UserProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        'bio': f"Experienced educator in {teacher_data['department']}"
                    }
                )

                # Create teacher approval request
                TeacherApproval.objects.create(
                    teacher=user,
                    qualifications=teacher_data['qualifications'],
                    department_preference=teacher_data['department'],
                    specialization=teacher_data['specialization'],
                    reason_for_joining=teacher_data['reason_for_joining']
                )

                # Create teacher profile with employee ID
                TeacherProfile.objects.create(
                    user=user,
                    employee_id=generate_employee_id(),
                    experience_years=teacher_data['experience_years'],
                    department=teacher_data['department'],
                    specialization=teacher_data['specialization']
                )

                created_teachers.append(user)
                print(f"✅ Created pending teacher: {user.get_full_name()} ({user.username})")

        except Exception as e:
            print(f"❌ Error creating teacher {teacher_data['username']}: {str(e)}")

    return created_teachers


def create_pending_students():
    """Create test students that need approval"""
    students_data = [
        {
            'username': 'alice.brown.student',
            'email': 'alice.brown.student@test.com',
            'first_name': 'Alice',
            'last_name': 'Brown',
            'grade_level': 'Freshman'
        },
        {
            'username': 'bob.davis.student',
            'email': 'bob.davis.student@test.com',
            'first_name': 'Bob',
            'last_name': 'Davis',
            'grade_level': 'Sophomore'
        },
        {
            'username': 'carol.taylor.student',
            'email': 'carol.taylor.student@test.com',
            'first_name': 'Carol',
            'last_name': 'Taylor',
            'grade_level': 'Junior'
        },
        {
            'username': 'david.martinez.student',
            'email': 'david.martinez.student@test.com',
            'first_name': 'David',
            'last_name': 'Martinez',
            'grade_level': 'Senior'
        }
    ]

    created_students = []

    for student_data in students_data:
        try:
            with transaction.atomic():
                # Check if user already exists
                if User.objects.filter(username=student_data['username']).exists():
                    print(f"Student {student_data['username']} already exists, skipping...")
                    continue

                # Create user
                user = User.objects.create_user(
                    username=student_data['username'],
                    email=student_data['email'],
                    password='student123',  # Simple password for testing
                    first_name=student_data['first_name'],
                    last_name=student_data['last_name'],
                    user_type='student',
                    approval_status='pending'
                )

                # Create user profile (check if it doesn't exist)
                profile, created = UserProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        'bio': f"{student_data['grade_level']} student"
                    }
                )

                created_students.append(user)
                print(f"✅ Created pending student: {user.get_full_name()} ({user.username})")

        except Exception as e:
            print(f"❌ Error creating student {student_data['username']}: {str(e)}")

    return created_students


def main():
    print("🚀 Creating test users for approval testing...")
    print("=" * 50)

    # Create pending teachers
    print("\n📚 Creating pending teachers...")
    teachers = create_pending_teachers()

    # Create pending students  
    print("\n🎓 Creating pending students...")
    students = create_pending_students()

    print("\n" + "=" * 50)
    print("✅ Test user creation completed!")
    print(f"📊 Summary:")
    print(f"   - Teachers pending approval: {len(teachers)}")
    print(f"   - Students pending approval: {len(students)}")
    print(f"\n🔑 Login credentials:")
    print(f"   - Teachers: username/teacher123")
    print(f"   - Students: username/student123")
    print(f"   - Admin: admin/admin123")
    print(f"\n💡 Now you can test the approval functionality in the admin panel!")


if __name__ == '__main__':
    main()
