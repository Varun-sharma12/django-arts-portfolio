# accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import User, PasswordResetToken

@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    # show is_email_verified in list view and details
    list_display = ("username", "email", "is_staff", "is_active", "is_email_verified", "date_joined")
    list_filter = ("is_staff", "is_active", "is_email_verified")
    search_fields = ("username", "email")
    ordering = ("-date_joined",)

    # Add is_email_verified to fieldsets so it's visible/editable on user change page
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name", "email")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
        ("Verification", {"fields": ("is_email_verified",)}),
    )

    # If you want it editable directly in list view:
    list_editable = ("is_email_verified",)

@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "short_token",
        "expires_at",
        "is_expired_display",
        "created_at",
    )

    list_filter = ("expires_at", "created_at")
    search_fields = ("user__email", "token")
    ordering = ("-created_at",)

    readonly_fields = ("token", "created_at", "expires_at")

    def short_token(self, obj):
        return f"{obj.token[:10]}..."
    short_token.short_description = "Token"

    def is_expired_display(self, obj):
        return obj.is_expired()
    is_expired_display.boolean = True
    is_expired_display.short_description = "Expired"
