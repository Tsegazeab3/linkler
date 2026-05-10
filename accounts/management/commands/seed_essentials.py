import random
import os
import ujson
from django.conf import settings
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import Experience, ExperienceReview, ExperienceImage
from faker import Faker

User = get_user_model()
fake = Faker()

class Command(BaseCommand):
    help = 'Seeds the database with high-quality essential service listings'

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
        
        country_cities = [c for c in cities if c.get('country') == country_code]
        if country_cities:
            city_name = random.choice(country_cities).get('name', 'Unknown')
        else:
            city_name = fake.city()
            
        return country_name, city_name, region

    def handle(self, *args, **options):
        self.stdout.write('Seeding high-quality essentials...')
        
        countries_json, cities_json = self._load_locations()
        
        guides = User.objects.filter(account_type='guide')
        if not guides.exists():
            self.stdout.write(self.style.ERROR('No guides found. Run seed_data first.'))
            return

        # Category specific images for variety - including people/faces for human connection
        images_map = {
            'Transportation': [
                "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957", # Bus
                "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf", # Car in desert
                "https://images.unsplash.com/photo-1527239441953-caffd968d952"  # Friendly driver
            ],
            'Housing': [
                "https://images.unsplash.com/photo-1560518883-ce09059eeffa", # Showing apartment
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750", # Modern home
                "https://images.unsplash.com/photo-1484154218962-a197022b5858"  # Interior
            ],
            'Documentation': [
                "https://images.unsplash.com/photo-1521791136064-7986c2920216", # Handshake/Help
                "https://images.unsplash.com/photo-1554224155-1696413565d3", # Paperwork help
                "https://images.unsplash.com/photo-1450101499163-c8848c66ca85"  # Office
            ],
            'Connectivity': [
                "https://images.unsplash.com/photo-1512428559087-560fa5ceab42", # Person with phone
                "https://images.unsplash.com/photo-1520333789090-1afc82db536a", # Friendly tech help
                "https://images.unsplash.com/photo-1562016600-ece13e8ba570"  # Router
            ],
            'Local Support': [
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3", # Group shopping
                "https://images.unsplash.com/photo-1556740738-b6a63e27c4df", # Assistant
                "https://images.unsplash.com/photo-1552664730-d307ca884978"  # Meeting
            ]
        }

        essentials_data = [
            {'category': 'Transportation', 'title': "I'll pick you up from the Airport", 'description': "Don't worry about taxis. I'll meet you at the arrivals hall and drive you straight to your stay in a comfortable, clean car.", 'price': 65, 'duration': '1.5 hours'},
            {'category': 'Transportation', 'title': 'Private Desert Driver for your Group', 'description': "Need to go to the desert? I have a large 4x4 and I know the dunes better than anyone. Let me be your private driver for the day.", 'price': 200, 'duration': '8 hours'},
            {'category': 'Housing', 'title': "I'll find you a great apartment", 'description': "Searching for a home from abroad is hard. I will visit 5 apartments on your behalf, take videos, and give you the real truth about the area.", 'price': 150, 'duration': '2 days'},
            {'category': 'Housing', 'title': 'Move to Dubai with my help', 'description': "I've helped dozens of people relocate. From DEWA setup to finding a community that fits your vibe, I'm your relocation partner.", 'price': 450, 'duration': '1 week'},
            {'category': 'Documentation', 'title': 'Get your Golden Visa easily', 'description': "The Golden Visa process can be confusing. I'll guide you through every document you need and make sure your application is perfect.", 'price': 1200, 'duration': '30 days'},
            {'category': 'Documentation', 'title': "I'll help you with your Emirates ID", 'description': "Medical tests, biometrics, and card collection—I'll handle the appointments and go with you so you don't get lost.", 'price': 80, 'duration': '3 days'},
            {'category': 'Connectivity', 'title': "I'll set up your local SIM & Wi-Fi", 'description': "Stay connected from minute one. I'll deliver a local SIM to your door and help you set up your home internet with the best provider.", 'price': 50, 'duration': '4 hours'},
            {'category': 'Local Support', 'title': 'Personal Shopping with a Local', 'description': "Forget the tourist traps. I'll take you to the best souks and help you negotiate like a local for the best prices.", 'price': 40, 'duration': '3 hours'},
            {'category': 'Local Support', 'title': "I'll help you with local Doctors", 'description': "If you're feeling unwell, I'll help you navigate the healthcare system and find the best specialist for your needs.", 'price': 35, 'duration': '2 hours'},
            {'category': 'Local Support', 'title': 'The Real Riyadh Souk Tour', 'description': "Join me for a walk through the old markets of Riyadh. I'll introduce you to the shopkeepers and show you the hidden crafts.", 'price': 55, 'duration': '4 hours'},
            {'category': 'Connectivity', 'title': 'Stay Connected across the GCC', 'description': "Traveling between Saudi, UAE and Qatar? I'll set up a multi-country SIM plan so you never lose connection.", 'price': 90, 'duration': '2 hours'},
        ]

        # Clear existing services to clean up visuals
        Experience.objects.filter(listing_type='service').delete()

        created_count = 0
        for item in essentials_data:
            guide = random.choice(guides)
            c_name, city_name, region = self._get_random_location(countries_json, cities_json)
            
            exp = Experience.objects.create(
                user=guide,
                listing_type='service',
                category=item['category'],
                title=item['title'],
                description=item['description'],
                price=item['price'],
                duration=item['duration'],
                location=city_name,
                country=c_name,
                region=region
            )
            
            # Add specific high-quality image
            img_list = images_map.get(item['category'], ["https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"])
            ExperienceImage.objects.create(
                experience=exp,
                image=random.choice(img_list)
            )

            created_count += 1
            
            travellers = list(User.objects.filter(account_type='traveller'))
            if travellers:
                # Use sample to ensure unique users per experience
                num_reviews = min(len(travellers), random.randint(1, 3))
                reviewers = random.sample(travellers, num_reviews)
                for traveller in reviewers:
                    ExperienceReview.objects.create(
                        experience=exp,
                        user=traveller,
                        rating=random.randint(4, 5),
                        comment=fake.sentence()
                    )

        self.stdout.write(self.style.SUCCESS(f'Successfully created {created_count} visually distinct essential services.'))
