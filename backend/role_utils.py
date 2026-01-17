from fastapi import Header, HTTPException
from auth_utils import decode_token

def get_payload(Authorization: str = Header(None)):
    if not Authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    try:
        token = Authorization.split(" ")[1]
    except:
        raise HTTPException(status_code=401, detail="Invalid token format")

    payload = decode_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return payload   # contains user_id + role


def admin_required(payload):
    if payload["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
