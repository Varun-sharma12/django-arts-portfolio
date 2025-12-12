# accounts/utils.py
from django.conf import settings
from django.core import signing
from django.urls import reverse
from django.core.mail import send_mail
from django.template.loader import render_to_string

SIGNING_SALT = "email-verification-salt"
TOKEN_MAX_AGE_SECONDS = 300  # 5 minutes

def generate_verification_token(user_id, email):
    payload = {"user_id": user_id, "email": email}
    token = signing.dumps(payload, salt=SIGNING_SALT)
    return token

def verify_token(token, max_age=TOKEN_MAX_AGE_SECONDS):
    try:
        data = signing.loads(token, salt=SIGNING_SALT, max_age=max_age)
        return data  # { "user_id": .., "email": ... }
    except signing.SignatureExpired:
        return {"error": "expired"}
    except signing.BadSignature:
        return {"error": "invalid"}

def send_verification_email(request, user, token):
    # Build verification URL. Assumes frontend handles verification page,
    # but we provide an API endpoint too.
    # Example frontend verify route: http://localhost:3000/verify?token=...
    verify_url = f"{settings.FRONTEND_BASE_URL}/verify?token={token}"

    subject = "Verify your email"
    message = f"Hi {user.username},\n\nClick the link to verify your email (expires in 5 minutes):\n{verify_url}\n\nIf you did not create an account, ignore this email."
    send_mail(subject, message, settings.EMAIL_HOST_USER, [user.email], fail_silently=False)
