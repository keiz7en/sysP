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


def test_api_health():
    """Test API health endpoint"""
    try:
        response = requests.get('http://localhost:8000/api/health/')
        print(f"✅ API Health: {response.status_code} - {response.json()}")
        return True
    except Exception as e:
        print(f"❌ API Health failed: {str(e)}")
        return False


def test_admin_login():
    """Test admin login"""
    try:
        login_data = {
            'username': 'admin',
            'password': 'admin123',
            'user_type': 'admin'
        }
        response = requests.post('http://localhost:8000/api/users/login/', json=login_data)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Admin login successful: {data['user']['username']}")
            return data['token']
        else:
            print(f"❌ Admin login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Admin login error: {str(e)}")
        return None


def test_pending_teachers(token):
    """Test pending teachers endpoint"""
    try:
        headers = {'Authorization': f'Token {token}'}
        response = requests.get('http://localhost:8000/api/users/admin/pending-teachers/', headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Pending teachers: {data['count']} found")
            return data
        else:
            print(f"❌ Pending teachers failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Pending teachers error: {str(e)}")
        return None


def test_pending_students(token):
    """Test pending students endpoint"""
    try:
        headers = {'Authorization': f'Token {token}'}
        response = requests.get('http://localhost:8000/api/users/admin/pending-students/', headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Pending students: {data['count']} found")
            return data
        else:
            print(f"❌ Pending students failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Pending students error: {str(e)}")
        return None


def main():
    print("🚀 Testing API endpoints...")
    print("=" * 50)

    # Test API health
    if not test_api_health():
        print("❌ API server is not running. Please start the server first.")
        return

    # Test admin login
    token = test_admin_login()
    if not token:
        print("❌ Admin login failed. Cannot test approval endpoints.")
        return

    # Test approval endpoints
    teachers_data = test_pending_teachers(token)
    students_data = test_pending_students(token)

    print("\n" + "=" * 50)
    print("📊 API Test Summary:")
    print(f"   - API Health: ✅ Working")
    print(f"   - Admin Login: ✅ Working")
    print(f"   - Pending Teachers: {'✅ Working' if teachers_data else '❌ Failed'}")
    print(f"   - Pending Students: {'✅ Working' if students_data else '❌ Failed'}")

    if teachers_data and teachers_data['count'] > 0:
        print(f"\n📚 Teachers pending approval:")
        for teacher in teachers_data['pending_teachers']:
            print(f"   - {teacher['first_name']} {teacher['last_name']} ({teacher['email']})")

    if students_data and students_data['count'] > 0:
        print(f"\n🎓 Students pending approval:")
        for student in students_data['pending_students']:
            print(f"   - {student['first_name']} {student['last_name']} ({student['email']})")


if __name__ == '__main__':
    main()
