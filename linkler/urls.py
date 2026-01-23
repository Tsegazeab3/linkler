"""
URL configuration for linkler project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve
from django.conf.urls.static import static # Import 'static'
# from django.contrib.staticfiles.urls import staticfiles_urlpatterns # No longer needed

from rest_framework import routers
from landing_page.views import MessageViewSet, CardViewSet # Import your ViewSet

router = routers.DefaultRouter()
router.register(r'messages', MessageViewSet) # Register your ViewSet
router.register(r'cards', CardViewSet) # Register your ViewSet

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('landing_page.urls')),
    path('api/', include(router.urls)), # Add DRF API endpoints
]

if settings.DEBUG:
    # Explicitly serve static files from BASE_DIR / 'static'
    urlpatterns += static(settings.STATIC_URL, document_root=settings.BASE_DIR / 'static')
    # The catch-all for the frontend should be last
    urlpatterns += [
        re_path(
            r'^(?:.*)/?$',
            serve,
            kwargs={
                'path': 'index.html',
                'document_root': settings.VITE_APP_BUILD_DIR,
            },
        ),
    ]

