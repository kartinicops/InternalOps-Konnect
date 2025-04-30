from django.db import models
from users.models import Users
import re
from django.core.exceptions import ValidationError

def validate_phone_number(value):
    # Simple regex for basic phone number validation
    if not re.match(r'^\+?\d{7,15}$', value):
        raise ValidationError("Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")

# Create your models here.
class Experts(models.Model):
    expert_id = models.AutoField(primary_key=True, null=False)
    full_name = models.CharField(max_length=120, null=False)
    linkedIn_profile_link = models.CharField(max_length=255, null=True)
    industry = models.CharField(max_length=200,null=False)
    country_of_residence = models.CharField(max_length=30, null=False)
    email = models.EmailField(unique=True, null=False)
    expert_cost = models.PositiveIntegerField(null=False)
    user_id = models.ForeignKey(Users,on_delete=models.SET_NULL, null=True, related_name="experts") 
    #if user|PIC is deleted, the value will be null. Can be called from users through related_name
    phone_number = models.CharField(max_length=15, validators=[validate_phone_number], null=True, blank=True) #optional because not all expert give their phone num
    notes = models.CharField(max_length=300, null=True, blank=True) #optional
    email_confirmed = models.BooleanField(default=False)
    number_of_credits = models.PositiveIntegerField(null=True)

    class Meta:
        db_table = "experts"
    
    def __str__(self):
        # Return the expert name as display
        return f"{self.full_name}"

class ExpertExperiences(models.Model):
    experience_id = models.AutoField(primary_key=True, null=False)
    expert_id = models.ForeignKey(Experts,on_delete=models.CASCADE, null=False, related_name="experiences")
    #when an expert is deleted, experiences connected to them is also deleted
    company_name = models.CharField(max_length=120, null=False)
    title = models.CharField(max_length=255, null=False)
    start_date = models.DateField(null=False) 
    end_date = models.DateField(null=True, blank=True) # Allows null for "present"
    
    class Meta:
        db_table = "experiences"

    def save(self, *args, **kwargs):
        # Ensure day is set to the first of the month
        if self.start_date.day != 1:
            self.start_date = self.start_date.replace(day=1)
        # If the date is incomplete or "present" is passed, store as null
        if self.end_date is None:
            self.end_date = None
        elif isinstance(self.end_date, str) and self.end_date.lower() == "present":
            self.end_date = None  # Store as null if "present" is provided
        else:
            self.end_date = self.end_date.replace(day=1)
        super(ExpertExperiences, self).save(*args, **kwargs)

    def __str__(self):
        # Return the date as MM-YYYY or "present" if null
        start_display = self.start_date.strftime('%m-%Y') if self.start_date else "present"
        end_display = self.end_date.strftime('%m-%Y') if self.end_date else "present"
        return f"{start_display} to {end_display}"

