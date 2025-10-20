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
import json


def debug_registration():
    """Debug student and teacher registration"""
    print("🔍 Debugging Registration Issues")
    print("=" * 50)

    client = Client()

    # Test student registration
    print("\n1. Testing Student Registration - Detailed")
    print("-" * 40)

    student_data = {
        'username': 'debug_student',
        'first_name': 'Debug',
        'last_name': 'Student',
        'email': 'debug.student@example.com',
        'password': 'testpass123',
        'user_type': 'student',
        'phone_number': '1234567890',
        'address': '123 Debug St'
    }

    response = client.post('/api/users/register/',
                           data=json.dumps(student_data),
                           content_type='application/json')

    print(f"Status Code: {response.status_code}")
    print(f"Response Content: {response.content.decode()}")

    # Test teacher registration
    print("\n2. Testing Teacher Registration - Detailed")
    print("-" * 40)

    teacher_data = {
        'username': 'debug_teacher',
        'first_name': 'Debug',
        'last_name': 'Teacher',
        'email': 'debug.teacher@example.com',
        'password': 'testpass123',
        'user_type': 'teacher',
        'phone_number': '1234567890',
        'address': '123 Debug St'
    }

    response = client.post('/api/users/register/',
                           data=json.dumps(teacher_data),
                           content_type='application/json')

    print(f"Status Code: {response.status_code}")
    print(f"Response Content: {response.content.decode()}")


if __name__ == '__main__':
    debug_registration()
