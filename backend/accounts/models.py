# accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
from plans.models import Plan
from django.utils import timezone
from datetime import timedelta
import uuid

 
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
def get_expiry_time():
    return timezone.now() + timedelta(minutes=15)
class PasswordResetToken(models.Model):
    user = models.ForeignKey(
        User, 
       on_delete=models.CASCADE,
       related_name="password_reset_tokens"
            
       )
    token = models.CharField(max_length=255)
    created_at = models.DateTimeField( auto_now_add=True)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField(default=get_expiry_time)

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=15)
        super().save(*args, **kwargs)

    def is_expired(self):
        return timezone.now() >  self.expires_at

    def __str__(self):
        return f"Password reset token for {self.user.email}"
