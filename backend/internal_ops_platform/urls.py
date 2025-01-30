"""
URL configuration for internal_ops_platform project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
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
from rest_framework import routers, serializers, viewsets
from users import urls as users_urls
from experts import urls as experts_urls
from projects import urls as projects_urls
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', include('users.urls')), #route to urls.py in users app
    path('', include('experts.urls')), #route to urls.py in experts app
    path('', include('projects.urls')), #route to urls.py in projects app
    #path('api/login/', auth_views.LoginView.as_view(), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('api-auth/', include('rest_framework.urls')),
    path("admin/", admin.site.urls), #super admin page to help input data
]
