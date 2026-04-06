from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import CustomUser
from faker import Faker

fake = Faker()

class ProfileUpdateViewTests(APITestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username=fake.user_name(),
            email=fake.email(),
            password='password123',
            account_type='traveller'
        )
        self.client.force_authenticate(user=self.user)
        self.url = reverse('profile-update')

    def test_get_profile(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.user.username)

    def test_update_profile(self):
        new_bio = fake.text(max_nb_chars=80)
        data = {
            'bio': new_bio,
            'city': fake.city(),
            'country': fake.country()
        }
        response = self.client.patch(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.bio, new_bio)
