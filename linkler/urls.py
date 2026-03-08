"""
URL configuration for linkler project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.http import HttpResponse
from django.conf.urls.static import static
from django.views.static import serve
from .media_server import serve_media

def serve_react_app(request):
    try:
        with open(settings.FRONTEND_BUILD_DIR / 'index.html') as f:
            return HttpResponse(f.read())
    except FileNotFoundError:
        return HttpResponse(
            """
            React app not found.
            Build the React app in frontend/app/dist/ and ensure it contains index.html.
            """,
            status=500,
        )

urlpatterns = [
    # High priority: Media serving via standard serve view
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    
    # Core Admin
    path('admin/', admin.site.urls),
    
    # API Routes
    path('api/accounts/', include('accounts.urls')),
    path('api/posts/', include('posts.urls')),
    path('api/promotions/', include('discovery.urls')),
    path('api/chat/', include('chat.urls')),
    
    # Authentication
    path('accounts/', include('allauth.urls')),
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    
    # React App Catch-alls
    path('complete-profile/', serve_react_app, name='profile_completion_app'),
    path('', serve_react_app, name='react_app'), 
]

# Static files serving for Development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static('/assets/', document_root=settings.FRONTEND_BUILD_DIR / 'assets')
    urlpatterns += static(settings.STATIC_URL, document_root=settings.FRONTEND_BUILD_DIR)
