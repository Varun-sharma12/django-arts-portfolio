import os
from celery import Celery
os.environ.setdefault("DJANGO_SETTING_MODULE","backend.settings")
app = Celery("backend")

app.config_from_object("django.config:settings", namespace="CELERY")
app.autodiscover_tasks()