from datetime import datetime

def log_activity(db, task_id, user_id, action):
    log = {
        "id": len(db["activity_logs"]) + 1,
        "task_id": task_id,
        "user_id": user_id,
        "message": action,
        "timestamp": datetime.utcnow().isoformat()
    }
    db["activity_logs"].append(log)
