from django.contrib import admin

# Register your models here.
from .models import Users

@admin.register(Users) #connected with users model
class UsersAdmin(admin.ModelAdmin):
    list_display = ('user_id', 'user_first_name', 'user_last_name', 'email')  # Columns to display in the admin list
    search_fields = ('user_first_name', 'user_last_name', 'email')  # Add search functionality to these fields
    list_filter = ('user_first_name', 'user_last_name')  # Add filters to the admin list view

    # Optionally, you can add other configurations such as ordering or pagination
    ordering = ('user_id',)  # Ordering by user_id
    list_per_page = 10  # Pagination (show 10 users per page)
