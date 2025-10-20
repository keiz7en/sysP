#!/usr/bin/env python
import os
import sys
import django
from django.conf import settings

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'education_system.settings')
django.setup()

import requests
from django.contrib.auth import get_user_model
from students.models import StudentProfile
from teachers.models import TeacherProfile
from courses.models import Course, CourseEnrollment
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


def create_test_users():
    """Create test users if they don't exist"""
    print("👥 Creating test users...")

    # Create test student
    student_username = 'alice.johnson.student'
    student_user, created = User.objects.get_or_create(
        username=student_username,
        defaults={
            'email': 'alice.johnson@student.edu',
            'first_name': 'Alice',
            'last_name': 'Johnson',
            'user_type': 'student',
            'is_active': True,
            'approval_status': 'approved'
        }
    )

    if created:
        student_user.set_password('student123')
        student_user.save()
        print(f"✅ Created student user: {student_username}")
    else:
        print(f"ℹ️  Student user already exists: {student_username}")

    # Create student profile
    student_profile, created = StudentProfile.objects.get_or_create(
        user=student_user,
        defaults={
            'student_id': 'STU12345',
            'grade_level': 'Freshman',
            'learning_style': 'visual',
            'preferred_difficulty': 'intermediate',
            'current_gpa': 3.5,
            'academic_status': 'active'
        }
    )

    if created:
        print(f"✅ Created student profile for: {student_username}")
    else:
        print(f"ℹ️  Student profile already exists for: {student_username}")

    # Create test teacher
    teacher_username = 'john.smith.teacher'
    teacher_user, created = User.objects.get_or_create(
        username=teacher_username,
        defaults={
            'email': 'john.smith@teacher.edu',
            'first_name': 'John',
            'last_name': 'Smith',
            'user_type': 'teacher',
            'is_active': True,
            'approval_status': 'approved'
        }
    )

    if created:
        teacher_user.set_password('teacher123')
        teacher_user.save()
        print(f"✅ Created teacher user: {teacher_username}")
    else:
        print(f"ℹ️  Teacher user already exists: {teacher_username}")

    # Create teacher profile
    teacher_profile, created = TeacherProfile.objects.get_or_create(
        user=teacher_user,
        defaults={
            'employee_id': 'EMP001',
            'department': 'Computer Science',
            'specialization': ['Programming', 'Data Structures'],
            'experience_years': 5,
            'is_approved': True,
            'teaching_rating': 4.5
        }
    )

    if created:
        print(f"✅ Created teacher profile for: {teacher_username}")
    else:
        print(f"ℹ️  Teacher profile already exists for: {teacher_username}")

    return student_user, teacher_user, student_profile, teacher_profile


def create_test_courses(teacher_profile, student_profile):
    """Create test courses and enrollments"""
    print("📚 Creating test courses...")

    # Create test course
    course, created = Course.objects.get_or_create(
        title='Introduction to Computer Science',
        defaults={
            'code': 'CS101',
            'description': 'Basic programming and computer science concepts',
            'instructor': teacher_profile,
            'credits': 3,
            'start_date': timezone.now().date(),
            'end_date': timezone.now().date() + timedelta(days=120),
            'is_active': True
        }
    )

    if created:
        print(f"✅ Created course: {course.title}")
    else:
        print(f"ℹ️  Course already exists: {course.title}")

    # Create enrollment
    enrollment, created = CourseEnrollment.objects.get_or_create(
        student=student_profile,
        course=course,
        defaults={
            'enrollment_date': timezone.now().date(),
            'status': 'active',
            'progress_percentage': 45.0
        }
    )

    if created:
        print(f"✅ Created enrollment: {student_profile.user.username} -> {course.title}")
    else:
        print(f"ℹ️  Enrollment already exists: {student_profile.user.username} -> {course.title}")

    return course, enrollment


def test_api_endpoints():
    """Test all API endpoints"""
    print("\n🔧 Testing API endpoints...")

    # Test student login
    student_login_data = {
        'username': 'alice.johnson.student',
        'password': 'student123',
        'user_type': 'student'
    }

    print("🔐 Testing student login...")
    try:
        login_response = requests.post('http://localhost:8000/api/users/login/', json=student_login_data)
        if login_response.status_code == 200:
            login_result = login_response.json()
            student_token = login_result['token']
            print(f"✅ Student login successful: {login_result['user']['username']}")

            # Test student learning path
            print("🧠 Testing student learning path...")
            headers = {'Authorization': f'Token {student_token}'}
            learning_response = requests.get('http://localhost:8000/api/students/learning-path/', headers=headers)

            if learning_response.status_code == 200:
                data = learning_response.json()
                print("✅ Learning path endpoint working!")
                print(f"   📚 Learning paths: {len(data.get('learning_paths', []))}")
                print(f"   📊 Overall progress: {data.get('overall_progress', 0)}%")
                print(f"   🎯 Learning style: {data.get('learning_style', 'Not set')}")

                if data.get('ai_insights'):
                    insights = data['ai_insights']
                    print(f"   🚀 Learning velocity: {insights.get('learning_velocity', 'N/A')}")
                    print(f"   💡 Engagement score: {insights.get('engagement_score', 'N/A')}")

                return True
            else:
                print(f"❌ Learning path failed: {learning_response.status_code}")
                print(f"   Response: {learning_response.text}")
                return False
        else:
            print(f"❌ Student login failed: {login_response.status_code}")
            print(f"   Response: {login_response.text}")
            return False
    except Exception as e:
        print(f"❌ API test failed: {str(e)}")
        return False


def main():
    print("🚀 COMPLETE TEST AND FIX FOR STUDENT LEARNING")
    print("=" * 60)

    try:
        # Step 1: Create test users and data
        student_user, teacher_user, student_profile, teacher_profile = create_test_users()

        # Step 2: Create test courses
        course, enrollment = create_test_courses(teacher_profile, student_profile)

        # Step 3: Test API endpoints
        api_success = test_api_endpoints()

        print("\n" + "=" * 60)
        if api_success:
            print("✅ ALL TESTS PASSED! Student learning page should work now.")
            print("\n🎯 Frontend Access:")
            print("   📱 React App: http://localhost:3001")
            print("   🧠 Learning Page: http://localhost:3001/student/learning")
            print("\n🔑 Login Credentials:")
            print("   👤 Username: alice.johnson.student")
            print("   🔒 Password: student123")
            print("   📊 User Type: student")
            print("\n🛠️  Backend API:")
            print("   🌐 Django Server: http://localhost:8000")
            print("   📚 Learning Endpoint: http://localhost:8000/api/students/learning-path/")

            print("\n🎉 The student learning page should now display:")
            print("   • Sample learning paths")
            print("   • AI insights and recommendations")
            print("   • Progress tracking")
            print("   • Personalized learning data")

        else:
            print("❌ SOME TESTS FAILED!")
            print("\n🔧 Troubleshooting:")
            print("   • Check if Django server is running on port 8000")
            print("   • Verify database migrations are applied")
            print("   • Check for any import/model errors")

    except Exception as e:
        print(f"❌ Setup failed: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
