from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LandingPage, MessageViewSet, CardViewSet, UserViewSet


router = DefaultRouter()
router.register(r'messages', MessageViewSet)
router.register(r'cards', CardViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('home', LandingPage.as_view()),
    path('', include(router.urls)),
]
