from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import TeacherProfile

User = get_user_model()


class TeacherProfileSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()

    class Meta:
        model = TeacherProfile
        fields = '__all__'

    def get_user_details(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'email': obj.user.email,
            'user_type': obj.user.user_type,
            'approval_status': obj.user.approval_status
        }
