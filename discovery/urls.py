from django.urls import path
from .views import PromotionListCreateView, PromotionDetailView, PromotionCategoryListView, PromotionRegionListView

urlpatterns = [
    path('', PromotionListCreateView.as_view(), name='promotion-list'),
    path('categories/', PromotionCategoryListView.as_view(), name='promotion-categories'),
    path('regions/', PromotionRegionListView.as_view(), name='promotion-regions'),
    path('<int:pk>/', PromotionDetailView.as_view(), name='promotion-detail'),
]
