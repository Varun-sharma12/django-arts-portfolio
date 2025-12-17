# backend/accounts/serializers.py
from rest_framework import serializers
from .models import User
from .utils import generate_verification_token, send_verification_email

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(
        max_length=150,
        error_messages={
        "blank": "Username is required.",
        "required": "Username is required."
    })
    email = serializers.EmailField( 
        error_messages={
        "blank": "Email is required.",
        "required": "Email is required.",
        "invalid": "Enter a valid email address."
    })
    password = serializers.CharField(
        write_only=True, min_length=8,
        error_messages={
         "blank": "Password is required.",
        "min_length": "Password must be at least 8 characters."
    })
    confirm_password = serializers.CharField(
        write_only=True,        
        error_messages={
        "required": "Confirm password is required.",
        "blank": "Confirm password is required."
    })

    def validate(self, attrs):
        username = attrs["username"].strip()
        email = attrs["email"].lower().strip()
        password = attrs["password"]
        confirm = attrs["confirm_password"]

        if password != confirm:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        qs_by_email = User.objects.filter(email__iexact=email)
        qs_by_username = User.objects.filter(username__iexact=username)

        # If an active/verified user exists with email -> reject
        verified_email_qs = qs_by_email.filter(is_email_verified=True)
        if verified_email_qs.exists():
            raise serializers.ValidationError({"email": "Email already registered."})

        # If email exists but not verified, handle special cases
        unverified_email_qs = qs_by_email.filter(is_email_verified=False)
        if unverified_email_qs.exists():
            existing_user = unverified_email_qs.first()
            # same username and email -> reuse user (resend)
            if existing_user.username.lower() == username.lower():
                attrs["existing_user"] = existing_user
                return attrs

            # same email but different username:
            # if that username exists -> error
            if qs_by_username.exists():
                raise serializers.ValidationError({
                    "username": "This username already exists. Choose another username."
                })
            # else update username of unverified user
            attrs["existing_user"] = existing_user
            attrs["should_update_username"] = True
            return attrs

        # If username exists in DB -> error
        if qs_by_username.exists():
            user_with_username = qs_by_username.first()
            if not user_with_username.is_email_verified:
                # unverified user with same username but different email -> error
                raise serializers.ValidationError({
                    "username": "This username is taken. Choose another one."
                })
            raise serializers.ValidationError({"username": "Username already taken."})

        return attrs

    def create(self, validated_data):
        username = validated_data["username"].strip()
        email = validated_data["email"].lower().strip()
        password = validated_data["password"]
        existing_user = validated_data.get("existing_user", None)
        should_update_username = validated_data.get("should_update_username", False)

        if existing_user:
            if should_update_username:
                existing_user.username = username
            existing_user.set_password(password)
            existing_user.is_email_verified = False
            existing_user.save()
            user = existing_user
        else:
            user = User.objects.create_user(username=username, email=email)
            user.set_password(password)
            user.is_email_verified = False
            user.save()
            user.plan = None

        # generate token and send email (note: send_verification_email expects (user, token))
        token = generate_verification_token(user.id, user.email)
        send_verification_email(user, token)

        return user
