import os
import django
from datetime import date, timedelta
from django.core.files import File

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'linkler.settings')
django.setup()

from accounts.models import CustomUser
from posts.models import Trip

# Create or get users
users_data = [
    {'username': 'explorer_ali', 'first_name': 'Ali', 'bio': 'Desert lover and photography fan.'},
    {'username': 'nomad_nina', 'first_name': 'Nina', 'bio': 'Frequent traveler between RAK and Dubai.'},
    {'username': 'roadtrip_ryan', 'first_name': 'Ryan', 'bio': 'Let\'s share a ride and travel safe!'},
]

users = []
for data in users_data:
    user, created = CustomUser.objects.get_or_create(
        username=data['username'],
        defaults={'email': f"{data['username']}@example.com", 'first_name': data['first_name'], 'bio': data['bio']}
    )
    if created:
        user.set_password('password123')
        user.save()
    users.append(user)

# Create Trip Listings from RAK to Dubai
trips_data = [
    {
        'user': users[0],
        'origin': 'Ras Al Khaimah',
        'destination': 'Dubai',
        'destination_country': 'United Arab Emirates',
        'region': 'Middle East',
        'category': 'Adventure',
        'message': 'Heading to Dubai Mall for some shopping and sightseeing. Looking for 2 fun people to join!',
        'days_ahead': 2
    },
    {
        'user': users[1],
        'origin': 'Ras Al Khaimah',
        'destination': 'Dubai',
        'destination_country': 'United Arab Emirates',
        'region': 'Middle East',
        'category': 'Relaxing',
        'message': 'Weekly commute to Dubai. I have 3 seats available in my SUV. Very comfortable ride.',
        'days_ahead': 5
    },
    {
        'user': users[2],
        'origin': 'Ras Al Khaimah',
        'destination': 'Dubai',
        'destination_country': 'United Arab Emirates',
        'region': 'Middle East',
        'category': 'Food',
        'message': 'Going to Dubai for a weekend food tour! Starting with some authentic Mandi. Join me?',
        'days_ahead': 3
    }
]

for t in trips_data:
    Trip.objects.create(
        user=t['user'],
        origin=t['origin'],
        destination=t['destination'],
        destination_country=t['destination_country'],
        region=t['region'],
        category=t['category'],
        start_date=date.today() + timedelta(days=t['days_ahead']),
        end_date=date.today() + timedelta(days=t['days_ahead'] + 2),
        message=t['message']
    )

print(f"Successfully added {len(trips_data)} traveler listings from RAK to Dubai!")
