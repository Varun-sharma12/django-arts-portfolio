from celery import shared_task
import time

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=5, retry_kwargs={"max_retries": 3})
def handle_post_payment(self, user_id, plan_name):
    print("🔵 Background task started")
    print(f"User ID: {user_id}")
    print(f"Plan: {plan_name}")

    # simulate heavy / slow work
    time.sleep(5)

    print("✅ Background task completed")
