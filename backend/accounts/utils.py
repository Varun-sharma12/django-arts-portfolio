# accounts/utils.py
from django.conf import settings
from django.core import signing
from django.core.mail import send_mail

from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings

SIGNING_SALT = "email-verification-salt"
TOKEN_MAX_AGE_SECONDS = 60  # 5 minutes

def generate_verification_token(user_id, email):
    payload = {"user_id": user_id, "email": email}
    token = signing.dumps(payload, salt=SIGNING_SALT)
    return token

def verify_token(token, max_age=TOKEN_MAX_AGE_SECONDS):
    from django.core import signing
    try:
        data = signing.loads(token, salt=SIGNING_SALT, max_age=max_age)
        return {"ok": True, "data": data}
    except signing.SignatureExpired:
        return {"ok": False, "error": "expired"}
    except signing.BadSignature:
        return {"ok": False, "error": "invalid"}

def send_verification_email(user, token):
    # Build verification URL (frontend will call backend or display messages)
    frontend_verify = f"{settings.FRONTEND_BASE_URL}/verify?token={token}"
    subject = "Verify your email"
    message = (
        f"Hi {user.username},\n\n"
        f"Click the link to verify your email (expires in 5 minutes):\n\n"
        f"{frontend_verify}\n\n"
        "If you did not request this, ignore.\n"
    )
    send_mail(subject, message, settings.EMAIL_HOST_USER, [user.email], fail_silently=False)


# Google Login Utility
def verify_google_token(token):
    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )
        return idinfo
    except Exception:
        return None