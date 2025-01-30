from django.urls import path
from .views import LoginView, LogoutView, CSRFTokenView

urlpatterns = [
    path("api/login/", LoginView.as_view(), name="api_login"),
    path("api/logout/", LogoutView.as_view(), name="api_logout"),
    path("api/csrf/", CSRFTokenView.as_view(), name="api_csrf"),  # Endpoint untuk mengambil CSRF token
]
