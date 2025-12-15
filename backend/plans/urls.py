from django.urls import path
from .views import SelectPlanView

urlpatterns = [
    path("select/", SelectPlanView.as_view(), name="select-plan"),
]
