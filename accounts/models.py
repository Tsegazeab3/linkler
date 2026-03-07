from django.db import models
from django.contrib.auth.models import AbstractUser

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
    bio = models.TextField(max_length=80, blank=True)

    def __str__(self):
        return self.username

class Follow(models.Model):
    follower = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='following')
    following = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')

    def __str__(self):
        return f"{self.follower} follows {self.following}"

