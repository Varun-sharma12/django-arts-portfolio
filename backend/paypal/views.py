from django.shortcuts import render
import requests
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
from .utils import get_paypal_access_token

# Create your views here.

class CreatePaypalOrderView(APIView):
  permission_classes = [IsAuthenticated]
  
  def post(self, request):

    access_token = get_paypal_access_token()


    payload = {
      "intent": "CAPTURE",
      "purchase_units":[
        {
          "amount":{
            "currency_code": "USD",
            "value": "10.00"
          }
        }
      ]
    }

    url = f"{settings.PAYPAL_BASE_URL}/v2/checkout/orders"

    headers = {
      "Content-Type": "application/json",
      "Authorization": f"Bearer {access_token}"
    }

    response = requests.post(url, json=payload, headers=headers, timeout=30)
    response.raise_for_status()

    data = response.json()

    return Response({
      "order_id": data["id"],
      "status": data["status"],

    })