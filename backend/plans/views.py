from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from plans.models import Plan

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
