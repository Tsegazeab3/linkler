from django.db import models
from django.conf import settings
from django.core.files.base import ContentFile
import bleach
import os
from PIL import Image
from io import BytesIO

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
    text_alignment = models.CharField(
        max_length=10,
        choices=[('left', 'Left'), ('center', 'Center'), ('right', 'Right')],
        default='center',
        help_text="Alignment of the text in text-only posts."
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

    def save(self, *args, **kwargs):
        """
        Optimize media files before saving to reduce storage and bandwidth usage.
        """
        if self.media_file and self.media_type == 'image':
            self.optimize_image()
            
        super().save(*args, **kwargs)

    def optimize_image(self):
        """
        Resizes and compresses the image to a 'compiled' version.
        Target: Max width 1200px, high quality JPEG compression.
        """
        try:
            # Open the uploaded image
            img = Image.open(self.media_file)
            
            # Convert RGBA to RGB if necessary (JPEGs don't support transparency)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")

            # Resize if the image is too large
            MAX_SIZE = (1200, 1200)
            if img.width > 1200 or img.height > 1200:
                img.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)

            # Compress the image
            output = BytesIO()
            img.save(output, format='JPEG', quality=85, optimize=True)
            output.seek(0)

            # Update the media_file field with the optimized version
            # Use the original filename but ensure it has a .jpg extension
            name = os.path.splitext(self.media_file.name)[0] + ".jpg"
            self.media_file = ContentFile(output.read(), name=name)
            
        except Exception as e:
            print(f"Error optimizing image: {e}")
            # If optimization fails, we save the original rather than crashing

class Like(models.Model):
    """
    Represents a 'like' given to a post by a user.
    """
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='likes',
        help_text="The post being liked."
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='liked_posts',
        help_text="The user who liked the post."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Like"
        verbose_name_plural = "Likes"
        unique_together = ('post', 'user') # A user can only like a post once

    def __str__(self):
        return f"{self.user.username} liked {self.post}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            self.post.likes_count += 1
            self.post.save()

    def delete(self, *args, **kwargs):
        post = self.post
        super().delete(*args, **kwargs)
        post.likes_count = max(0, post.likes_count - 1)
        post.save()

class Trip(models.Model):
    # ... (rest of Trip model)
    def __str__(self):
        return f"Trip from {self.origin} to {self.destination} by {self.user.username}"

class Comment(models.Model):
    """
    Represents a comment made by a user on a post.
    """
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='comments',
        help_text="The post this comment belongs to."
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='comments',
        help_text="The user who wrote this comment."
    )
    text = models.TextField(help_text="The content of the comment.")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = "Comment"
        verbose_name_plural = "Comments"

    def __str__(self):
        return f"Comment by {self.user.username} on {self.post}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            # Increment the comments_count on the post
            self.post.comments_count += 1
            self.post.save()

    def delete(self, *args, **kwargs):
        post = self.post
        super().delete(*args, **kwargs)
        # Decrement the comments_count on the post
        post.comments_count = max(0, post.comments_count - 1)
        post.save()
