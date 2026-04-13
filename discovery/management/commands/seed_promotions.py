import random
import requests
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from discovery.models import Promotion
from faker import Faker

fake = Faker()

class Command(BaseCommand):
    help = 'Seeds the database with diverse promotions for every category'

    def handle(self, *args, **options):
        self.stdout.write('Seeding promotions...')
        
        categories = ['Hotels', 'Restaurants', 'Bars', 'Travel', 'Activities']
        
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
            ]
        }

        # Unsplash random image URLs based on keywords
        image_keywords = {
            'Hotels': 'hotel,resort,luxury-stay',
            'Restaurants': 'restaurant,food,gourmet',
            'Bars': 'bar,cocktail,nightlife',
            'Travel': 'travel,airplane,passport',
            'Activities': 'adventure,hiking,diving'
        }

        for category, deals in deals_data.items():
            for deal in deals:
                random_id = random.randint(1, 1000)
                image_url = f"https://source.unsplash.com/featured/800x600?{image_keywords[category]}&sig={random_id}"
                
                selected_region = random.choice(regions_list)
                selected_country = random.choice(region_countries[selected_region])

                promotion = Promotion(
                    category=category,
                    title=deal['title'],
                    company=deal['company'],
                    off_percent=deal['off'],
                    description=deal['desc'],
                    region=selected_region,
                    country=selected_country,
                    rating=round(random.uniform(3.8, 5.0), 1)
                )

                # Try to download and save the image
                try:
                    response = requests.get(image_url, timeout=10)
                    if response.status_code == 200:
                        file_name = f"{category.lower()}_{random_id}.jpg"
                        promotion.image.save(file_name, ContentFile(response.content), save=False)
                        self.stdout.write(f"  Saved image for {deal['title']}")
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"  Could not download image for {deal['title']}: {e}"))
                
                promotion.save()
                self.stdout.write(self.style.SUCCESS(f"  Created promotion: {deal['title']} in {category} ({selected_country})"))

        self.stdout.write(self.style.SUCCESS('Successfully seeded promotions!'))
