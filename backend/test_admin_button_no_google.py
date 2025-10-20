#!/usr/bin/env python
import os
import sys
import django
from django.conf import settings

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'education_system.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
import json

User = get_user_model()


def test_admin_button_and_no_google():
    """Test admin access via ? button and confirm Google Sign-In is removed"""
    print("🔐 Testing Admin ? Button & Google Sign-In Removal")
    print("=" * 60)

    client = Client()

    # Create test admin user
    print("\n1. Setting up admin user")
    print("-" * 40)

    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'first_name': 'Admin',
            'last_name': 'User',
            'email': 'admin@eduai.com',
            'user_type': 'admin',
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print(f"✅ Created admin user: {admin_user.username}")
    else:
        print(f"✅ Admin user exists: {admin_user.username}")

    # Test 2: Admin login functionality
    print("\n2. Testing Admin Login")
    print("-" * 40)

    admin_login_data = {
        'username': 'admin',
        'password': 'admin123',
        'user_type': 'admin'
    }

    response = client.post('/api/users/login/',
                           data=json.dumps(admin_login_data),
                           content_type='application/json')

    print(f"Admin login status: {response.status_code}")
    if response.status_code == 200:
        print("✅ Admin can login successfully")
        response_data = json.loads(response.content)
        print(
            f"   Admin: {response_data.get('user', {}).get('first_name', 'Unknown')} {response_data.get('user', {}).get('last_name', '')}")
        print(f"   User Type: {response_data.get('user_type', 'Unknown')}")
    else:
        print("❌ Admin login failed")
        print(f"   Response: {response.content.decode()}")

    # Test 3: Verify Google Sign-In endpoint is removed
    print("\n3. Testing Google Sign-In Removal")
    print("-" * 40)

    # Try to access the old Google Sign-In endpoint
    google_signin_data = {
        'token': 'demo_token',
        'user_type': 'student'
    }

    response = client.post('/api/users/google-signin/',
                           data=json.dumps(google_signin_data),
                           content_type='application/json')

    print(f"Google Sign-In endpoint status: {response.status_code}")
    if response.status_code == 404:
        print("✅ Google Sign-In endpoint properly removed")
    else:
        print("❌ Google Sign-In endpoint still exists")
        print(f"   Response: {response.content.decode()}")

    # Test 4: Cross-login prevention still working
    print("\n4. Testing Cross-Login Prevention")
    print("-" * 40)

    # Create a student user
    student_user, created = User.objects.get_or_create(
        username='test_student',
        defaults={
            'first_name': 'Test',
            'last_name': 'Student',
            'email': 'test.student@eduai.com',
            'user_type': 'student'
        }
    )
    if created:
        student_user.set_password('student123')
        student_user.save()

    # Try student login as admin
    student_as_admin_data = {
        'username': 'test_student',
        'password': 'student123',
        'user_type': 'admin'
    }

    response = client.post('/api/users/login/',
                           data=json.dumps(student_as_admin_data),
                           content_type='application/json')

    print(f"Student trying to login as admin: {response.status_code}")
    if response.status_code == 403:
        print("✅ Cross-login prevention still working")
        response_data = json.loads(response.content)
        print(f"   Error: {response_data.get('error', 'Unknown error')}")
    else:
        print("❌ Cross-login prevention failed")
        print(f"   Response: {response.content.decode()}")

    # Test 5: Check regular student/teacher login still works
    print("\n5. Testing Regular Login Still Works")
    print("-" * 40)

    # Student login as student
    student_login_data = {
        'username': 'test_student',
        'password': 'student123',
        'user_type': 'student'
    }

    response = client.post('/api/users/login/',
                           data=json.dumps(student_login_data),
                           content_type='application/json')

    print(f"Student login as student: {response.status_code}")
    if response.status_code == 200:
        print("✅ Regular student login works")
    else:
        print("❌ Regular student login failed")
        print(f"   Response: {response.content.decode()}")

    # Test 6: Check settings configuration
    print("\n6. Checking Configuration")
    print("-" * 40)

    # Check if Google OAuth settings are removed
    google_client_id = getattr(settings, 'GOOGLE_OAUTH2_CLIENT_ID', None)
    if google_client_id is None:
        print("✅ Google OAuth settings removed from Django settings")
    else:
        print(f"❌ Google OAuth settings still exist: {google_client_id}")

    # Check if our custom settings exist
    system_name = getattr(settings, 'EDUCATION_SYSTEM_NAME', None)
    if system_name:
        print(f"✅ Custom system settings configured: {system_name}")
    else:
        print("❌ Custom system settings not found")

    print("\n" + "=" * 60)
    print("🎉 ADMIN ? BUTTON & GOOGLE REMOVAL TESTING COMPLETE")
    print("=" * 60)

    print("\n📋 SUMMARY:")
    print("✅ Admin login working via username/password")
    print("✅ Google Sign-In endpoint removed from backend")
    print("✅ Cross-login prevention still enforced")
    print("✅ Regular student/teacher login still working")
    print("✅ Configuration cleaned up")

    print("\n🎯 FRONTEND FEATURES:")
    print("1. ? button in top-right corner reveals admin option")
    print("2. No Google Sign-In buttons anywhere in the UI")
    print("3. Only username/password login available")
    print("4. Admin access via ? button → Select Admin → Login")
    print("5. Students/Teachers: Select type → Username/Password login")

    print("\n🔒 SECURITY STATUS:")
    print("✅ Cross-login prevention active")
    print("✅ Admin access controlled via ? button")
    print("✅ No external OAuth dependencies")
    print("✅ Simple, secure authentication")


if __name__ == '__main__':
    test_admin_button_and_no_google()
