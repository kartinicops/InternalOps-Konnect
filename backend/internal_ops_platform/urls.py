from django.contrib import admin
from django.urls import path, include
from rest_framework import routers, serializers, viewsets
from users import urls as users_urls
from experts import urls as experts_urls
from projects import urls as projects_urls
from django.contrib.auth import views as auth_views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', include('users.urls')),  # route to urls.py in users app
    path('', include('experts.urls')),  # route to urls.py in experts app
    path('', include('projects.urls')),  # route to urls.py in projects app
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('api-auth/', include('rest_framework.urls')),
    path("admin/", admin.site.urls),  # super admin page to help input data
]

# Add this to serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)