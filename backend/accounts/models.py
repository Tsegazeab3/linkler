from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ACCOUNT_TYPE_CHOICES = (
        ('traveller', 'Travellers'),
        ('guide', 'Guides'),
    )

    VERIFICATION_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    )
    
    age = models.IntegerField(null=True, blank=True)
    nationality = models.CharField(max_length=100, blank=True)
    facebook = models.URLField(blank=True)
    instagram = models.URLField(blank=True)
    phone_no = models.CharField(max_length=30, blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    whatsapp = models.CharField(max_length=30, blank=True)
    telegram = models.CharField(max_length=100, blank=True)
    git_hub = models.URLField(blank=True)
    linkedin = models.URLField(blank=True)
    account_type = models.CharField(max_length=10, choices=ACCOUNT_TYPE_CHOICES, default='traveller')
    profile_picture = models.ImageField(upload_to='profile_pics/', max_length=500, null=True, blank=True)
    bio = models.TextField(max_length=80, blank=True)
    opt_out_discovery = models.BooleanField(default=False, help_text="If true, the user will not appear in search or discovery algorithms.")
    show_followers_list = models.BooleanField(default=True, help_text="Whether other users can see this user's followers/following lists.")
    
    # New Onboarding & Verification Fields
    onboarding_completed = models.BooleanField(default=False)
    verification_status = models.CharField(
        max_length=10, 
        choices=VERIFICATION_STATUS_CHOICES, 
        default='pending'
    )

    @property
    def is_profile_complete(self):
        return len(self.missing_fields) == 0

    @property
    def missing_fields(self):
        missing = []
        
        # Everyone needs onboarding
        if not self.onboarding_completed:
            missing.append('onboarding_questionnaire')

        # Guides need more professional details
        if self.account_type == 'guide':
            if not self.profile_picture: missing.append('profile_picture')
            if not self.bio: missing.append('bio')
            if not self.country: missing.append('country')
            if not self.phone_no: missing.append('phone_no')
            
            docs = self.verification_documents.all()
            if not docs.filter(document_type='id').exists():
                missing.append('verification_id')
            if not docs.filter(document_type='visa').exists():
                missing.append('verification_visa')
            
        return missing

    def __str__(self):
        return self.username

class TravelerProfile(models.Model):
    """
    Detailed questionnaire for Travelers after sign-up.
    """
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='traveler_profile')
    
    # Travel Interests (Stored as JSON)
    interests = models.JSONField(default=list, help_text="e.g. ['adventure', 'culture', 'food']")
    
    # Structured Travel Data
    past_adventures = models.JSONField(default=list, help_text="List of objects: {country, purpose, duration, motivation}")
    future_intentions = models.JSONField(default=list, help_text="List of objects: {destination, timeline, purpose, motivation}")
    
    job_industry = models.CharField(max_length=100, blank=True)
    travel_flexibility = models.CharField(max_length=50, blank=True, help_text="Flexibility for travel")
    
    budget_range = models.CharField(max_length=50, blank=True, help_text="e.g. Luxury, Mid-range, Budget")
    travel_style = models.CharField(max_length=50, blank=True, help_text="e.g. Backpacker, Organized")
    
    group_preference = models.CharField(max_length=50, blank=True, help_text="Group vs solo travel preferences")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile for {self.user.username}"

class VerificationDocument(models.Model):
    """
    Identity and legal documentation for Guide verification.
    """
    DOCUMENT_TYPE_CHOICES = (
        ('id', 'Government Issued ID'),
        ('visa', 'Residency/Visa Documentation (UAE)'),
        ('license', 'Professional Guide License'),
        ('other', 'Other'),
    )
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='verification_documents')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPE_CHOICES)
    file = models.FileField(upload_to='verification_docs/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.get_document_type_display()} for {self.user.username}"

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
    Represents an experience (tour, service, activity) offered by a Guide.
    """
    LISTING_TYPE_CHOICES = (
        ('experience', 'Experience (Fun)'),
        ('service', 'Service (Essentials)'),
    )

    EXPERIENCE_CATEGORIES = (
        # Fun / Leisure
        ('Adventure', 'Adventure'),
        ('Culture', 'Culture'),
        ('Nightlife', 'Nightlife'),
        ('History', 'History'),
        ('Nature', 'Nature'),
        ('Gastronomy', 'Gastronomy'),
        # Essentials / Utility
        ('Transportation', 'Transportation'),
        ('Housing', 'Housing'),
        ('Documentation', 'Documentation'),
        ('Connectivity', 'Connectivity'),
        ('Local Support', 'Local Support'),
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
        limit_choices_to={'account_type': 'guide'}
    )
    listing_type = models.CharField(max_length=20, choices=LISTING_TYPE_CHOICES, default='experience')
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
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def save(self, *args, **kwargs):
        if not self.id and self.image:
            self.image = self.optimize_image(self.image)
        super().save(*args, **kwargs)

    def optimize_image(self, image_field):
        if not image_field:
            return None

        # Check if the input is already a string URL (common in seeding)
        if isinstance(image_field, str) and (image_field.startswith('http://') or image_field.startswith('https://')):
            return image_field

        # Check if it's a File object with a name that is a URL
        name = getattr(image_field, 'name', '')
        if name.startswith('http://') or name.startswith('https://'):
            return image_field

        try:
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

            # Change the filename extension to jpg
            name = image_field.name.split('.')[0] + '.jpg'
            return ContentFile(output.read(), name=name)
        except Exception as e:
            print(f"Image optimization failed: {e}")
            return image_field

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
        limit_choices_to={'account_type': 'guide'}
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

class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    )
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='user_bookings')
    provider = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='provider_bookings', limit_choices_to={'account_type': 'guide'})
    experience = models.ForeignKey(Experience, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    source_post = models.ForeignKey('posts.Post', on_delete=models.SET_NULL, null=True, blank=True, related_name='generated_bookings')
    booking_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='USD')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-booking_date']
        # Removed unique_together to support multiple bookings per day

    def __str__(self):
        return f"Booking for {self.provider.username} on {self.booking_date} by {self.user.username}"

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.provider.account_type == 'guide' and self.provider.verification_status != 'verified':
            raise ValidationError("This provider is not yet verified and cannot accept bookings.")

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('booking_request', 'New Booking Request'),
        ('booking_confirmed', 'Booking Confirmed'),
        ('booking_cancelled', 'Booking Cancelled'),
        ('system', 'System Alert'),
    )
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=100)
    message = models.TextField()
    link = models.CharField(max_length=255, blank=True, help_text="Relative URL to navigate to")
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.username}: {self.title}"

class GuideAvailability(models.Model):
    """
    Allows guides to mark specific dates as unavailable.
    """
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='availability')
    date = models.DateField()
    is_available = models.BooleanField(default=False, help_text="False means blackout date")
    reason = models.CharField(max_length=255, blank=True)

    class Meta:
        unique_together = ('user', 'date')
        verbose_name_plural = "Guide Availabilities"

    def __str__(self):
        return f"{self.user.username} unavailable on {self.date}"
        return f"{self.type} for {self.user.username} - {self.title}"

