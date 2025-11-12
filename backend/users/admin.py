from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile, SystemSettings, AccessibilityProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'user_type', 'is_verified', 'date_joined']
    list_filter = ['user_type', 'is_verified', 'is_active', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name']

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('user_type', 'phone_number', 'profile_picture',
                       'date_of_birth', 'address', 'is_verified')
        }),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'preferred_language', 'timezone']
    search_fields = ['user__username', 'user__email']
    list_filter = ['preferred_language']


@admin.register(SystemSettings)
class SystemSettingsAdmin(admin.ModelAdmin):
    list_display = ('id', 'maintenance_mode', 'auto_approve_students', 'auto_approve_teachers', 'updated_at',
                    'updated_by')
    fieldsets = (
        ('User Management', {
            'fields': ('auto_approve_students', 'auto_approve_teachers', 'allow_public_registration')
        }),
        ('Security', {
            'fields': ('require_email_verification', 'max_login_attempts', 'session_timeout')
        }),
        ('Maintenance', {
            'fields': ('maintenance_mode', 'backup_frequency')
        }),
        ('Notifications', {
            'fields': ('email_notifications', 'sms_notifications', 'in_app_notifications')
        }),
        ('Metadata', {
            'fields': ('updated_by', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('updated_at',)

    def has_add_permission(self, request):
        # Only allow one settings object
        return not SystemSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        # Don't allow deletion of settings
        return False


@admin.register(AccessibilityProfile)
class AccessibilityProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'last_updated')
    search_fields = ['user__username', 'user__email']
