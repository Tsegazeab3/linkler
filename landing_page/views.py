from django.shortcuts import render
from django.views.generic import TemplateView
from rest_framework import viewsets
from .models import Message, Card
from .serializers import MessageSerializer, CardSerializer

class LandingPage(TemplateView):
    template_name = 'landing_page/index.html'

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all().order_by('-created_at')
    serializer_class = MessageSerializer

class CardViewSet(viewsets.ModelViewSet):
    queryset = Card.objects.all()
    serializer_class = CardSerializer
