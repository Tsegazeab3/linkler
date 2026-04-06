from django.db import models

class Promotion(models.Model):
    PROMOTION_CATEGORIES = (
        ('Hotels', 'Hotels'),
        ('Restaurants', 'Restaurants'),
        ('Bars', 'Bars'),
        ('Travel', 'Travel'),
        ('Activities', 'Activities'),
    )
    category = models.CharField(max_length=50, choices=PROMOTION_CATEGORIES, default='Travel')
    user = models.ForeignKey(
        'accounts.CustomUser', 
        on_delete=models.CASCADE, 
        related_name='promotions',
        null=True, blank=True
    )
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=100)
    image = models.ImageField(upload_to='promotions/', null=True, blank=True)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    currency = models.CharField(max_length=10, default='USD')
    off_percent = models.IntegerField()
    description = models.TextField()
    rating = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} by {self.company}"
