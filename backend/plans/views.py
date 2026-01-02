from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from plans.models import Plan
import stripe
from django.conf import settings
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from plans.tasks import handle_post_payment

stripe.api_key = settings.STRIPE_SECRET_KEY
User = get_user_model()

class SelectPlanView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan_name = request.data.get("plan")

        if not plan_name:
            return Response(
                {"error": "Plan name is required"},
                status=400
            )

        try:
            plan = Plan.objects.get(title=plan_name)
        except Plan.DoesNotExist:
            return Response(
                {"error": "Invalid plan"},
                status=400
            )

        request.user.plan = plan
        request.user.save()

        return Response({
            "message": f"{plan.title} plan selected successfully",
            "plan": plan.title
        })

class CreateCheckoutSessionView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan_name = request.data.get("plan")

        if not plan_name:
            return Response({"error": "Plan is required"}, status=400)
        try:
            plan = Plan.objects.get(title=plan_name)
        
        except Plan.DoesNotExist:
            return Response({"error": "Invalid Plan"}, status=400)
        
        if plan.sale_price<=0:
            return Response(
                {"error": "Free plan does not require Payment"},
                status=400
            )
        
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                mode="payment",
                customer_email=request.user.email,

                line_items=[{
                    "price_data":{
                        "currency": "inr",
                        "product_data": {
                            "name": plan.title,
                            "description": plan.description,
                        },
                        "unit_amount": int(plan.sale_price*100),
                    },
                    "quantity": 1, 
                }],
                success_url="http://localhost:3000/dashboard?payment=success",
                cancel_url="http://localhost:3000/dashboard?payment=cancel",

                metadata={
                    "user_id": request.user.id,
                    "plan_id": plan.id,
                }
            )

            return Response({
                    "checkout_url": session.url
                })
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=500
            )
        
@csrf_exempt
def stripe_webhook(request):
    print("🔥 WEBHOOK HIT")
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=sig_header,
            secret=settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:

        return HttpResponse(status=400)
    
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]

        user_id =  session["metadata"].get("user_id")
        plan_id = session["metadata"].get("plan_id")

        try:
            user = User.objects.get(id=user_id)
            plan = Plan.objects.get(id=plan_id)

            user.plan = plan
            user.save()
            handle_post_payment.delay(user.id, plan.title)
        except (User.DoesNotExist, Plan.DoesNotExist):
            pass
    
    return HttpResponse(status=200)