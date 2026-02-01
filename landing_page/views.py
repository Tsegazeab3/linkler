from django.shortcuts import render
from django.views.generic import TemplateView
from rest_framework import viewsets
from .models import Message, Card, CustomUser
from .serializers import MessageSerializer, CardSerializer, UserSerializer
from rest_framework.permissions import AllowAny

class LandingPage(TemplateView):
    template_name = 'landing_page/index.html'

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all().order_by('-created_at')
    serializer_class = MessageSerializer

class CardViewSet(viewsets.ModelViewSet):
    queryset = Card.objects.all()
    serializer_class = CardSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'id'

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return super().get_permissions()
