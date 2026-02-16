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
    age = serializers.IntegerField(required=False)
    nationality = serializers.CharField(max_length=100, required=False)
    residence = serializers.CharField(max_length=100, required=False)
    phone_no = serializers.CharField(max_length=20, required=False)
    city = serializers.CharField(max_length=100, required=False)
    country = serializers.CharField(max_length=100, required=False)
    whatsapp = serializers.CharField(max_length=20, required=False)
    telegram = serializers.CharField(max_length=100, required=False)
    git_hub = serializers.URLField(required=False)
    linkedin = serializers.URLField(required=False)
    facebook = serializers.URLField(required=False)
    instagram = serializers.URLField(required=False)
    account_type = serializers.ChoiceField(choices=CustomUser.ACCOUNT_TYPE_CHOICES, required=False)

    def custom_signup(self, request, user):
        user.age = self.validated_data.get('age', None)
        user.nationality = self.validated_data.get('nationality', '')
        user.residence = self.validated_data.get('residence', '')
        user.phone_no = self.validated_data.get('phone_no', '')
        user.city = self.validated_data.get('city', '')
        user.country = self.validated_data.get('country', '')
        user.whatsapp = self.validated_data.get('whatsapp', '')
        user.telegram = self.validated_data.get('telegram', '')
        user.git_hub = self.validated_data.get('git_hub', '')
        user.linkedin = self.validated_data.get('linkedin', '')
        user.facebook = self.validated_data.get('facebook', '')
        user.instagram = self.validated_data.get('instagram', '')
        user.account_type = self.validated_data.get('account_type', 'traveller')
        user.save()
