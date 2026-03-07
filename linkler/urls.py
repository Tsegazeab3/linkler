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
from django.urls import path, include
from django.conf import settings
from django.http import HttpResponse
from django.views.static import serve
from django.conf.urls.static import static # Import 'static'

def serve_react_app(request):
    try:
        with open(settings.LANDING_PAGE_BUILD_DIR / 'index.html') as f:
            return HttpResponse(f.read())
    except FileNotFoundError:
        return HttpResponse(
            """
            React app not found.
            Build the React app in frontend/LandingPage/dist/ and ensure it contains index.html.
            """,
            status=500,
        )

def serve_profile_completion_app(request):
    try:
        with open(settings.PROFILE_COMPLETION_PAGE_BUILD_DIR / 'index.html') as f:
            return HttpResponse(f.read())
    except FileNotFoundError:
        return HttpResponse(
            """
            React app not found.
            Build the React app in frontend/profile_completion_page/dist/ and ensure it contains index.html.
            """,
            status=500,
        )

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')),
    path('api/accounts/', include('accounts.urls')),
    path('api/posts/', include('posts.urls')),
    path('api/promotions/', include('discovery.urls')),
    path('api/chat/', include('chat.urls')),
    # dj-rest-auth URLs
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('complete-profile/', serve_profile_completion_app, name='profile_completion_app'),
    path('', serve_react_app, name='react_app'), # Serve React app at root
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    # Serve React app's assets from /assets/
    urlpatterns += static('/assets/', document_root=settings.LANDING_PAGE_BUILD_DIR / 'assets')
    # Serve other static files that might be directly in the build root (e.g., /static/vite.svg)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.LANDING_PAGE_BUILD_DIR)
    # Serve profile completion app's assets from /assets/
    urlpatterns += static('/assets/', document_root=settings.PROFILE_COMPLETION_PAGE_BUILD_DIR / 'assets')

