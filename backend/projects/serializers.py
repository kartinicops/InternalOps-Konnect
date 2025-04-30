import os
from rest_framework import serializers
from .models import Projects
from .models import Client_companies
from .models import Client_members
from .models import geographies
from .models import companiesOfInterest
from .models import Project_files
from .models import Client_teams
from .models import Project_pipelines
from .models import Project_published
from .models import Project_with_experts
from .models import Published_statuses
from .models import Questions
from .models import Answers


#serializers pack and unpack data into JSON
class ProjectsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Projects
        fields = ["project_id", "project_name", "user_id", "status", "client_company_id", "geography_id", "timeline_start", "timeline_end", "expected_calls", "completed_calls", "client_requirements", "created_at"]        
        
class ProjectPipelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project_pipelines
        fields = ["project_pipeline_id", "expert_id", "project_id", "user_id", "created_at"]   
        
class QuestionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Questions
        fields = ["question_id", "project_id", "question"]

class AnswersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answers
        fields = ["answer_id", "question_id", "expert_id", "answer"]
     
class ProjectExpertsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project_with_experts
        fields = ["project_with_experts_id", "project_id", "expert_id", "biograph"]


class ProjectPublishedSerializer(serializers.ModelSerializer):
    #to format date time into desired template
    expert_availability = serializers.DateTimeField(
    format="%A, %d %B %Y at %I %p (Jakarta time)"
)

    class Meta:
        model = Project_published
        fields = ["project_publish_id", "expert_id", "project_id", "user_id", "status_id", "expert_availability", "angles", "created_at"]
class PublishedStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Published_statuses
        fields = ["status_id", "status_name"]
class ClientCompaniesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client_companies
        fields = ["client_company_id", "company_name"]

class ClientMembersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client_members
        fields = ["client_member_id", "client_company_id", "client_name", "client_email", "phone_number"]

class ClientTeamsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client_teams
        fields = ["client_team_id", "client_member_id", "project_id"]

class GeographiesSerializer(serializers.ModelSerializer):
    class Meta:
        model = geographies
        fields = ["geography_id", "country", "city", "timezone"]

class CompaniesOfInterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = companiesOfInterest
        fields = ["company_of_interest_id", "project_id", "company_name", "is_past", "is_current"]

class ProjectFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project_files
        fields = '__all__'

    #validate uploaded file extension
    def validate_file_type(self, value):
        allowed_types = ['pdf', 'excel', 'word']
        if value not in allowed_types:
            raise serializers.ValidationError("File type must be either PDF, Excel, or Word.")
        return value
    
    def validate_file_path(self, value):
        ext = os.path.splitext(value.name)[1].lower()
        allowed_extensions = ['.pdf', '.xlsx', '.xls', '.docx', '.doc']
        if ext not in allowed_extensions:
            raise serializers.ValidationError("Only PDF, Excel, or Word documents are allowed.")
        return value