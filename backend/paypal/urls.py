from django.urls import path
from .views import CreatePaypalOrderView

urlpatterns = [
      path("create-order/", CreatePaypalOrderView.as_view(), name="paypal-create-order"),
]
