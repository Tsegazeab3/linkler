from django.core.management.base import BaseCommand
from accounts.models import TravelerProfile

class Command(BaseCommand):
    help = 'Clears all traveler profiles to allow JSONField migration'

    def handle(self, *args, **options):
        TravelerProfile.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Successfully cleared all traveler profiles'))
