import random
import os
import ujson
from django.conf import settings
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

    def _load_locations(self):
        countries_path = os.path.join(settings.BASE_DIR, 'discovery/data/countries_full.json')
        cities_path = os.path.join(settings.BASE_DIR, 'discovery/data/cities.json')
        
        with open(countries_path, 'r') as f:
            countries = ujson.load(f)
        with open(cities_path, 'r') as f:
            cities = ujson.load(f)
            
        return countries, cities

    def _get_random_location(self, countries, cities):
        gcc_codes = ['SA', 'AE', 'QA', 'OM', 'BH', 'KW']
        
        # 80% chance of GCC
        if random.random() < 0.8:
            country_code = random.choice(gcc_codes)
        else:
            country_code = random.choice([c['cca2'] for c in countries])
            
        country_obj = next((c for c in countries if c['cca2'] == country_code), countries[0])
        country_name = country_obj.get('name', {}).get('common', 'Unknown')
        region = country_obj.get('region', 'Middle East')
        
        # Filter cities for this country
        country_cities = [c for c in cities if c.get('country') == country_code]
        if country_cities:
            city_obj = random.choice(country_cities)
            city_name = city_obj.get('name', 'Unknown')
        else:
            city_name = fake.city()
            
        return country_name, city_name, region, country_code

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

        countries_json, cities_json = self._load_locations()

        # Category Lists from Models
        experience_categories = [cat[0] for cat in Experience.EXPERIENCE_CATEGORIES]
        trip_categories = [cat[0] for cat in Trip.TRIP_CATEGORIES]
        promotion_categories = [cat[0] for cat in Promotion.PROMOTION_CATEGORIES]

        # Professional images sets
        experience_images = [
            "https://images.unsplash.com/photo-1530789253388-582c481c54b0",
            "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9",
            "https://images.unsplash.com/photo-1516483638261-f4dbaf036963",
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
            "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"
        ]

        # 1. Create Users
        users = []
        account_types = ['traveller', 'guide']
        
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
            
            c_name, city_name, region, c_code = self._get_random_location(countries_json, cities_json)
            
            user = User.objects.create_user(
                username=username,
                email=fake.email(),
                password='password123',
                age=random.randint(18, 60),
                nationality=c_name,
                city=city_name,
                country=c_name,
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

        # 3. Create Experiences (only for guides)
        guides = [u for u in users if u.account_type == 'guide']
        if guides:
            for i in range(num_users):
                guide = random.choice(guides)
                c_name, city_name, region, c_code = self._get_random_location(countries_json, cities_json)
                
                exp = Experience.objects.create(
                    user=guide,
                    listing_type=random.choice(['experience', 'service']),
                    title=fake.sentence(nb_words=4),
                    description=fake.paragraph(),
                    price=random.randint(10, 500),
                    currency='USD',
                    location=city_name,
                    country=c_name,
                    region=region,
                    duration=f"{random.randint(1, 8)} hours",
                    category=random.choice(experience_categories)
                )

                ExperienceImage.objects.create(
                    experience=exp,
                    image=random.choice(experience_images)
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
            "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1504109586057-7a2ae83d1338?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1517154421773-0529f29ea451?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
        ]

        for i in range(num_posts):
            author = random.choice(users)
            caption = random.choice(travel_captions)
            
            c_name, city_name, region, c_code = self._get_random_location(countries_json, cities_json)
            
            # Decide if it's text-only, single image, or multiple images
            post_type = random.choice(['text', 'single', 'multiple'])
            
            if post_type == 'text':
                post = Post.objects.create(
                    user=author,
                    caption=caption,
                    country=c_name,
                    region=region,
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
                    country=c_name,
                    region=region,
                    status='published',
                    audience='public',
                    allow_comments=True
                )
            else:
                post = Post.objects.create(
                    user=author,
                    caption=caption,
                    media_type='image',
                    country=c_name,
                    region=region,
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
            c_name_origin, city_name_origin, region_origin, c_code_origin = self._get_random_location(countries_json, cities_json)
            c_name_dest, city_name_dest, region_dest, c_code_dest = self._get_random_location(countries_json, cities_json)
            
            Trip.objects.create(
                user=user,
                origin=city_name_origin,
                destination=city_name_dest,
                destination_country=c_name_dest,
                region=region_dest,
                category=random.choice(trip_categories),
                start_date=timezone.now().date() + timezone.timedelta(days=random.randint(1, 30)),
                end_date=timezone.now().date() + timezone.timedelta(days=random.randint(31, 60)),
                message=fake.sentence()
            )
        self.stdout.write(f'Created {num_trips} trips.')

        # 6. Create Promotions
        promotion_images = [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945", # Hotel
            "https://images.unsplash.com/photo-1517841905240-472988babdf9", # Restaurant
            "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b", # Bar
            "https://images.unsplash.com/photo-1501785888041-af3ef285b470", # Travel
            "https://images.unsplash.com/photo-1530789253388-582c481c54b0", # Activities
            "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96",
            "https://images.unsplash.com/photo-1445019980597-93fa8acb246c",
            "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"
        ]

        for i in range(num_promotions):
            c_name, city_name, region, c_code = self._get_random_location(countries_json, cities_json)
            
            promo = Promotion.objects.create(
                title=fake.company() + " Special Offer",
                company=fake.company(),
                category=random.choice(promotion_categories),
                country=c_name,
                region=region,
                off_percent=random.randint(10, 50),
                original_price=random.randint(100, 1000),
                currency='USD',
                description=fake.paragraph(),
                rating=random.uniform(3.5, 5.0),
                image=random.choice(promotion_images)
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
