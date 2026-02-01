from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class Message(models.Model):
    text = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text

class Card(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    image = models.CharField(max_length=200, null=True, blank=True)

    def __str__(self):
        return self.title

class CustomUser(AbstractUser):
    ACCOUNT_TYPE_CHOICES = (
        ('guide', 'Guide'),
        ('traveller', 'Traveller'),
    )
    
    age = models.IntegerField(null=True, blank=True)
    nationality = models.CharField(max_length=100, blank=True)
    facebook = models.URLField(blank=True)
    instagram = models.URLField(blank=True)
    phone_no = models.CharField(max_length=20, blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    whatsapp = models.CharField(max_length=20, blank=True)
    telegram = models.CharField(max_length=100, blank=True)
    git_hub = models.URLField(blank=True)
    linkedin = models.URLField(blank=True)
    account_type = models.CharField(max_length=10, choices=ACCOUNT_TYPE_CHOICES, default='traveller')
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)

    def __str__(self):
        return self.username
