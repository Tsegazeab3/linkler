from django.urls import path
from .views import PromotionListCreateView, PromotionDetailView

urlpatterns = [
    path('', PromotionListCreateView.as_view(), name='promotion-list'),
    path('<int:pk>/', PromotionDetailView.as_view(), name='promotion-detail'),
]
