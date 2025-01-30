from django.contrib import admin
from django import forms
from .models import ExpertExperiences

class ExpertExperiencesAdminForm(forms.ModelForm):
    start_date = forms.DateField(
        widget=forms.DateInput(format='%Y-%m', attrs={'type': 'month'}),
        input_formats=['%Y-%m']
    )
    end_date = forms.DateField(
        widget=forms.DateInput(format='%Y-%m', attrs={'type': 'month'}),
        input_formats=['%Y-%m'],
        required=False
    )

    class Meta:
        model = ExpertExperiences
        fields = '__all__'

class ExpertExperiencesAdmin(admin.ModelAdmin):
    form = ExpertExperiencesAdminForm

admin.site.register(ExpertExperiences, ExpertExperiencesAdmin)