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

        # Category specific images for variety
        images_map = {
            'Transportation': [
                "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d",
                "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957",
                "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96"
            ],
            'Housing': [
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
                "https://images.unsplash.com/photo-1484154218962-a197022b5858"
            ],
            'Documentation': [
                "https://images.unsplash.com/photo-1568043210943-0e8aac4b9734",
                "https://images.unsplash.com/photo-1554224155-1696413565d3",
                "https://images.unsplash.com/photo-1450101499163-c8848c66ca85"
            ],
            'Connectivity': [
                "https://images.unsplash.com/photo-1562016600-ece13e8ba570",
                "https://images.unsplash.com/photo-1512428559087-560fa5ceab42",
                "https://images.unsplash.com/photo-1530789253388-582c481c54b0"
            ],
            'Local Support': [
                "https://images.unsplash.com/photo-1556740738-b6a63e27c4df",
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
                "https://images.unsplash.com/photo-1552664730-d307ca884978"
            ]
        }

        essentials_data = [
            {'category': 'Transportation', 'title': 'Premium Airport Transfer', 'description': 'Stress-free pickup from DXB or DWC in a luxury sedan.', 'price': 65, 'duration': '1.5 hours'},
            {'category': 'Transportation', 'title': 'Private Desert Chauffeur', 'description': 'Full day private driver for your desert exploration.', 'price': 200, 'duration': '8 hours'},
            {'category': 'Housing', 'title': 'Short-term Apartment Scouting', 'description': 'I will visit 5 apartments on your behalf.', 'price': 150, 'duration': '2 days'},
            {'category': 'Housing', 'title': 'Relocation Consultant', 'description': 'Complete support for finding a home.', 'price': 450, 'duration': '1 week'},
            {'category': 'Documentation', 'title': 'Golden Visa Assistance', 'description': 'Expert guidance through the UAE Golden Visa application.', 'price': 1200, 'duration': '30 days'},
            {'category': 'Documentation', 'title': 'Emirates ID Fast-Track', 'description': 'I will manage your medical test and biometrics.', 'price': 80, 'duration': '3 days'},
            {'category': 'Connectivity', 'title': 'Local Tech Setup', 'description': 'Get connected instantly with a SIM card.', 'price': 50, 'duration': '4 hours'},
            {'category': 'Local Support', 'title': 'Personal Shopping Assistant', 'description': 'Expert guidance through the best souks.', 'price': 40, 'duration': '3 hours'},
            {'category': 'Local Support', 'title': 'Medical System Navigator', 'description': 'Assistance with hospital appointments.', 'price': 35, 'duration': '2 hours'},
            {'category': 'Local Support', 'title': 'Souk Exploration Expert', 'description': 'Navigating the old markets of Riyadh.', 'price': 55, 'duration': '4 hours'},
            {'category': 'Connectivity', 'title': 'GCC Multi-SIM Setup', 'description': 'Connectivity across Saudi, UAE and Qatar.', 'price': 90, 'duration': '2 hours'},
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
