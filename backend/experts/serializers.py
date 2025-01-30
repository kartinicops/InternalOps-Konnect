from rest_framework import serializers
from .models import Experts
from .models import ExpertExperiences
#serializers pack and unpack data into JSON
class ExpertsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experts
        fields = ["expert_id", "full_name", "linkedIn_profile_link", "industry", "country_of_residence",  "email", "expert_cost", "user_id", "phone_number", "notes", "email_confirmed"]

class ExperiencesSerializer(serializers.ModelSerializer):
    #settings to store only month and year
    start_date = serializers.DateField(
        format='%m-%Y', #output
        input_formats=['%m-%Y', '%d-%m-%Y', '%Y-%m', '%Y-%m-%d'], # Accepts both MM-YYYY, DD-MM-YYYY and other date format in the input
        required=True) 
    
    end_date = serializers.DateField(
        format='%m-%Y', 
        input_formats=['%m-%Y', '%d-%m-%Y', '%Y-%m', '%Y-%m-%d'], # Accepts both MM-YYYY, DD-MM-YYYY and other date format in the input
        required=False, #null means ongoing / present
        allow_null=True)
    
    def validate_end_date(self, value):
        # Check if the value is a valid date, else handle as "present"
        if value is not None:
            return value
        return None

    class Meta:
        model = ExpertExperiences
        fields = ['experience_id', 'expert_id', 'company_name', 'title', 'start_date', 'end_date']