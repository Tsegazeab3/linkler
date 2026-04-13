from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Promotion
from .serializers import PromotionSerializer

class PromotionListCreateView(generics.ListCreateAPIView):
    serializer_class = PromotionSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        queryset = Promotion.objects.all()
        search_query = self.request.query_params.get('search', '')
        category = self.request.query_params.get('category', '')
        region = self.request.query_params.get('region', '')
        country = self.request.query_params.get('country', '')

        if search_query:
            queryset = queryset.filter(
                models.Q(title__icontains=search_query) |
                models.Q(company__icontains=search_query) |
                models.Q(description__icontains=search_query) |
                models.Q(country__icontains=search_query)
            )

        if category:
            queryset = queryset.filter(category=category)
        if region:
            queryset = queryset.filter(region=region)
        if country:
            queryset = queryset.filter(country__icontains=country)
            
        return queryset

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

class PromotionDetailView(generics.RetrieveAPIView):
    queryset = Promotion.objects.all()
    serializer_class = PromotionSerializer
    permission_classes = [AllowAny]

class PromotionCategoryListView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    def get(self, request):
        categories = [cat[0] for cat in Promotion.PROMOTION_CATEGORIES]
        return Response(categories)

class PromotionRegionListView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    def get(self, request):
        regions = [reg[0] for reg in Promotion.REGION_CHOICES]
        return Response(regions)
