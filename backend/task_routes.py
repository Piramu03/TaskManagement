from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from json_db import load_db, save_db
from role_utils import get_payload
from utils import calculate_priority
from activity_utils import log_activity
from notifications_utils import create_notification


   # 🔥 SMART PRIORITY

router = APIRouter(prefix="/tasks")

class TaskIn(BaseModel):
    title: str
    description: Optional[str] = ""
    priority: Optional[str] = "low"
    category: Optional[str] = "general"
    due_date: Optional[str] = None
    status: str = "pending"  # pending / in_progress / completed
    assigned_to: Optional[int] = None


# -----------------------------------------------------------
# CREATE TASK
# -----------------------------------------------------------
@router.post("/")
def create_task(task: TaskIn, payload: dict = Depends(get_payload)):
    db = load_db()
    user_id = payload["user_id"]
    role = payload["role"]

    # ----------------------------
    # Role-based assignment
    # ----------------------------
    if role == "user":
        task.assigned_to = user_id

    if role == "admin" and task.assigned_to is None:
        task.assigned_to = user_id

    # ----------------------------
    # Smart Priority
    # ----------------------------
    auto_priority = calculate_priority(task.due_date)
    final_priority = auto_priority if auto_priority else task.priority

    # ----------------------------
    # Safe Task ID
    # ----------------------------
    new_id = max([t["id"] for t in db["tasks"]], default=0) + 1

    new_task = {
        "id": new_id,
        "title": task.title,
        "description": task.description,
        "priority": final_priority,
        "category": task.category,
        "due_date": task.due_date,
        "status": task.status,
        "assigned_to": task.assigned_to,
        "created_by": user_id
    }

    db["tasks"].append(new_task)

    # ----------------------------
    # Activity Log
    # ----------------------------
    log_activity(
        db,
        new_id,
        user_id,
        f"Task created: {task.title}"
    )

    # 🔔 TRIGGER NOTIFICATION – HIGH PRIORITY + PENDING
    if new_task["priority"] == "high" and new_task["status"] == "pending":
        create_notification(
            db,
            task.assigned_to,
            new_task["id"],          # ✅ task_id added
            f"New task created: {task.title}"
        )


    save_db(db)
    return new_task



# -----------------------------------------------------------
# GET TASKS
# -----------------------------------------------------------
@router.get("/")
def list_tasks(payload: dict = Depends(get_payload)):
    db = load_db()
    user_id = payload["user_id"]
    role = payload["role"]

    if role == "admin":
        return db["tasks"]

    return [t for t in db["tasks"] if t["assigned_to"] == user_id]


# -----------------------------------------------------------
# UPDATE TASK
# -----------------------------------------------------------
@router.put("/{task_id}")
def update_task(task_id: int, updates: dict, payload: dict = Depends(get_payload)):
    db = load_db()
    user_id = payload["user_id"]
    role = payload["role"]

    for t in db["tasks"]:
        if t["id"] == task_id:

            # Permission check
            if role == "user" and t["assigned_to"] != user_id:
                raise HTTPException(status_code=403, detail="Permission denied")

            # ✅ STORE OLD STATUS BEFORE UPDATE
            old_status = t["status"]

            # 🔥 SMART PRIORITY ON UPDATE
            if "due_date" in updates:
                auto_priority = calculate_priority(updates.get("due_date"))
                if auto_priority:
                    updates["priority"] = auto_priority

            # ✅ UPDATE TASK
            t.update(updates)

            # ✅ ACTIVITY LOG (AFTER UPDATE)
            if "status" in updates and updates["status"] != old_status:
                log_activity(
                    db,
                    task_id,
                    user_id,
                    f"Status changed from {old_status} to {updates['status']}"
                )
                create_notification(
                    db,
                    t["assigned_to"],
                    t["id"],                 # ✅ task_id
                    f"Task '{t['title']}' status changed to {updates['status']}",
            
                )

            save_db(db)
            return {"message": "updated"}

    raise HTTPException(status_code=404, detail="Task not found")

# -----------------------------------------------------------
# DELETE TASK
# -----------------------------------------------------------
@router.delete("/{task_id}")
def delete_task(task_id: int, payload: dict = Depends(get_payload)):
    db = load_db()
    user_id = payload["user_id"]
    role = payload["role"]

    for t in db["tasks"]:
        if t["id"] == task_id:

            if role == "user" and t["assigned_to"] != user_id:
                raise HTTPException(status_code=403, detail="Permission denied")
            log_activity(
                db,
                task_id,
                user_id,
                f"Task deleted: {t['title']}"
            )

            db["tasks"].remove(t)
            save_db(db)
            return {"message": "deleted"}

    raise HTTPException(status_code=404, detail="Task not found")

