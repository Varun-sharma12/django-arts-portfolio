# accounts/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer
from .utils import verify_token
from .models import User
from django.shortcuts import redirect

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({"detail": "Registration successful. Verification email sent."}, status=status.HTTP_201_CREATED)


class VerifyEmailView(APIView):
    """
    Endpoint to verify token, e.g. GET /api/auth/verify-email/?token=XXX
    """
    def get(self, request):
        token = request.query_params.get("token")
        if not token:
            return Response({"error": "Missing token"}, status=status.HTTP_400_BAD_REQUEST)
        data = verify_token(token)
        if "error" in data:
            return Response({"error": data["error"]}, status=status.HTTP_400_BAD_REQUEST)
        # load user and mark verified
        user_id = data.get("user_id")
        try:
            user = User.objects.get(id=user_id, email__iexact=data.get("email"))
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_400_BAD_REQUEST)
        user.is_email_verified = True
        user.save()
        # After verification redirect to frontend login page (or return JSON)
        frontend_login = request.build_absolute_uri("/")  # fallback
        # If you set FRONTEND_BASE_URL in settings, better to use that:
        from django.conf import settings
        frontend_login = f"{settings.FRONTEND_BASE_URL}/login"
        # Option A: Redirect user to frontend login page:
        return redirect(frontend_login)

        # Option B: return JSON:
        # return Response({"detail": "Email verified. You can now login."})
