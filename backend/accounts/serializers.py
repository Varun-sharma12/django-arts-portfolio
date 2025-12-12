# accounts/serializers.py
from rest_framework import serializers
from .models import User
from .utils import generate_verification_token, send_verification_email

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs["username"]
        email = attrs["email"].lower()
        password = attrs["password"]
        confirm = attrs["confirm_password"]

        if password != confirm:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        # Check existing users
        qs_by_email = User.objects.filter(email__iexact=email)
        qs_by_username = User.objects.filter(username__iexact=username)

        # If an active/verified user exists with email -> reject (email taken)
        verified_email_qs = qs_by_email.filter(is_email_verified=True)
        if verified_email_qs.exists():
            raise serializers.ValidationError({"email": "Email already registered."})

        # If email exists but not verified, we should follow rules 8-11:
        # 8) If not verified and again user try to login then don't show email exist just send again the verification link to register the user.
        # 9) if unverified user comes and put same username and email again then same verification link is sent to verify.
        # 10) if unverified user comes and put same email but diff username then if username exists -> error, else update username and send verification link.
        # 11) if unverified user comes and put same username but different email then error that username exists.

        unverified_email_qs = qs_by_email.filter(is_email_verified=False)
        if unverified_email_qs.exists():
            existing_user = unverified_email_qs.first()
            # same username and email -> resend (allow registration)
            if existing_user.username.lower() == username.lower():
                attrs["existing_user"] = existing_user
                return attrs

            # same email but different username:
            # if that username exists in DB (verified or unverified) -> error
            if qs_by_username.exists():
                raise serializers.ValidationError({
                    "username": "This username already exists. Choose another username."
                })
            # otherwise we will update username on that unverified user and resend
            attrs["existing_user"] = existing_user
            attrs["should_update_username"] = True
            return attrs

        # If username exists in DB (and user is verified) -> username collision
        if qs_by_username.exists():
            # if username exists but belongs to unverified user with different email:
            user_with_username = qs_by_username.first()
            if not user_with_username.is_email_verified:
                # rule 11: unverified user comes and put same username but different email -> error
                raise serializers.ValidationError({
                    "username": "This username is taken. Choose another one."
                })
            raise serializers.ValidationError({"username": "Username already taken."})

        return attrs

    def create(self, validated_data):
        username = validated_data["username"]
        email = validated_data["email"].lower()
        password = validated_data["password"]
        existing_user = validated_data.get("existing_user", None)
        should_update_username = validated_data.get("should_update_username", False)

        if existing_user:
            # update username if requested
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

        # generate token and send email
        token = generate_verification_token(user.id, user.email)
        request = self.context.get("request")
        send_verification_email(request, user, token)
        return user
