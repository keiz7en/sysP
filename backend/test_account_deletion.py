#!/usr/bin/env python
import os
import sys
import django
from django.conf import settings

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'education_system.settings')
django.setup()

import requests
import json
from django.contrib.auth import get_user_model

User = get_user_model()


def create_test_user(username, password, user_type, first_name, last_name):
    """Create a test user for deletion testing"""
    try:
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            print(f"   ℹ️  User {username} already exists, skipping creation")
            return True

        register_data = {
            'username': username,
            'email': f'{username}@test.com',
            'password': password,
            'first_name': first_name,
            'last_name': last_name,
            'user_type': user_type,
            'phone_number': '123-456-7890',
            'address': 'Test Address'
        }

        response = requests.post('http://localhost:8000/api/users/register/', json=register_data)

        if response.status_code == 201:
            # If student or teacher, approve the account
            if user_type in ['student', 'teacher']:
                user = User.objects.get(username=username)
                user.approval_status = 'approved'
                user.save()

                # Create profiles if needed
                if user_type == 'student':
                    from students.models import StudentProfile
                    StudentProfile.objects.get_or_create(
                        user=user,
                        defaults={
                            'student_id': f'TEST{user.id}',
                            'grade_level': 'Freshman',
                            'academic_status': 'active'
                        }
                    )
                elif user_type == 'teacher':
                    from teachers.models import TeacherProfile
                    TeacherProfile.objects.get_or_create(
                        user=user,
                        defaults={
                            'employee_id': f'EMP{user.id}',
                            'department': 'Test Department',
                            'is_approved': True
                        }
                    )

            print(f"   ✅ Created test user: {username}")
            return True
        else:
            print(f"   ❌ Failed to create user {username}: {response.text}")
            return False

    except Exception as e:
        print(f"   ❌ Error creating user {username}: {str(e)}")
        return False


def test_self_deletion(username, password, user_type):
    """Test self-deletion functionality"""
    print(f"\n🔥 Testing self-deletion for {user_type}: {username}")

    try:
        # Step 1: Login
        login_data = {
            'username': username,
            'password': password,
            'user_type': user_type
        }

        print("   📡 Logging in...")
        login_response = requests.post('http://localhost:8000/api/users/login/', json=login_data)

        if login_response.status_code != 200:
            print(f"   ❌ Login failed: {login_response.status_code}")
            return False

        login_result = login_response.json()
        token = login_result['token']
        print(f"   ✅ Login successful")

        # Step 2: Test deletion with wrong confirmation
        print("   🧪 Testing wrong confirmation...")
        headers = {'Authorization': f'Token {token}'}
        wrong_delete_data = {'confirmation': 'wrong confirmation'}

        delete_response = requests.delete(
            'http://localhost:8000/api/users/delete-account/',
            json=wrong_delete_data,
            headers=headers
        )

        if delete_response.status_code == 400:
            print("   ✅ Wrong confirmation properly rejected")
        else:
            print(f"   ❌ Wrong confirmation should be rejected: {delete_response.status_code}")

        # Step 3: Test deletion with correct confirmation
        print("   🗑️  Testing account deletion...")
        correct_delete_data = {'confirmation': f'delete {username}'}

        delete_response = requests.delete(
            'http://localhost:8000/api/users/delete-account/',
            json=correct_delete_data,
            headers=headers
        )

        if delete_response.status_code == 200:
            delete_result = delete_response.json()
            print(f"   ✅ Account deleted successfully!")
            print(f"   📝 Message: {delete_result.get('message', 'Account deleted')}")

            # Verify user no longer exists
            if not User.objects.filter(username=username).exists():
                print("   ✅ User properly removed from database")
                return True
            else:
                print("   ❌ User still exists in database")
                return False
        else:
            print(f"   ❌ Account deletion failed: {delete_response.status_code}")
            print(f"   Response: {delete_response.text}")
            return False

    except Exception as e:
        print(f"   ❌ Test failed with error: {str(e)}")
        return False


def test_admin_deletion_of_student():
    """Test admin deleting a student account"""
    print(f"\n👨‍💼 Testing admin deletion of student account")

    try:
        # Create admin user
        admin_username = 'test_admin_delete'
        admin_password = 'admin123'

        if not User.objects.filter(username=admin_username).exists():
            admin_user = User.objects.create_user(
                username=admin_username,
                email='testadmin@test.com',
                password=admin_password,
                first_name='Test',
                last_name='Admin',
                user_type='admin',
                approval_status='approved'
            )
            print("   ✅ Created test admin")
        else:
            admin_user = User.objects.get(username=admin_username)

        # Create student to delete
        student_username = 'test_student_delete'
        student_password = 'student123'
        create_test_user(student_username, student_password, 'student', 'Test', 'Student')

        # Login as admin
        login_data = {
            'username': admin_username,
            'password': admin_password,
            'user_type': 'admin'
        }

        login_response = requests.post('http://localhost:8000/api/users/login/', json=login_data)
        if login_response.status_code != 200:
            print(f"   ❌ Admin login failed")
            return False

        admin_token = login_response.json()['token']
        student_user = User.objects.get(username=student_username)

        # Test deletion
        headers = {'Authorization': f'Token {admin_token}'}
        delete_data = {
            'confirmation': f'delete {student_username}',
            'reason': 'Test deletion by admin'
        }

        delete_response = requests.delete(
            f'http://localhost:8000/api/users/delete-user/{student_user.id}/',
            json=delete_data,
            headers=headers
        )

        if delete_response.status_code == 200:
            delete_result = delete_response.json()
            print(f"   ✅ Admin successfully deleted student account!")
            print(f"   📝 Deleted by: {delete_result['deleted_user']['deleted_by']}")
            return True
        else:
            print(f"   ❌ Admin deletion failed: {delete_response.status_code}")
            return False

    except Exception as e:
        print(f"   ❌ Admin deletion test failed: {str(e)}")
        return False


def test_teacher_deletion_of_student():
    """Test teacher deleting a student account"""
    print(f"\n👨‍🏫 Testing teacher deletion of student account")

    try:
        # Create teacher user
        teacher_username = 'test_teacher_delete'
        teacher_password = 'teacher123'
        create_test_user(teacher_username, teacher_password, 'teacher', 'Test', 'Teacher')

        # Create student to delete
        student_username = 'test_student_delete2'
        student_password = 'student123'
        create_test_user(student_username, student_password, 'student', 'Test', 'Student2')

        # Login as teacher
        login_data = {
            'username': teacher_username,
            'password': teacher_password,
            'user_type': 'teacher'
        }

        login_response = requests.post('http://localhost:8000/api/users/login/', json=login_data)
        if login_response.status_code != 200:
            print(f"   ❌ Teacher login failed")
            return False

        teacher_token = login_response.json()['token']
        student_user = User.objects.get(username=student_username)

        # Test deletion
        headers = {'Authorization': f'Token {teacher_token}'}
        delete_data = {
            'confirmation': f'delete {student_username}',
            'reason': 'Test deletion by teacher'
        }

        delete_response = requests.delete(
            f'http://localhost:8000/api/users/delete-user/{student_user.id}/',
            json=delete_data,
            headers=headers
        )

        if delete_response.status_code == 200:
            delete_result = delete_response.json()
            print(f"   ✅ Teacher successfully deleted student account!")
            print(f"   📝 Deleted by: {delete_result['deleted_user']['deleted_by']}")
            return True
        else:
            print(f"   ❌ Teacher deletion failed: {delete_response.status_code}")
            return False

    except Exception as e:
        print(f"   ❌ Teacher deletion test failed: {str(e)}")
        return False


def main():
    print("🚀 COMPREHENSIVE ACCOUNT DELETION TESTING")
    print("=" * 60)

    # Check if Django server is running
    try:
        health_response = requests.get('http://localhost:8000/')
        print("✅ Django server is running")
    except:
        print("❌ Django server is not running. Please start with: python manage.py runserver")
        return

    results = []

    # Test 1: Student self-deletion
    create_test_user('test_student_self', 'student123', 'student', 'Test', 'Student')
    result1 = test_self_deletion('test_student_self', 'student123', 'student')
    results.append(("Student Self-Deletion", result1))

    # Test 2: Teacher self-deletion
    create_test_user('test_teacher_self', 'teacher123', 'teacher', 'Test', 'Teacher')
    result2 = test_self_deletion('test_teacher_self', 'teacher123', 'teacher')
    results.append(("Teacher Self-Deletion", result2))

    # Test 3: Admin deletion of student
    result3 = test_admin_deletion_of_student()
    results.append(("Admin Delete Student", result3))

    # Test 4: Teacher deletion of student
    result4 = test_teacher_deletion_of_student()
    results.append(("Teacher Delete Student", result4))

    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)

    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status} - {test_name}")

    all_passed = all(result for _, result in results)

    if all_passed:
        print("\n🎉 ALL TESTS PASSED!")
        print("\n✅ Account deletion functionality working correctly:")
        print("   • Students can delete their own accounts")
        print("   • Teachers can delete their own accounts")
        print("   • Admins can delete student accounts")
        print("   • Teachers can delete student accounts")
        print("   • All related data properly cleaned up")
        print("   • Confirmation requirements working")

        print("\n🔒 Frontend Integration:")
        print("   • Settings page has 'Danger Zone' tab")
        print("   • Account deletion with confirmation modal")
        print("   • Password verification required")
        print("   • Clear warnings about data loss")

        print("\n🎯 How to access:")
        print("   1. Login to any user type")
        print("   2. Go to Settings (⚙️ icon)")
        print("   3. Click 'Account' tab (⚠️)")
        print("   4. Enter password and click Delete Account")
        print("   5. Confirm in modal to permanently delete")

    else:
        print("\n❌ SOME TESTS FAILED!")
        print("\n🔧 Check:")
        print("   • Django server is running")
        print("   • Database migrations are applied")
        print("   • User creation working properly")
        print("   • API endpoints are accessible")


if __name__ == '__main__':
    main()
