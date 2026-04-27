import urllib.request
import os
import django
from django.core.files import File

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'linkler.settings')
django.setup()

from posts.models import Post, PostImage

url = "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1000&auto=format&fit=crop"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as response, open("dubai_real.jpg", "wb") as out_file:
    out_file.write(response.read())

post = Post.objects.filter(country="United Arab Emirates").first()
if post:
    PostImage.objects.filter(post=post).delete()
    with open("dubai_real.jpg", 'rb') as f:
        PostImage.objects.create(
            post=post,
            image=File(f, name='dubai_real.jpg'),
            order=0
        )
    print("Dubai post updated with real image!")
