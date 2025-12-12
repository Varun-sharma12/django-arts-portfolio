# accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # keep default username, email fields. enforce email unique via model constraint below
    is_email_verified = models.BooleanField(default=False)

    # Optional: force unique email at DB level
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["email"], name="unique_email")
        ]
