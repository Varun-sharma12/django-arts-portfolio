# accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
from plans.models import Plan

class User(AbstractUser):
    # keep default username, email fields. enforce email unique via model constraint below
    is_email_verified = models.BooleanField(default=False)
    plan = models.ForeignKey(
        Plan,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    # Optional: force unique email at DB level
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["email"], name="unique_email")
        ]
