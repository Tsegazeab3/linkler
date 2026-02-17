from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = (
            'id', 'username', 'email', 'age', 'nationality', 'residence',
            'phone_no', 'city', 'country', 'facebook', 'instagram', 'git_hub',
            'linkedin', 'whatsapp', 'telegram', 'account_type', 'bio', 'profile_picture'
        )
        read_only_fields = ('email', 'account_type') # Cant change email or account type after creation


class CustomRegisterSerializer(RegisterSerializer):
    pass
