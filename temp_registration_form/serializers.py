from rest_framework import serializers
from .models import GuideInterest

class GuideInterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuideInterest
        fields = '__all__'
