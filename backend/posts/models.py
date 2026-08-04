from django.db import models
from django.conf import settings

class Post(models.Model):
    """
    Represents a single social media post, containing media, caption,
    and interaction details.
    """
    class PostStatus(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'

    class PostAudience(models.TextChoices):
        PUBLIC = 'public', 'Public'
        FOLLOWERS = 'followers', 'Followers'
        FRIENDS = 'friends', 'Friends'
        PRIVATE = 'private', 'Private'

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
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='posts',
        help_text="The user who created this post."
    )
    # Media fields are now optional
    media_type = models.CharField(
        max_length=10,
        choices=[('image', 'Image'), ('video', 'Video')],
        blank=True, null=True,
        help_text="Type of media (image or video) in the post."
    )
    media_file = models.FileField(
        upload_to='post_media/',
        max_length=500,
        blank=True, null=True,
        help_text="The actual media file, uploaded by the user."
    )
    aspect_ratio = models.CharField(
        max_length=10,
        blank=True, null=True,
        help_text="Aspect ratio of the media (e.g., '1:1', '4:5')."
    )
    caption = models.TextField(
        blank=True,
        help_text="The text caption accompanying the post."
    )
    # New fields for indexing/filtering
    country = models.CharField(max_length=100, blank=True)
    region = models.CharField(max_length=50, choices=REGION_CHOICES, blank=True, null=True)
    
    # New fields for post settings
    status = models.CharField(
        max_length=10,
        choices=PostStatus.choices,
        default=PostStatus.PUBLISHED,
        help_text="The status of the post (e.g., draft, published)."
    )
    audience = models.CharField(
        max_length=10,
        choices=PostAudience.choices,
        default=PostAudience.PUBLIC,
        help_text="The audience for this post."
    )
    allow_comments = models.BooleanField(
        default=True,
        help_text="Whether users can comment on this post."
    )
    # Interaction counts
    likes_count = models.PositiveIntegerField(
        default=0,
        help_text="Number of likes the post has received."
    )
    comments_count = models.PositiveIntegerField(
        default=0,
        help_text="Number of comments on the post."
    )
    saves_count = models.PositiveIntegerField(
        default=0,
        help_text="Number of times the post has been saved by users."
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="The date and time when the post was created."
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Post"
        verbose_name_plural = "Posts"

    def __str__(self):
        return f"Post by {self.user.username} ({self.status}) - {self.created_at.strftime('%Y-%m-%d')}"

class PostImage(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='post_images/', max_length=500)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"Image for {self.post.id}"

class Trip(models.Model):
    """
    Represents a trip plan created by a user looking for fellow travelers.
    """
    TRIP_CATEGORIES = (
        ('Adventure', 'Adventure'),
        ('Relaxing', 'Relaxing'),
        ('Cultural', 'Cultural'),
        ('Food', 'Food'),
        ('Nature', 'Nature'),
        ('Business', 'Business'),
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
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='trips',
        help_text="The user who created this trip plan."
    )
    origin = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    destination_country = models.CharField(max_length=100, blank=True)
    region = models.CharField(max_length=50, choices=REGION_CHOICES, default='Europe')
    category = models.CharField(max_length=50, choices=TRIP_CATEGORIES, default='Adventure')
    start_date = models.DateField()
    end_date = models.DateField()
    message = models.TextField()
    image = models.ImageField(upload_to='trip_images/', max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Trip"
        verbose_name_plural = "Trips"

    def __str__(self):
        return f"Trip from {self.origin} to {self.destination} by {self.user.username}"

class Like(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='post_likes')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='post_likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')

    def __str__(self):
        return f"{self.user.username} liked {self.post.id}"

class Save(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='post_saves')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='post_saves')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')

    def __str__(self):
        return f"{self.user.username} saved {self.post.id}"

class Comment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='post_comments')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='post_comments')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} commented on {self.post.id}"
