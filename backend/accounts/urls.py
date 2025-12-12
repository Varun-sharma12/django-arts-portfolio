# accounts/urls.py
from django.urls import path
from .views import RegisterView, VerifyEmailView
from .auth_views import LoginView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("verify-email/", VerifyEmailView.as_view(), name="verify-email"),
    path("login/", LoginView.as_view(), name="login"),
]
