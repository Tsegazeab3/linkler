from django.db import models

class GuideInterest(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    nationality = models.CharField(max_length=100, blank=True, null=True) # New field
    message = models.TextField(blank=True, null=True)
    registered_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.email}"