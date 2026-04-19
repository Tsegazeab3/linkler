from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ACCOUNT_TYPE_CHOICES = (
        ('traveller', 'Travellers'),
        ('guide', 'Guides'),
        ('service', 'Services'),
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
    opt_out_discovery = models.BooleanField(default=False, help_text="If true, the user will not appear in search or discovery algorithms.")
    show_followers_list = models.BooleanField(default=True, help_text="Whether other users can see this user's followers/following lists.")

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

class Experience(models.Model):
    """
    Represents an experience (tour, service, activity) offered by a Guide or Service Provider.
    """
    EXPERIENCE_CATEGORIES = (
        ('Cultural', 'Cultural'),
        ('Adventure', 'Adventure'),
        ('Food', 'Food'),
        ('Nature', 'Nature'),
        ('Other', 'Other'),
    )
    REGION_CHOICES = (
        ('Africa', 'Africa'),
        ('Asia', 'Asia'),
        ('Europe', 'Europe'),
        ('North America', 'North America'),
        ('South America', 'South America'),
        ('Oceania', 'Oceania'),
        ('Middle East', 'Middle East'),
    )
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='experiences',
        limit_choices_to={'account_type__in': ['guide', 'service']}
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='USD')
    location = models.CharField(max_length=255)
    country = models.CharField(max_length=100, blank=True)
    region = models.CharField(max_length=50, choices=REGION_CHOICES, default='Europe')
    duration = models.CharField(max_length=100, help_text="e.g. 3 hours, 2 days")
    category = models.CharField(max_length=100, choices=EXPERIENCE_CATEGORIES, default='Cultural')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} by {self.user.username}"

import sys
from PIL import Image
from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile

class ExperienceImage(models.Model):
    experience = models.ForeignKey(Experience, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='experiences/')
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.id and self.image:
            self.image = self.optimize_image(self.image)
        super().save(*args, **kwargs)

    def optimize_image(self, image_field):
        img = Image.open(image_field)
        
        # Convert to RGB if necessary (e.g. for PNG with transparency)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize if too large
        max_size = (1200, 1200)
        if img.height > max_size[1] or img.width > max_size[0]:
            img.thumbnail(max_size, Image.LANCZOS)
        
        # Compress
        output = BytesIO()
        img.save(output, format='JPEG', quality=85, optimize=True)
        output.seek(0)
        
        return InMemoryUploadedFile(
            output, 'ImageField', f"{image_field.name.split('.')[0]}.jpg",
            'image/jpeg', sys.getsizeof(output), None
        )

    def __str__(self):
        return f"Image for {self.experience.title}"

class ExperienceReview(models.Model):
    experience = models.ForeignKey(Experience, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(default=5)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('experience', 'user')

    def __str__(self):
        return f"Review by {self.user.username} for {self.experience.title}"

class ExperienceSave(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='saved_experiences')
    experience = models.ForeignKey(Experience, on_delete=models.CASCADE, related_name='saved_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'experience')

    def __str__(self):
        return f"{self.user.username} saved {self.experience.title}"

class ProviderReview(models.Model):
    """
    Allows travellers to rate and review Guides and Service Providers directly.
    """
    provider = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='provider_reviews',
        limit_choices_to={'account_type__in': ['guide', 'service']}
    )
    user = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='submitted_provider_reviews'
    )
    rating = models.PositiveIntegerField(default=5)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('provider', 'user')

    def __str__(self):
        return f"Review by {self.user.username} for {self.provider.username}"

class PasswordResetToken(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='password_reset_tokens')
    hashed_token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def is_valid(self):
        from django.utils import timezone
        return not self.is_used and self.expires_at > timezone.now()

    def __str__(self):
        return f"Token for {self.user.email}"

