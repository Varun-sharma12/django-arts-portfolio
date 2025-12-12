# accounts/auth_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .models import User
from .utils import generate_verification_token, send_verification_email

class LoginView(APIView):
    """
    Minimal login view: if credentials correct and verified -> success.
    If correct email but wrong password -> return password error (we will handle later)
    If email not verified -> resend verification link (req 8)
    """
    def post(self, request):
        email = request.data.get("email", "").lower()
        password = request.data.get("password", "")
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_email_verified:
            # resend verification
            token = generate_verification_token(user.id, user.email)
            send_verification_email(request, user, token)
            return Response({"detail": "Account not verified. Verification email resent."}, status=status.HTTP_400_BAD_REQUEST)

        # If verified, we check password
        user_auth = authenticate(request, username=user.username, password=password)
        if user_auth is None:
            # wrong password
            return Response({"error": "Wrong password"}, status=status.HTTP_401_UNAUTHORIZED)

        # else: Successful login (we will later issue JWT/access tokens)
        return Response({"detail": "Login successful (placeholder)."}, status=status.HTTP_200_OK)
