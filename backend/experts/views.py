from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from .models import Experts
from .models import ExpertExperiences
from .serializers import ExpertsSerializer
from .serializers import ExperiencesSerializer
from rest_framework import viewsets

# Create your views here.
def experts(request):
    return HttpResponse("Hello world!");

class ExpertViewSet(viewsets.ModelViewSet): #being a subclass of viewsets.ModelViewSet enable GET, POST, PUT, PATCH, DELETE
    # Specify the queryset to retrieve objects
    queryset = Experts.objects.all()
    # Specify which serializer to use
    serializer_class = ExpertsSerializer
    #http_method_names = ['get', 'post', 'patch']  # Allow only GET, POST, and PATCH

class ExperienceViewSet(viewsets.ModelViewSet): #being a subclass of viewsets.ModelViewSet enable GET, POST, PUT, PATCH, DELETE
    # Specify the queryset to retrieve objects
    queryset = ExpertExperiences.objects.all()
    # Specify which serializer to use
    serializer_class = ExperiencesSerializer
    #http_method_names = ['get', 'post', 'patch']  # limitation to allow only GET, POST, and PATCH