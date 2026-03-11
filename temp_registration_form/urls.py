from django.urls import path
from .views import GuideInterestCreateView

urlpatterns = [
    path('register/', GuideInterestCreateView.as_view(), name='register_interest'),
]
