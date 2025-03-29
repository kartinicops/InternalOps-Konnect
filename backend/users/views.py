from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import HttpResponse

from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework import viewsets
from .models import Users
from .serializers import UsersSerializer
from django.utils.decorators import method_decorator
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required, user_passes_test

def users(request): #function for testing purpose
    return HttpResponse("Hello world!");

# Define the check for 'is_staff'
def staff_required(user):
    return user.is_staff

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        next_url = request.data.get("next", "/")  # Default to home if 'next' is not provided

        if not email or not password:
            return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=email, password=password)
        if user:
            login(request, user)  # Django creates a session for the user
            # Return is_staff along with other login data
            return Response({
                "message": "Login successful",
                "next": next_url,
                "is_staff": user.is_staff  # Send is_staff status back in the response
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        next_url = request.data.get("next", "/")  # Default to home if 'next' is not provided

        if not email or not password:
            return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=email, password=password)
        if user:
            login(request, user)  # Django creates a session for the user
            return Response({"message": "Login successful", "next": next_url}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)

@method_decorator(login_required, name='dispatch')  # Apply @login_required
@method_decorator(user_passes_test(staff_required), name='dispatch')  # Apply @user_passes_test

class UserViewSet(viewsets.ModelViewSet): #being a subclass of viewsets.ModelViewSet enable GET, POST, PUT, PATCH, DELETE
    # Specify the queryset to retrieve objects
    queryset = Users.objects.all()
    # Specify which serializer to use
    serializer_class = UsersSerializer
    #http_method_names = ['get', 'post', 'patch']  # Allow only GET, POST, and PATCH
    permission_classes = [AllowAny]


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)

# Endpoint untuk mengirimkan CSRF token ke frontend
@method_decorator(ensure_csrf_cookie, name="dispatch")
class CSRFTokenView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"message": "CSRF cookie set"})