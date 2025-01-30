from django.db import models
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# Create your models here.
class CustomUserManager(BaseUserManager): #This manager handles creating users and superusers, ensuring proper handling of passwords.
    def create_user(self, email, password=None, **extra_fields):
        """Creates and returns a user with an email and password"""
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # Set the password correctly (hashed)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Creates and returns a superuser with an email and password"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class Users(AbstractBaseUser):
    user_id = models.AutoField(primary_key=True, null=False)
    user_first_name = models.CharField(max_length=30, null=False)
    user_last_name = models.CharField(max_length=30)
    email = models.EmailField(unique=True, null=False)
    password = models.CharField(max_length=128, null=False)

    USERNAME_FIELD = 'email'  # Use email as the username field
    REQUIRED_FIELDS = ['user_first_name', 'user_last_name']  # Any additional fields for user creation, if needed

    # Additional fields required for the user to work with Django's auth system
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)  # To indicate if the user is a staff member
    is_superuser = models.BooleanField(default=False)  # To indicate if the user is a superuser

    objects = CustomUserManager()

    class Meta:
        db_table = "users"
        ordering = ['user_id']  # Default ordering by user_id

    def has_perm(self, perm, obj=None):
        """Does the user have a specific permission?"""
        return self.is_superuser

    def has_module_perms(self, app_label):
        """Does the user have permissions to view the app `app_label`?"""
        return self.is_superuser

    def save(self, *args, **kwargs):
        super(Users, self).save(*args, **kwargs)
