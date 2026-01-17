from fastapi import APIRouter, Depends
from json_db import load_db
from role_utils import get_payload

router = APIRouter(prefix="/activity")

@router.get("/{task_id}")
def get_task_activity(task_id: int, payload: dict = Depends(get_payload)):
    db = load_db()
    return [log for log in db["activity_logs"] if log["task_id"] == task_id]
