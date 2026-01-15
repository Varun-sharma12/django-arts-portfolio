from django.urls import path
from .views import CreatePaypalOrderView, test_paypal_auth, PayPalCaptureAPIView


urlpatterns = [
      path("create-order/", CreatePaypalOrderView.as_view(), name="paypal-create-order"),
      path("test-auth/", test_paypal_auth),
      path("capture/", PayPalCaptureAPIView.as_view()),
]
