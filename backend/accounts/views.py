# backend/accounts/views.py
from django.conf import settings
from django.contrib.auth import authenticate
from django.shortcuts import redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import User
from .serializers import RegisterSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
import secrets
from rest_framework_simplejwt.tokens import RefreshToken
from .utils import verify_google_token
from django.core.mail import send_mail

from .utils import (
    generate_verification_token,
    verify_token,
    send_verification_email,
)

# RegisterView: accepts username, email, password, confirm_password
class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data, context={"request": request})

        if not serializer.is_valid():
            # Get the first error message
            errors = serializer.errors

            # Example: {"username": ["Username taken"]} → "Username taken"
            # first_field = next(iter(errors))
            # first_error = errors[first_field][0]

            return Response(
                errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.save()
        return Response(
            {"detail": "Registration successful. Verification email sent."},
            status=status.HTTP_201_CREATED
        )


 
# Login View
class LoginView(APIView):
    def post(self, request):
        email = request.data.get("email", "").lower()
        password = request.data.get("password", "")

        if not email and not password:
            return Response(
                {
                    "errors": {
                        "email": "Email is required",
                        "password": "Password is required"
                    }
                }
                , status=400
                )
        if not email:
            return Response(
                {
                    "errors": {
                        "email": "Email is required",
                    }
                }, status=400
            )
        if not password:
            return Response(
                {
                    "errors": {
                        "password": "password is required",
                    }
                }, status=400
            )
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
           return Response(
                {
                    "errors": {
                        "email": "User does not exist"
                    }
                },
                status=401
            )

        if not user.is_email_verified:
            token = generate_verification_token(user.id, user.email)
            send_verification_email(user, token)
            return Response(
                {
                    "code": "email_not_verified",
                      "errors": {
                        "message": "Email not verified. Verification email resent."
                    }
                },
                status=400,
            )

        if not user.check_password(password):
            return Response(
                {
                    "errors": {
                        "password": "Invalid credentials"
                    }
                },
                status=401
            )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "plan": user.plan.title if user.plan else None
                },
            },
            status=200,
        )


# VerifyEmailView: verifies token (redirects to frontend on success), supports json=true
class VerifyEmailView(APIView):
    def get(self, request):
        token = request.query_params.get("token")
        as_json = request.query_params.get("json", "false").lower() == "true"

        if not token:
            return Response({"error": "Missing token"}, status=status.HTTP_400_BAD_REQUEST)

        result = verify_token(token)
        if not result.get("ok"):
            # invalid or expired
            reason = result.get("error", "invalid")
            if as_json:
                return Response({"error": reason}, status=status.HTTP_400_BAD_REQUEST)
            return redirect(f"{settings.FRONTEND_BASE_URL}/verify-failed?reason={reason}")

        data = result.get("data", {})
        user_id = data.get("user_id")
        email = data.get("email")
        try:
            user = User.objects.get(id=user_id, email__iexact=email)
        except User.DoesNotExist:
            if as_json:
                return Response({"error": "user_not_found"}, status=status.HTTP_400_BAD_REQUEST)
            return redirect(f"{settings.FRONTEND_BASE_URL}/verify-failed?reason=user_not_found")

        user.is_email_verified = True
        user.save()

        if as_json:
            return Response({"detail": "Email verified"}, status=status.HTTP_200_OK)

        return redirect(f"{settings.FRONTEND_BASE_URL}/login")


# ResendVerificationView: POST { "email": "..." }
class ResendVerificationView(APIView):
    def post(self, request):
        email = (request.data.get("email") or "").lower()
        if not email:
            return Response({"error": "Email required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if user.is_email_verified:
            return Response({"detail": "User already verified"}, status=status.HTTP_400_BAD_REQUEST)

        token = generate_verification_token(user.id, user.email)
        send_verification_email(user, token)
        return Response({"detail": "Verification email resent"}, status=status.HTTP_200_OK)



class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "detail": "You are authenticated",
                "user": request.user.username,
            },
            status=200,
        )



class GoogleLoginView(APIView):
    def post(self, request):
        token = request.data.get("token")

        if not token:
            return Response({"error": "Token required"}, status=400)

        google_data = verify_google_token(token)
        if not google_data:
            return Response({"error": "Invalid Google token"}, status=400)

        email = google_data["email"]
        name = google_data.get("name", "")
        base_username = email.split("@")[0]

        # Ensure unique username
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": username,
                "is_email_verified": True,
            },
        )

        # If newly created → generate password & send email
        if created:
            raw_password = secrets.token_urlsafe(8)
            user.set_password(raw_password)
            user.save()

            send_mail(
                subject="Your account credentials",
                message=(
                    f"Hi {user.username},\n\n"
                    f"Your account was created using Google Login.\n\n"
                    f"Username: {user.username}\n"
                    f"Password: {raw_password}\n\n"
                    f"Please login and change your password."
                ),
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[user.email],
            )

        # Issue JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                },
            },
            status=200,
        )
