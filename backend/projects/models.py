from django.db import models
from users.models import Users
from experts.models import Experts
import os
import re
from django.core.exceptions import ValidationError

def validate_phone_number(value):
    # Simple regex for basic phone number validation
    if not re.match(r'^\+?\d{7,15}$', value):
        raise ValidationError("Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")

# Create your models here.
class Client_companies(models.Model):
    client_company_id = models.AutoField(primary_key=True, null=False)
    company_name = models.CharField(max_length=150, null=False)    
    
    class Meta:
        db_table = "client_companies"

class Client_members(models.Model):
    client_member_id = models.AutoField(primary_key=True, null=False)
    client_company_id = models.ForeignKey(Client_companies,on_delete=models.CASCADE, null=True, related_name="client_member")
    client_name = models.CharField(max_length=150, null=False)    
    client_email = models.EmailField(unique=True, null=False)
    phone_number = models.CharField(max_length=15, validators=[validate_phone_number], null=True, blank=True) #optional
    
    class Meta:
        db_table = "client_members"

class geographies(models.Model):
    geography_id = models.AutoField(primary_key=True, null=False)
    country = models.CharField(max_length=100, null=False)    
    city = models.CharField(max_length=100, null=False)
    timezone = models.CharField(max_length=100, null=False)
    
    class Meta:
        db_table = "geographies"

class Projects(models.Model):
    project_id = models.AutoField(primary_key=True, null=False)
    project_name = models.CharField(max_length=255, null=False)
    #if user|PIC is deleted, the value will be null. Can be called from users through related_name
    user_id = models.ForeignKey(Users,on_delete=models.SET_NULL, null=True, related_name="projects") 
    status = models.BooleanField(default=False) #false or 0 is for active, 1 is for closed
    client_company_id = models.ForeignKey(Client_companies,on_delete=models.SET_NULL, null=True, related_name="projects")
    geography_id = models.ForeignKey(geographies,on_delete=models.SET_NULL, null=True, related_name="projects")
    timeline_start = models.DateField(null=False) 
    timeline_end = models.DateField(null=False)
    expected_calls = models.IntegerField(null=False)
    completed_calls = models.IntegerField(null=False, default=0)
    # general_screening_questions = models.TextField(null=True)
    client_requirements = models.TextField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)  # This will automatically store the creation timestamp

    class Meta:
        db_table = "projects"
    
    def save(self, *args, **kwargs):
        super(Projects, self).save(*args, **kwargs)

    def __str__(self):
        # Return the date as MM-YYYY or "present" if null
        start_display = self.timeline_start.strftime('%d-%m-%Y')
        end_display = self.timeline_end.strftime('%d-%m-%Y') 
        #return f"{start_display} to {end_display}"
        return f"{self.project_name}"
    
class Questions(models.Model):
    question_id = models.AutoField(primary_key=True, null=False)
    project_id = models.ForeignKey(Projects,on_delete=models.CASCADE, null=True, related_name="screeningQuestion")
    question = models.TextField(null=False)

    class Meta:
        db_table = "screening_questions"

    def __str__(self):
        return f"{self.question}"

class Answers(models.Model):
    answer_id = models.AutoField(primary_key=True, null=False)
    question_id = models.ForeignKey(Questions,on_delete=models.CASCADE, null=True, related_name="questionAnswer")
    expert_id = models.ForeignKey(Experts,on_delete=models.CASCADE, null=True, related_name="questionAnswer")
    answer = models.TextField(null=False)

    class Meta:
        db_table = "answers"

    def __str__(self):
        return f"{self.answer}"



class companiesOfInterest(models.Model):
    company_of_interest_id = models.AutoField(primary_key=True, null=False)
    #when project is deleted, so does this their companies of interest data
    project_id = models.ForeignKey(Projects,on_delete=models.CASCADE, null=True, related_name="companyOfInterest")
    company_name = models.CharField(max_length=150, null=False)  
    is_past = models.BooleanField(default=True) #any new companies of interest info will be considered as past if not given enough details
    is_current = models.BooleanField(default=False)
    
    class Meta:
        db_table = "companies_of_interest"

class Project_files(models.Model):
    # Defining the file types as choices
    FILE_TYPE_CHOICES = [
        ('pdf', 'PDF'),
        ('excel', 'Excel'),
        ('word', 'Word'),
    ]

    projectFile_id = models.AutoField(primary_key=True, null=False)
    #when project is deleted, so does this their companies of interest data
    project_id = models.ForeignKey(Projects,on_delete=models.CASCADE, null=True, related_name="project_files")
    file_name = models.CharField(max_length=255, blank=True)  # Will be auto-filled
    file_type = models.CharField(max_length=50, choices=FILE_TYPE_CHOICES)
    file_path = models.FileField(upload_to='project_files/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = "project_files"
    
    def save(self, *args, **kwargs):
        # Auto-derive file name and file type from the uploaded file
        if self.file_path:
            self.file_name = os.path.splitext(self.file_path.name)[0]  # Get file name without extension
            file_extension = os.path.splitext(self.file_path.name)[1].lower()
            
            # Map extensions to the defined choices
            extension_to_type = {
                '.pdf': 'pdf',
                '.xlsx': 'excel',
                '.xls': 'excel',
                '.docx': 'word',
                '.doc': 'word'
            }
            
            self.file_type = extension_to_type.get(file_extension, self.file_type)
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.file_name} ({self.file_type})"

class Client_teams(models.Model):
    client_team_id = models.AutoField(primary_key=True, null=False)
    client_member_id = models.ForeignKey(Client_members,on_delete=models.CASCADE, null=True, related_name="client_team")
    project_id = models.ForeignKey(Projects,on_delete=models.CASCADE, null=True, related_name="client_team")
    
    class Meta:
        db_table = "client_teams"

class Project_pipelines(models.Model):
    project_pipeline_id = models.AutoField(primary_key=True, null=False)
    expert_id = models.ForeignKey(Experts,on_delete=models.SET_NULL, null=True, related_name="project_pipeline")
    project_id = models.ForeignKey(Projects,on_delete=models.CASCADE, null=True, related_name="project_pipeline")
    user_id = models.ForeignKey(Users,on_delete=models.SET_NULL, null=True, related_name="project_pipeline") 
    #if user|PIC is deleted, the value will be null. Can be called from users through related_name
    created_at = models.DateTimeField(auto_now_add=True)  # This will automatically store the creation timestamp
    
    class Meta:
        db_table = "project_pipelines"

class Published_statuses(models.Model):
    status_id = models.AutoField(primary_key=True, null=False)
    status_name = models.CharField(max_length=150, null=False)    
    
    class Meta:
        db_table = "published_statuses"

class Project_published(models.Model):
    project_publish_id = models.AutoField(primary_key=True, null=False)
    expert_id = models.ForeignKey(Experts,on_delete=models.SET_NULL, null=True, related_name="project_publish")
    project_id = models.ForeignKey(Projects,on_delete=models.CASCADE, null=True, related_name="project_publish")
    status_id = models.ForeignKey(Published_statuses,on_delete=models.SET_NULL, null=True, related_name="project_publish")
    user_id = models.ForeignKey(Users,on_delete=models.SET_NULL, null=True, related_name="project_publish")
    expert_availability = models.DateTimeField(null=True, blank=True)
    #expert_availability = models.BooleanField(default=True) #true means avails, false means not available    #if user|PIC is deleted, the value will be null. Can be called from users through related_name
    angles = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)  # This will automatically store the creation timestamp
    
    class Meta:
        db_table = "project_published"
        
class Project_with_experts(models.Model):
    project_with_experts_id = models.AutoField(primary_key=True, null=False)
    project_id = models.ForeignKey(Projects,on_delete=models.CASCADE, null=True, related_name="project_with_experts")
    expert_id = models.ForeignKey(Experts,on_delete=models.CASCADE, null=True, related_name="project_with_experts")
    biograph = models.TextField(null=False) #must be filled
    
    class Meta:
        db_table = "project_with_experts"