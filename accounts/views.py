from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated

from allauth.account.utils import complete_signup

from rest_framework.response import Response
from allauth.account import signals
from allauth.account.utils import send_email_confirmation

# This file will be emptied as dj-rest-auth replaces these views.