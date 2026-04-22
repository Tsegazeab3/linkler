import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from faker import Faker
from accounts.models import Experience, ExperienceImage, ExperienceReview, ExperienceSave, Follow
from posts.models import Post, Trip, Like, Save, Comment, PostImage
from discovery.models import Promotion
from chat.models import Conversation, Message
from django.utils import timezone
from django.core.files.base import ContentFile

User = get_user_model()
fake = Faker()

class Command(BaseCommand):
    help = 'Seeds the database with fake data for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            type=int,
            default=10,
            help='Number of users to create'
        )
        parser.add_argument(
            '--posts',
            type=int,
            default=20,
            help='Number of posts to create'
        )
        parser.add_argument(
            '--trips',
            type=int,
            default=10,
            help='Number of trips to create'
        )
        parser.add_argument(
            '--promotions',
            type=int,
            default=5,
            help='Number of promotions to create'
        )

    def handle(self, *args, **options):
        self.stdout.write('Seeding data...')
        
        num_users = options['users']
        num_posts = options['posts']
        num_trips = options['trips']
        num_promotions = options['promotions']

        # Helper for regions and countries
        region_countries = {
            'Africa': ['Senegal', 'Nigeria', 'Kenya', 'South Africa', 'Egypt', 'Morocco'],
            'Asia': ['Japan', 'China', 'India', 'Thailand', 'Vietnam', 'Indonesia'],
            'Europe': ['France', 'UK', 'Italy', 'Germany', 'Spain', 'Greece'],
            'North America': ['USA', 'Canada', 'Mexico'],
            'South America': ['Brazil', 'Argentina', 'Colombia', 'Peru', 'Chile'],
            'Oceania': ['Australia', 'New Zealand', 'Fiji'],
            'Middle East': ['UAE', 'Saudi Arabia', 'Jordan', 'Qatar', 'Oman'],
        }
        regions_list = list(region_countries.keys())

        # 1. Create Users
        users = []
        account_types = ['traveller', 'guide', 'service']
        
        profile_images = [
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
        ]
        
        # Ensure we have a superuser for testing
        if not User.objects.filter(is_superuser=True).exists():
            admin = User.objects.create_superuser('admin', 'admin@example.com', 'adminpass')
            self.stdout.write(self.style.SUCCESS('Created superuser: admin/adminpass'))
        else:
            admin = User.objects.filter(is_superuser=True).first()
        users.append(admin)

        for i in range(num_users):
            username = fake.user_name() + str(random.randint(1, 100))
            if User.objects.filter(username=username).exists():
                continue
            
            selected_region = random.choice(regions_list)
            selected_country = random.choice(region_countries[selected_region])
            
            user = User.objects.create_user(
                username=username,
                email=fake.email(),
                password='password123',
                age=random.randint(18, 60),
                nationality=selected_country,
                city=fake.city(),
                country=selected_country,
                account_type=random.choice(account_types),
                bio=fake.text(max_nb_chars=80),
                phone_no=fake.phone_number(),
                profile_picture=random.choice(profile_images)
            )
            users.append(user)
        
        self.stdout.write(f'Created {len(users)} users.')

        # 2. Create Follows
        for user in users:
            others = [u for u in users if u != user]
            for other in random.sample(others, min(len(others), random.randint(1, 5))):
                Follow.objects.get_or_create(follower=user, following=other)
        
        self.stdout.write('Created follows.')

        # 3. Create Experiences (only for guides and services)
        guides_and_services = [u for u in users if u.account_type in ['guide', 'service']]
        if guides_and_services:
            for i in range(num_users):
                guide = random.choice(guides_and_services)
                selected_region = random.choice(regions_list)
                selected_country = random.choice(region_countries[selected_region])
                
                exp = Experience.objects.create(
                    user=guide,
                    title=fake.sentence(nb_words=4),
                    description=fake.paragraph(),
                    price=random.randint(10, 500),
                    currency='USD',
                    location=fake.city(),
                    country=selected_country,
                    region=selected_region,
                    duration=f"{random.randint(1, 8)} hours",
                    category=random.choice(['Cultural', 'Adventure', 'Food', 'Nature', 'Other'])
                )
                
                # Add reviews
                travellers = [u for u in users if u != guide]
                for traveller in random.sample(travellers, min(len(travellers), random.randint(1, 3))):
                    ExperienceReview.objects.get_or_create(
                        experience=exp,
                        user=traveller,
                        defaults={
                            'rating': random.randint(3, 5),
                            'comment': fake.sentence()
                        }
                    )
            self.stdout.write(f'Created {num_users} experiences with reviews.')

        # 4. Create Posts
        travel_captions = [
            "Exploring the hidden gems of the Mediterranean. The water is so clear! 🌊 #travel #summer",
            "Wandering through the ancient streets of Kyoto. Every corner is a photo op. ⛩️",
            "Finally made it to the Top of Europe! The view from Jungfraujoch is breathtaking. 🏔️",
            "Sunset over the Serengeti was a spiritual experience. Nature at its finest. 🌅",
            "Lost in the vibrant colors of Marrakesh. The spices smell incredible! 🏮",
            "Morning coffee with a view of the Eiffel Tower. Living the Parisian dream. ☕🥐",
            "The architecture in Barcelona is out of this world. Gaudi was a genius. 🏗️",
            "Hiking the Inca Trail was tough but seeing Machu Picchu at dawn was worth it. 🧗‍♂️",
            "Diving in the Great Barrier Reef. The coral colors are so vivid! 🐠",
            "Road tripping through Iceland. The landscapes look like another planet. 🇮🇸",
            "Enjoying the best street food in Bangkok. Spicy but so good! 🍜",
            "Winter wonderland in Lapland. Chasing the Northern Lights tonight! 🌌",
            "The serenity of the Swiss Alps is unmatched. Perfect place to disconnect. ❄️",
            "Cruising along the Amalfi Coast. This place is straight out of a movie. 🛥️",
            "Exploring the futuristic skyline of Singapore. The Gardens by the Bay are magical. 🌳"
        ]

        travel_images = [
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1502602898657-3e917247a183?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1583997051651-8255c48b7525?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1508913912821-b4bbd5bc89be?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1504109586057-7a2ae83d1338?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1517154421773-0529f29ea451?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
        ]

        for i in range(num_posts):
            author = random.choice(users)
            caption = random.choice(travel_captions)
            
            # Decide if it's text-only, single image, or multiple images
            post_type = random.choice(['text', 'single', 'multiple'])
            
            if post_type == 'text':
                post = Post.objects.create(
                    user=author,
                    caption=caption,
                    status='published',
                    audience='public',
                    allow_comments=True
                )
            elif post_type == 'single':
                image_url = random.choice(travel_images)
                post = Post.objects.create(
                    user=author,
                    caption=caption,
                    media_file=image_url,
                    media_type='image',
                    status='published',
                    audience='public',
                    allow_comments=True
                )
            else:
                post = Post.objects.create(
                    user=author,
                    caption=caption,
                    media_type='image',
                    status='published',
                    audience='public',
                    allow_comments=True
                )
                # Create 2-5 images for this post
                num_imgs = random.randint(2, 5)
                selected_imgs = random.sample(travel_images, num_imgs)
                for img_url in selected_imgs:
                    PostImage.objects.create(post=post, image=img_url)
            
            # Add interactions
            others = [u for u in users if u != author]
            # Likes
            for liker in random.sample(others, min(len(others), random.randint(1, 10))):
                Like.objects.get_or_create(user=liker, post=post)
            
            # Comments
            for commenter in random.sample(others, min(len(others), random.randint(1, 5))):
                Comment.objects.create(
                    user=commenter,
                    post=post,
                    text=fake.sentence()
                )
            
            # Update counts (since they are PositiveIntegerField in models)
            post.likes_count = post.post_likes.count()
            post.comments_count = post.post_comments.count()
            post.save()

        self.stdout.write(f'Created {num_posts} posts with likes and comments.')

        # 5. Create Trips
        for i in range(num_trips):
            user = random.choice(users)
            selected_region = random.choice(regions_list)
            selected_country = random.choice(region_countries[selected_region])
            
            Trip.objects.create(
                user=user,
                origin=fake.city(),
                destination=fake.city(),
                destination_country=selected_country,
                region=selected_region,
                category=random.choice(['Adventure', 'Relaxing', 'Cultural', 'Food', 'Nature', 'Business', 'Other']),
                start_date=timezone.now().date() + timezone.timedelta(days=random.randint(1, 30)),
                end_date=timezone.now().date() + timezone.timedelta(days=random.randint(31, 60)),
                message=fake.sentence()
            )
        self.stdout.write(f'Created {num_trips} trips.')

        # 6. Create Promotions
        promotion_images = [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945", # Hotel
            "https://images.unsplash.com/photo-1517841905240-472988babdf9", # Restaurant
            "https://images.unsplash.com/photo-1551882547-ff43c636ff74", # Bar
            "https://images.unsplash.com/photo-1501785888041-af3ef285b470", # Travel
            "https://images.unsplash.com/photo-1530789253388-582c481c54b0", # Activities
            "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96",
            "https://images.unsplash.com/photo-1445019980597-93fa8acb246c",
            "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"
        ]

        for i in range(num_promotions):
            selected_region = random.choice(regions_list)
            selected_country = random.choice(region_countries[selected_region])
            
            Promotion.objects.create(
                title=fake.sentence(nb_words=3),
                company=fake.company(),
                off_percent=random.randint(10, 50),
                category=random.choice(['Hotels', 'Restaurants', 'Bars', 'Travel', 'Activities']),
                region=selected_region,
                country=selected_country,
                description=fake.paragraph(),
                rating=round(random.uniform(3.5, 5.0), 1),
                image=random.choice(promotion_images),
                original_price=random.randint(50, 1000),
                currency='USD'
            )
        self.stdout.write(f'Created {num_promotions} promotions.')

        # 7. Create Conversations and Messages
        for i in range(5):
            pair = random.sample(users, 2)
            conv = Conversation.objects.create(type='dm')
            conv.members.add(*pair)
            
            for _ in range(random.randint(2, 8)):
                Message.objects.create(
                    conversation=conv,
                    sender=random.choice(pair),
                    text=fake.sentence()
                )
        self.stdout.write('Created conversations and messages.')

        self.stdout.write(self.style.SUCCESS('Successfully seeded database with fake data!'))
