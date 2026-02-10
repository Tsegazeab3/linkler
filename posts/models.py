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
        PRIVATE = 'private', 'Private'

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