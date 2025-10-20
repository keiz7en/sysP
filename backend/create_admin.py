#!/usr/bin/env python
import os
import sys
import django
from django.conf import settings

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'education_system.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()


def create_admin():
    """Create a single admin user for system management"""

    print("🔧 Creating system administrator...")

    # Check if admin already exists
    if User.objects.filter(user_type='admin').exists():
        print("✅ Admin user already exists!")
        admin_user = User.objects.filter(user_type='admin').first()
        print(f"   Username: {admin_user.username}")
        print(f"   Email: {admin_user.email}")
        return

    # Create admin user
    admin_user = User.objects.create_user(
        username='admin',
        email='admin@eduai.com',
        password='admin123',
        first_name='System',
        last_name='Administrator',
        user_type='admin',
        approval_status='approved'
    )

    print("✅ Admin user created successfully!")
    print("\n📋 ADMIN LOGIN CREDENTIALS:")
    print("=" * 40)
    print("Username: admin")
    print("Password: admin123")
    print("Email: admin@eduai.com")
    print("=" * 40)
    print("\n💡 The admin can now:")
    print("   - Approve teacher applications")
    print("   - Approve student registrations")
    print("   - Manage all system users")
    print("   - Access system analytics")


if __name__ == '__main__':
    create_admin()
