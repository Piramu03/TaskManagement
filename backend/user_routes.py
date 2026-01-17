from fastapi import APIRouter, HTTPException,Depends
from pydantic import BaseModel
from auth_utils import hash_password, verify_password, create_access_token
from json_db import load_db, save_db
from role_utils import get_payload,admin_required


from fastapi import Depends

router = APIRouter(prefix="/auth")

class SignupIn(BaseModel):
    name: str
    email: str
    password: str
    role: str = "user"   # default role (user)

class LoginIn(BaseModel):

    email: str
    password: str


@router.post("/signup")
def signup(user: SignupIn):
    db = load_db()

    # check if email exists
    if any(u["email"] == user.email for u in db["users"]):
        raise HTTPException(status_code=400, detail="User already exists")

    new_user = {
        "id": len(db["users"]) + 1,
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "role": user.role.lower()   # "admin" or "user"
    }

    db["users"].append(new_user)
    save_db(db)

    return {"message": "User created", "role": new_user["role"]}


@router.post("/login")
def login(user: LoginIn):
    db = load_db()

    # find user
    db_user = next((u for u in db["users"] if u["email"] == user.email), None)

    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # create JWT token storing role + id
    token = create_access_token({
        "user_id": db_user["id"],
        "role": db_user["role"]
    })

    return {
        "access_token": token,
        "role": db_user["role"]
    }

@router.get("/me")
def get_me(payload: dict = Depends(get_payload)):
    return {
        "user_id": payload["user_id"],
        "role": payload["role"]
    }

@router.get("/users")
def list_users(payload: dict = Depends(get_payload)):
    # Only admin can get all users
    if payload["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    db = load_db()
    return db["users"]

