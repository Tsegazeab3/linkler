import random
import os
import ujson
import requests
from django.conf import settings
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from discovery.models import Promotion
from faker import Faker

fake = Faker()

class Command(BaseCommand):
    help = 'Seeds the database with diverse promotions for every category'

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
        if random.random() < 0.8:
            country_code = random.choice(gcc_codes)
        else:
            country_code = random.choice([c['cca2'] for c in countries])
            
        country_obj = next((c for c in countries if c['cca2'] == country_code), countries[0])
        country_name = country_obj.get('name', {}).get('common', 'Unknown')
        region = country_obj.get('region', 'Middle East')
        
        return country_name, region

    def handle(self, *args, **options):
        self.stdout.write('Seeding promotions...')
        
        countries_json, cities_json = self._load_locations()
        
        promotion_categories = [cat[0] for cat in Promotion.PROMOTION_CATEGORIES]

        deals_data = {
            'Hotels': [
                {'title': 'Luxury Beach Resort', 'company': 'Grand Sands', 'off': 25, 'desc': 'Experience paradise with our exclusive beachfront suites and world-class spa.'},
                {'title': 'Mountain View Lodge', 'company': 'Alpine Escapes', 'off': 15, 'desc': 'Wake up to breathtaking views and cozy fireplaces in the heart of the mountains.'},
                {'title': 'Urban Boutique Stay', 'company': 'City Loft', 'off': 30, 'desc': 'Stay in the center of the action with our modern, stylish boutique rooms.'},
            ],
            'Restaurants': [
                {'title': 'Italian Fine Dining', 'company': 'La Dolce Vita', 'off': 20, 'desc': 'Enjoy authentic handmade pasta and fine wines in a romantic setting.'},
                {'title': 'Sushi & Teppanyaki', 'company': 'Zen Garden', 'off': 10, 'desc': 'Experience the art of Japanese cuisine with our expert chefs and fresh ingredients.'},
                {'title': 'Farm-to-Table Experience', 'company': 'The Green Plate', 'off': 15, 'desc': 'Sustainable, seasonal ingredients prepared with passion and care.'},
            ],
            'Bars': [
                {'title': 'Craft Cocktail Night', 'company': 'The Mixologist', 'off': 20, 'desc': 'Sip on unique, handcrafted cocktails created by award-winning bartenders.'},
                {'title': 'Rooftop Lounge Experience', 'company': 'Skyline Bar', 'off': 15, 'desc': 'Enjoy stunning city views with a refreshing drink in hand.'},
                {'title': 'Local Brewery Tour & Tasting', 'company': 'Hops & Grain', 'off': 25, 'desc': 'Discover the secrets of craft brewing with a guided tour and flight of beers.'},
            ],
            'Travel': [
                {'title': 'European City Break', 'company': 'Wanderlust Travels', 'off': 40, 'desc': 'Explore the historic streets of Europe with our discounted city tour packages.'},
                {'title': 'Exotic Island Getaway', 'company': 'Paradise Tours', 'off': 20, 'desc': 'Relax on pristine white sands and swim in crystal-clear turquoise waters.'},
                {'title': 'Guided Safari Adventure', 'company': 'Wild African Safaris', 'off': 10, 'desc': 'Get up close and personal with majestic wildlife in their natural habitat.'},
            ],
            'Activities': [
                {'title': 'Guided Scuba Diving', 'company': 'Deep Blue Divers', 'off': 20, 'desc': 'Discover the vibrant underwater world with our expert diving instructors.'},
                {'title': 'Mountain Biking Expedition', 'company': 'Peak Performance', 'off': 15, 'desc': 'Tackle challenging trails and enjoy breathtaking scenery on two wheels.'},
                {'title': 'Cooking Class: Asian Fusion', 'company': 'Chef\'s Table', 'off': 30, 'desc': 'Learn to prepare delicious, modern Asian-inspired dishes from a professional chef.'},
            ],
            'Shopping': [
                {'title': 'Souk Al-Zal Experience', 'company': 'Old Riyadh Tours', 'off': 20, 'desc': 'Personal shopper for the best carpets and antiques.'},
                {'title': 'Dubai Mall VIP Access', 'company': 'Luxury Concierge', 'off': 15, 'desc': 'Exclusive lounge access and personal style consultant.'}
            ],
            'Safari': [
                {'title': 'Red Dunes Adventure', 'company': 'Desert Kings', 'off': 30, 'desc': 'Dune bashing, camel riding and a traditional dinner under the stars.'}
            ]
        }

        # Unsplash stable images
        image_pool = [
            "https://images.unsplash.com/photo-1530789253388-582c481c54b0",
            "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9",
            "https://images.unsplash.com/photo-1516483638261-f4dbaf036963",
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
            "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"
        ]

        for category, deals in deals_data.items():
            if category not in promotion_categories: continue
            for deal in deals:
                c_name, region = self._get_random_location(countries_json, cities_json)

                promotion = Promotion(
                    category=category,
                    title=deal['title'],
                    company=deal['company'],
                    off_percent=deal['off'],
                    description=deal['desc'],
                    region=region,
                    country=c_name,
                    rating=round(random.uniform(3.8, 5.0), 1),
                    image=random.choice(image_pool) + "?auto=format&fit=crop&w=800&q=80"
                )
                
                promotion.save()
                self.stdout.write(self.style.SUCCESS(f"  Created promotion: {deal['title']} in {category} ({c_name})"))

        self.stdout.write(self.style.SUCCESS('Successfully seeded promotions!'))
