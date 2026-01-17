from fastapi import APIRouter, Depends, HTTPException
from json_db import load_db, save_db
from role_utils import get_payload

router = APIRouter(prefix="/groups", tags=["Groups"])


# -------------------------------------------------
# GET GROUPS (Admin → all, User → only joined)
# -------------------------------------------------
@router.get("/")
def get_groups(payload: dict = Depends(get_payload)):
    db = load_db()
    user_id = payload["user_id"]
    role = payload["role"]

    groups = []

    for group in db["groups"]:
        if role == "admin":
            groups.append(group)
        else:
            for gm in db["group_members"]:
                if gm["group_id"] == group["id"] and gm["user_id"] == user_id:
                    groups.append(group)
                    break

    return groups


# -------------------------------------------------
# CREATE GROUP (ADMIN ONLY)
# -------------------------------------------------
@router.post("/")
def create_group(data: dict, payload: dict = Depends(get_payload)):
    db = load_db()

    role = payload["role"]
    creator_id = payload["user_id"]

    if role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can create groups")

    db.setdefault("groups", [])
    db.setdefault("group_members", [])

    name = data.get("name")
    members = data.get("members", [])

    if not name:
        raise HTTPException(status_code=400, detail="Group name required")

    group_id = len(db["groups"]) + 1
    new_group = {
        "id": group_id,
        "name": name,
        "created_by": creator_id
    }

    db["groups"].append(new_group)

    # Add creator
    db["group_members"].append({
        "group_id": group_id,
        "user_id": creator_id
    })

    # Add selected members safely
    for user_id in set(members):
        if user_id != creator_id:
            db["group_members"].append({
                "group_id": group_id,
                "user_id": user_id
            })

    save_db(db)
    return new_group


@router.delete("/{group_id}")
def delete_group(
    group_id: int,
    payload: dict = Depends(get_payload)
):
    db = load_db()

    # 🔐 Admin only
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    # Remove group
    db["groups"] = [
        g for g in db.get("groups", [])
        if g["id"] != group_id
    ]

    # Remove group members
    db["group_members"] = [
        gm for gm in db.get("group_members", [])
        if gm["group_id"] != group_id
    ]

    # Remove messages
    db["messages"] = [
        m for m in db.get("messages", [])
        if m["group_id"] != group_id
    ]

    save_db(db)
    return {"message": "Group deleted successfully"}


