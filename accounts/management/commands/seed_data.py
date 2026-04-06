import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from faker import Faker
from accounts.models import Experience, ExperienceImage, ExperienceReview, ExperienceSave, Follow
from posts.models import Post, Trip, Like, Save, Comment
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

        # 1. Create Users
        users = []
        account_types = ['traveller', 'guide', 'service']
        
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
            
            user = User.objects.create_user(
                username=username,
                email=fake.email(),
                password='password123',
                age=random.randint(18, 60),
                nationality=fake.country(),
                city=fake.city(),
                country=fake.country(),
                account_type=random.choice(account_types),
                bio=fake.text(max_nb_chars=80),
                phone_no=fake.phone_number()
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
                exp = Experience.objects.create(
                    user=guide,
                    title=fake.sentence(nb_words=4),
                    description=fake.paragraph(),
                    price=random.randint(10, 500),
                    currency='USD',
                    location=f"{fake.city()}, {fake.country()}",
                    duration=f"{random.randint(1, 8)} hours",
                    category=random.choice(['Tours', 'Food', 'Nature', 'Culture'])
                )
                
                # Add reviews
                travellers = [u for u in users if u != guide]
                for traveller in random.sample(travellers, min(len(travellers), random.randint(1, 3))):
                    ExperienceReview.objects.create(
                        experience=exp,
                        user=traveller,
                        rating=random.randint(3, 5),
                        comment=fake.sentence()
                    )
            self.stdout.write(f'Created {num_users} experiences with reviews.')

        # 4. Create Posts
        for i in range(num_posts):
            author = random.choice(users)
            post = Post.objects.create(
                user=author,
                caption=fake.paragraph(),
                status='published',
                audience='public',
                allow_comments=True
            )
            
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
            Trip.objects.create(
                user=user,
                origin=fake.city(),
                destination=fake.city(),
                start_date=timezone.now().date() + timezone.timedelta(days=random.randint(1, 30)),
                end_date=timezone.now().date() + timezone.timedelta(days=random.randint(31, 60)),
                message=fake.sentence()
            )
        self.stdout.write(f'Created {num_trips} trips.')

        # 6. Create Promotions
        for i in range(num_promotions):
            Promotion.objects.create(
                title=fake.sentence(nb_words=3),
                company=fake.company(),
                off_percent=random.randint(10, 50),
                description=fake.text(),
                rating=round(random.uniform(3.5, 5.0), 1)
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
