import os
import django
from django.core.files import File

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'linkler.settings')
django.setup()

from accounts.models import CustomUser
from posts.models import Post, PostImage

# Create or get user
user, created = CustomUser.objects.get_or_create(
    username='dubai_explorer', 
    defaults={
        'email': 'dubai@example.com',
        'first_name': 'Dubai',
        'last_name': 'Explorer',
        'bio': 'Travel enthusiast documenting the best of the UAE. 🇦🇪'
    }
)
if created:
    user.set_password('password123')
    user.save()

# Create or get Dubai Post
post = Post.objects.filter(caption__icontains="Just arrived in Dubai").first()
if not post:
    post = Post.objects.create(
        user=user,
        caption="Just arrived in Dubai! The architecture here is absolutely stunning. Can't wait to explore more of the city, from the Burj Khalifa to the desert safaris! 🏜️✨",
        country="United Arab Emirates",
        region="Middle East",
        media_type="image",
    )

# Add image to post
image_path = 'dubai_real.jpg'
if os.path.exists(image_path):
    with open(image_path, 'rb') as f:
        # Clear existing images
        PostImage.objects.filter(post=post).delete()
        PostImage.objects.create(
            post=post,
            image=File(f, name='dubai_city.jpg'),
            order=0
        )
        print("Image attached.")

print("Dubai post successfully updated with a real city image!")
