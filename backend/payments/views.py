from django.shortcuts import render
import requests
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
from .utils import get_paypal_access_token
from .models import Payment, Plan
from django.db import transaction
# Create your views here.


from rest_framework.decorators import api_view
from rest_framework.response import Response
from .utils import get_paypal_access_token


@api_view(["GET"])
def test_paypal_auth(request):
    try:
        token = get_paypal_access_token()
        return Response({
            "success": True,
            "token_received": True
        })
    except Exception as e:
        return Response({
            "success": False,
            "error": str(e)
        }, status=500)


class CreatePaypalOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get("plan_id")

        if not plan_id:
            return Response({"error": "plan_id is required"}, status=400)

        try:
            plan = Plan.objects.get(id=plan_id)
        except Plan.DoesNotExist:
            return Response({"error": "Invalid plan"}, status=404)

        access_token = get_paypal_access_token()

        payload = {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "amount": {
                        "currency_code": "USD",
                        "value": str(plan.sale_price),  # ✅ REAL PRICE
                    }
                }
            ],
        }

        response = requests.post(
            f"{settings.PAYPAL_BASE_URL}/v2/checkout/orders",
            json=payload,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
            timeout=30,
        )
        response.raise_for_status()

        data = response.json()

        # ✅ Save payment correctly
        Payment.objects.create(
            user=request.user,
            plan=plan,                     # ✅ FK
            order_id=data["id"],
            amount=plan.sale_price,
            status="CREATED",
            raw_response=data,
        )

        return Response({
            "order_id": data["id"]
        })

class PayPalCaptureAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("orderID")

        if not order_id:
            return Response({"error": "orderID is required"}, status=400)
        
        # 🔒 Lock payment row
        with transaction.atomic():
            try:
                payment = (
                    Payment.objects
                    .select_for_update()
                    .get(order_id=order_id)
                )
            except Payment.DoesNotExist:
                return Response({"error": "Payment not found"}, status=404)

            if payment.status == "COMPLETED":
                return Response({
                    "message": "Payment already completed",
                    "capture_id": payment.capture_id,
                })

            payment.status = "PROCESSING"
            payment.save()

        access_token = get_paypal_access_token()

        capture_response = requests.post(
            f"{settings.PAYPAL_BASE_URL}/v2/checkout/orders/{order_id}/capture",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
        )

        data = capture_response.json()

        if capture_response.status_code != 201:
            payment.status = "FAILED"
            payment.raw_response = data
            payment.save()
            return Response(
                {"error": "Capture failed", "details": data},
                status=400
            )

        capture_id = data["purchase_units"][0]["payments"]["captures"][0]["id"]

        payment.status = "COMPLETED"
        payment.capture_id = capture_id
        payment.raw_response = data
        payment.save()

        return Response({
            "message": "Payment captured successfully",
            "capture_id": capture_id
        })
