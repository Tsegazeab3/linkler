from rest_framework import serializers
from .models import GuideInterest

class GuideInterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuideInterest
        fields = '__all__'

    def validate_email(self, value):
        """
        Check that the email is not already in use.
        """
        if GuideInterest.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An interest form with this email address has already been submitted.")
        return value
