from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db import models
from django.conf import settings
from .models import Promotion, PromotionImage
from .serializers import PromotionSerializer
import os
import ujson

# Global cache for location data
_LOCATION_CACHE = {
    'countries': None,
    'cities': None
}

def load_location_data():
    if _LOCATION_CACHE['countries'] is None:
        try:
            countries_path = os.path.join(settings.BASE_DIR, 'discovery/data/countries_full.json')
            with open(countries_path, 'r') as f:
                _LOCATION_CACHE['countries'] = ujson.load(f)
        except Exception as e:
            print(f"Error loading countries: {e}")
            _LOCATION_CACHE['countries'] = []

    if _LOCATION_CACHE['cities'] is None:
        try:
            cities_path = os.path.join(settings.BASE_DIR, 'discovery/data/cities.json')
            with open(cities_path, 'r') as f:
                _LOCATION_CACHE['cities'] = ujson.load(f)
        except Exception as e:
            print(f"Error loading cities: {e}")
            _LOCATION_CACHE['cities'] = []

class LocationSearchView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '').lower()
        if not query or len(query) < 2:
            return Response([])

        load_location_data()
        
        results = []
        gcc_countries = ['SA', 'AE', 'QA', 'OM', 'BH', 'KW']
        
        # Mapping from JSON region/subregion to our REGION_CHOICES
        def map_region(country_obj):
            subregion = country_obj.get('subregion', '')
            region = country_obj.get('region', '')
            cca2 = country_obj.get('cca2', '')
            
            if cca2 in gcc_countries or subregion in ['Western Asia', 'Northern Africa']:
                # Heuristic for Middle East in this context
                # You might want to refine this list
                me_countries = ['SA', 'AE', 'QA', 'OM', 'BH', 'KW', 'JO', 'LB', 'EG', 'IQ', 'IR', 'IL', 'PS', 'SY', 'YE']
                if cca2 in me_countries:
                    return 'Middle East'
            
            if region == 'Americas':
                if subregion in ['North America', 'Northern America']: return 'North America'
                return 'South America'
            
            if region in ['Africa', 'Asia', 'Europe', 'Oceania']:
                return region
                
            return 'Middle East' if cca2 in gcc_countries else 'Europe'

        # Create a mapping for quick country name/region lookup
        country_info_map = {
            c['cca2']: {
                'name': c.get('name', {}).get('common', 'Unknown'),
                'region': map_region(c)
            } for c in _LOCATION_CACHE['countries']
        }
        
        # 1. Search Countries
        for country in _LOCATION_CACHE['countries']:
            name = country.get('name', {}).get('common', '')
            cca2 = country.get('cca2', '')
            if query in name.lower() or query in cca2.lower():
                mapped_reg = country_info_map.get(cca2, {}).get('region', 'Europe')
                results.append({
                    'type': 'country',
                    'name': name,
                    'code': cca2,
                    'region': mapped_reg,
                    'is_gcc': cca2 in gcc_countries,
                    'priority': 100 if cca2 in gcc_countries else 50
                })

        # 2. Search Cities
        city_count = 0
        for city in _LOCATION_CACHE['cities']:
            if city_count >= 50:
                break
            city_name = city.get('name', '')
            if query in city_name.lower():
                country_code = city.get('country', '')
                info = country_info_map.get(country_code, {'name': country_code, 'region': 'Europe'})
                results.append({
                    'type': 'city',
                    'name': f"{city_name}, {info['name']}",
                    'city': city_name,
                    'country_code': country_code,
                    'country_name': info['name'],
                    'region': info['region'],
                    'is_gcc': country_code in gcc_countries,
                    'priority': 80 if country_code in gcc_countries else 30
                })
                city_count += 1

        results.sort(key=lambda x: (-x['priority'], x['name']))
        return Response(results[:50])

class PromotionListCreateView(generics.ListCreateAPIView):
    serializer_class = PromotionSerializer

    def perform_create(self, serializer):
        images_data = self.request.FILES.getlist('images')
        promotion = serializer.save(user=self.request.user)
        for image_data in images_data:
            PromotionImage.objects.create(promotion=promotion, image=image_data)

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
