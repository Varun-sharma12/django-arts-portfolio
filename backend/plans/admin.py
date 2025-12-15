from django.contrib import admin
from .models import Plan

@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "market_price", "sale_price")
