from rest_framework import generics
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

        if search_query:
            queryset = queryset.filter(
                models.Q(title__icontains=search_query) |
                models.Q(company__icontains=search_query) |
                models.Q(description__icontains=search_query)
            )

        if category:
            queryset = queryset.filter(category__icontains=category)
            
        return queryset

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

class PromotionDetailView(generics.RetrieveAPIView):
    queryset = Promotion.objects.all()
    serializer_class = PromotionSerializer
    permission_classes = [AllowAny]
