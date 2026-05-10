import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'linkler.settings')
django.setup()

from django.test import RequestFactory
from accounts.models import CustomUser
from accounts.views import ProfileUpdateView
from rest_framework.request import Request

user = CustomUser.objects.first()
factory = RequestFactory()

# Mock a proper multipart request
data = {
    "username": user.username,
    "bio": "",
    "phone_no": "",
    "city": "",
    "country": "",
    "nationality": "",
    "opt_out_discovery": "false",
    "show_followers_list": "true"
}

request = factory.patch('/api/accounts/profile/', data=data, format='multipart')
request.user = user

view = ProfileUpdateView.as_view()
response = view(request)

print("Status:", response.status_code)
if hasattr(response, 'data'):
    print("Response Data:", response.data)
