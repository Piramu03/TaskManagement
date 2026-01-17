from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from json_db import load_db
from role_utils import get_payload

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/")
def get_notifications(payload: dict = Depends(get_payload)):
    db = load_db()
    user_id = payload["user_id"]
    role = payload["role"]

    today = datetime.utcnow().date()
    tomorrow = today + timedelta(days=1)

    notifications = []

    for task in db["tasks"]:

        # User sees only assigned tasks
        if role == "user" and task["assigned_to"] != user_id:
            continue

        # 🔴 HIGH PRIORITY + PENDING
        if task["priority"] == "high" and task["status"] == "pending":
            notifications.append({
                "type": "high_priority",
                "title": task["title"],
                "priority": task["priority"],
                "status": task["status"],
                "due_date": task["due_date"]
            })

        if not task["due_date"] or task["status"] == "completed":
            continue

        due_date = datetime.strptime(task["due_date"], "%Y-%m-%d").date()

        # ⏰ DUE TOMORROW
        if due_date == tomorrow:
            notifications.append({
                "type": "due_tomorrow",
                "title": task["title"],
                "priority": task["priority"],
                "status": task["status"],
                "due_date": task["due_date"]
            })

        # ⚠️ OVERDUE
        if due_date < today:
            notifications.append({
                "type": "overdue",
                "title": task["title"],
                "priority": task["priority"],
                "status": task["status"],
                "due_date": task["due_date"]
            })

    return notifications

        
        
