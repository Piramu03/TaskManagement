from datetime import datetime

def create_notification(db, user_id, task_id, message):
    db["notifications"].append({
        "id": len(db["notifications"]) + 1,
        "user_id": user_id,
        "task_id": task_id,
        "message": message,
        "created_at": datetime.now().isoformat(),
        "read": False
    })
   

