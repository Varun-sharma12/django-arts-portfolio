from django.db import models
from django.conf import settings
from plans.models import Plan

class Payment(models.Model):
    STATUS_CHOICES = [
        ("CREATED", "Created"),
        ("PROCESSING", "Processing"),
        ("COMPLETED", "Completed"),
        ("FAILED", "Failed"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    plan = models.ForeignKey(               # ✅ PROPER RELATION
        Plan,
        on_delete=models.PROTECT,
        related_name="payments"
    )

    order_id = models.CharField(
        max_length=255,
        unique=True
    )

    capture_id = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        unique=True
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES
    )

    raw_response = models.JSONField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.user} | {self.plan.title} | {self.status}"
