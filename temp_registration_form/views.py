from rest_framework import generics
from .models import GuideInterest
from .serializers import GuideInterestSerializer

class GuideInterestCreateView(generics.CreateAPIView):
    queryset = GuideInterest.objects.all()
    serializer_class = GuideInterestSerializer