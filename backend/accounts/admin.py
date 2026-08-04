from django.contrib import admin
from .models import CustomUser, Experience, Booking, Notification, TravelerProfile, VerificationDocument

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'account_type', 'verification_status', 'onboarding_completed')
    list_filter = ('account_type', 'verification_status', 'onboarding_completed')
    search_fields = ('username', 'email')

@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'price', 'currency', 'created_at')
    search_fields = ('title', 'user__username')

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'provider', 'booking_date', 'status', 'price')
    list_filter = ('status', 'booking_date')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'title', 'is_read', 'created_at')
    list_filter = ('type', 'is_read')

@admin.register(TravelerProfile)
class TravelerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'job_industry', 'budget_range', 'created_at')

@admin.register(VerificationDocument)
class VerificationDocumentAdmin(admin.ModelAdmin):
    list_display = ('user', 'document_type', 'uploaded_at')
