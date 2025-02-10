from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from .models import Projects
from .models import Client_companies
from .models import geographies
from .models import Project_files
from .models import Client_members
from .models import Client_teams
from .serializers import ProjectsSerializer
from .serializers import ClientCompaniesSerializer
from .serializers import GeographiesSerializer
from .serializers import ProjectFileSerializer
from rest_framework import viewsets
from .serializers import ClientMembersSerializer
from .serializers import ClientTeamsSerializer
from .models import Project_pipelines
from .models import Project_published
from .serializers import ProjectPipelineSerializer
from .serializers import ProjectPublishedSerializer
from .models import Project_with_experts
from .serializers import ProjectExpertsSerializer


# Create your views here.
class ProjectViewSet(viewsets.ModelViewSet): #being a subclass of viewsets.ModelViewSet enable GET, POST, PUT, PATCH, DELETE
    # Specify the queryset to retrieve objects
    queryset = Projects.objects.all()
    # Specify which serializer to use
    serializer_class = ProjectsSerializer
    #http_method_names = ['get', 'post', 'patch']  # Allow only GET, POST, and PATCH

class ClientCompaniesViewSet(viewsets.ModelViewSet): #GET, POST, PUT, PATCH, DELETE
    # Specify the queryset to retrieve objects
    queryset = Client_companies.objects.all()
    # Specify which serializer to use
    serializer_class = ClientCompaniesSerializer

class ClientMembersViewSet(viewsets.ModelViewSet): #GET, POST, PUT, PATCH, DELETE
    # Specify the queryset to retrieve objects
    queryset = Client_members.objects.all()
    # Specify which serializer to use
    serializer_class = ClientMembersSerializer

class ClientTeamsViewSet(viewsets.ModelViewSet): #GET, POST, PUT, PATCH, DELETE
    # Specify the queryset to retrieve objects
    queryset = Client_teams.objects.all()
    # Specify which serializer to use
    serializer_class = ClientTeamsSerializer

class GeographiesViewSet(viewsets.ModelViewSet): #GET, POST, PUT, PATCH, DELETE
    # Specify the queryset to retrieve objects
    queryset = geographies.objects.all()
    # Specify which serializer to use
    serializer_class = GeographiesSerializer
    #http_method_names = ['get', 'post', 'patch']  # limitation to allow only GET, POST, and PATCH

class ProjectFilesViewSet(viewsets.ModelViewSet): #GET, POST, PUT, PATCH, DELETE
    # Specify the queryset to retrieve objects
    queryset = Project_files.objects.all()
    # Specify which serializer to use
    serializer_class = ProjectFileSerializer
    
class ProjectPipelinesViewSet(viewsets.ModelViewSet): #GET, POST, PUT, PATCH, DELETE
    # Specify the queryset to retrieve objects
    queryset = Project_pipelines.objects.all()
    # Specify which serializer to use
    serializer_class = ProjectPipelineSerializer
class ProjectPublishedViewSet(viewsets.ModelViewSet): #GET, POST, PUT, PATCH, DELETE
    # Specify the queryset to retrieve objects
    queryset = Project_published.objects.all()
    # Specify which serializer to use
    serializer_class = ProjectPublishedSerializer
    
class ProjectExpertsViewSet(viewsets.ModelViewSet): #GET, POST, PUT, PATCH, DELETE
    # Specify the queryset to retrieve objects
    queryset = Project_with_experts.objects.all()
    # Specify which serializer to use
    serializer_class = ProjectExpertsSerializer