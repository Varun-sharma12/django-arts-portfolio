from django.urls import path
from .views import SelectPlanView, CreateCheckoutSessionView, stripe_webhook

urlpatterns = [
    path("select/", SelectPlanView.as_view(), name="select-plan"),
    path("create-checkout-session/", CreateCheckoutSessionView.as_view(), name='creat-checkout-session'),
    path("stripe/webhook/", stripe_webhook, name="stripe_webhook"),
]
