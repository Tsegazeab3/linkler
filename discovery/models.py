from django.db import models

class Promotion(models.Model):
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=100)
    image = models.ImageField(upload_to='promotions/', null=True, blank=True)
    off_percent = models.IntegerField()
    description = models.TextField()
    rating = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} by {self.company}"
