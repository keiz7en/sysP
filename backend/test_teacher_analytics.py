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


def test_teacher_analytics():
    """Test teacher analytics endpoint"""
    try:
        # First login as a teacher
        login_data = {
            'username': 'john.smith.teacher',
            'password': 'teacher123',
            'user_type': 'teacher'
        }

        print("🔐 Testing teacher login...")
        login_response = requests.post('http://localhost:8000/api/users/login/', json=login_data)

        if login_response.status_code != 200:
            print(f"❌ Teacher login failed: {login_response.status_code}")
            print(f"Response: {login_response.text}")
            return False

        login_result = login_response.json()
        token = login_result['token']
        print(f"✅ Teacher login successful: {login_result['user']['username']}")

        # Test analytics endpoint
        print("\n📊 Testing analytics endpoint...")
        headers = {'Authorization': f'Token {token}'}
        analytics_response = requests.get('http://localhost:8000/api/teachers/analytics/', headers=headers)

        if analytics_response.status_code == 200:
            data = analytics_response.json()
            print("✅ Analytics endpoint working!")
            print(f"📈 Overview data: {data.get('overview', 'No overview')}")
            print(f"👥 Student performance entries: {len(data.get('student_performance', []))}")
            print(f"📚 Course analytics entries: {len(data.get('course_analytics', []))}")
            print(f"🔄 Recent activities: {len(data.get('recent_activities', []))}")
            return True
        else:
            print(f"❌ Analytics endpoint failed: {analytics_response.status_code}")
            print(f"Response: {analytics_response.text}")
            return False

    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        return False


def main():
    print("🚀 Testing Teacher Analytics Endpoint...")
    print("=" * 50)

    # Test if Django server is running
    try:
        health_response = requests.get('http://localhost:8000/api/health/')
        if health_response.status_code == 200:
            print("✅ Django server is running")
        else:
            print("❌ Django server is not responding properly")
            return
    except:
        print("❌ Django server is not running. Please start with: python manage.py runserver")
        return

    # Test teacher analytics
    success = test_teacher_analytics()

    print("\n" + "=" * 50)
    if success:
        print("✅ Teacher Analytics endpoint is working correctly!")
        print("\n🎯 If frontend still doesn't work, the issue is:")
        print("   - Network connectivity")
        print("   - Frontend routing")
        print("   - Browser console errors")
        print("\n💡 Try opening browser dev tools and check Network tab")
    else:
        print("❌ Teacher Analytics endpoint has issues!")
        print("\n🔧 Possible fixes:")
        print("   - Check if teacher user exists and is approved")
        print("   - Verify Django server is running on port 8000")
        print("   - Check teacher profile creation")


if __name__ == '__main__':
    main()
