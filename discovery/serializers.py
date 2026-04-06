from rest_framework import serializers
from .models import Promotion

class PromotionSerializer(serializers.ModelSerializer):
    discounted_price = serializers.SerializerMethodField()
    creator_username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Promotion
        fields = [
            'id', 'user', 'creator_username', 'category', 'title', 'company', 
            'image', 'original_price', 'currency', 'off_percent', 
            'discounted_price', 'description', 'rating', 'created_at'
        ]
        read_only_fields = ('user',)

    def get_discounted_price(self, obj):
        if obj.original_price and obj.off_percent:
            discount = (obj.original_price * obj.off_percent) / 100
            return round(obj.original_price - discount, 2)
        return obj.original_price
