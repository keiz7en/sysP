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


def test_student_learning():
    """Test student learning path endpoint"""
    try:
        # First login as a student
        login_data = {
            'username': 'alice.johnson.student',
            'password': 'student123',
            'user_type': 'student'
        }

        print("🔐 Testing student login...")
        login_response = requests.post('http://localhost:8000/api/users/login/', json=login_data)

        if login_response.status_code != 200:
            print(f"❌ Student login failed: {login_response.status_code}")
            print(f"Response: {login_response.text}")
            return False

        login_result = login_response.json()
        token = login_result['token']
        print(f"✅ Student login successful: {login_result['user']['username']}")

        # Test learning path endpoint
        print("\n🧠 Testing learning path endpoint...")
        headers = {'Authorization': f'Token {token}'}
        learning_response = requests.get('http://localhost:8000/api/students/learning-path/', headers=headers)

        if learning_response.status_code == 200:
            data = learning_response.json()
            print("✅ Learning path endpoint working!")
            print(f"📚 Learning paths found: {len(data.get('learning_paths', []))}")
            print(f"📊 Overall progress: {data.get('overall_progress', 0)}%")
            print(f"🎯 Learning style: {data.get('learning_style', 'Not set')}")

            if data.get('ai_insights'):
                insights = data['ai_insights']
                print(f"🚀 Learning velocity: {insights.get('learning_velocity', 'N/A')}")
                print(f"💡 Engagement score: {insights.get('engagement_score', 'N/A')}")

            return True
        else:
            print(f"❌ Learning path endpoint failed: {learning_response.status_code}")
            print(f"Response: {learning_response.text}")
            return False

    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        return False


def main():
    print("🚀 Testing Student Learning Path Endpoint...")
    print("=" * 50)

    # Test if Django server is running
    try:
        health_response = requests.get('http://localhost:8000/')
        print("✅ Django server is running")
    except:
        print("❌ Django server is not running. Please start with: python manage.py runserver")
        return

    # Test student learning path
    success = test_student_learning()

    print("\n" + "=" * 50)
    if success:
        print("✅ Student Learning Path endpoint is working correctly!")
        print("\n🎯 If frontend still doesn't work, check:")
        print("   - Browser console for JavaScript errors")
        print("   - Network tab for API call details")
        print("   - Authentication token issues")
        print("\n💡 Try opening http://localhost:3000/student/learning")
    else:
        print("❌ Student Learning Path endpoint has issues!")
        print("\n🔧 Possible fixes:")
        print("   - Check if student user exists and is authenticated")
        print("   - Verify Django server is running on port 8000")
        print("   - Check student profile exists in database")


if __name__ == '__main__':
    main()
