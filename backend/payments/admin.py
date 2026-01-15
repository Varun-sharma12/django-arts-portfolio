from django.contrib import admin
from .models import Plan, Payment


# @admin.register(Plan)
# class PlanAdmin(admin.ModelAdmin):
#     list_display = ("id", "title", "sale_price")


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "plan",
        "amount",
        # "currency",
        "status",
        "order_id",
        "created_at",
    )
    list_filter = ("status",)
    search_fields = ("order_id",)
