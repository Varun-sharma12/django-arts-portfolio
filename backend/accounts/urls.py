# accounts/urls.py
from django.urls import path, include
from .views import VerifyEmailView, ResendVerificationView
from .views import RegisterView, LoginView  # if present
from rest_framework_simplejwt.views import TokenRefreshView
from .views import ProtectedView
from .views import GoogleLoginView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("verify-email/", VerifyEmailView.as_view(), name="verify-email"),
    path("resend-verification/", ResendVerificationView.as_view(), name="resend-verification"),
    path("token/refresh/", TokenRefreshView.as_view(), name='token_refresh'),
    path("protected/", ProtectedView.as_view(), name="protected"),
    path("google-login/", GoogleLoginView.as_view()),
    path("api/plans/", include("plans.urls")),

]
