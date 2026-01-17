from fastapi import (
    APIRouter, Depends, HTTPException,
    UploadFile, File, WebSocket,
    WebSocketDisconnect, Query
)
from pydantic import BaseModel
from datetime import datetime
import os
from uuid import uuid4

from json_db import load_db, save_db
from role_utils import get_payload
from auth_utils import decode_token

router = APIRouter(prefix="/chat", tags=["Chat"])

# ================= UPLOAD CONFIG =================

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ================= CONNECTION MANAGER =================

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, list[WebSocket]] = {}

    async def connect(self, group_id: int, websocket: WebSocket):
        self.active_connections.setdefault(group_id, []).append(websocket)

    def disconnect(self, group_id: int, websocket: WebSocket):
        if group_id in self.active_connections:
            if websocket in self.active_connections[group_id]:
                self.active_connections[group_id].remove(websocket)
            if not self.active_connections[group_id]:
                del self.active_connections[group_id]

    async def broadcast(self, group_id: int, message: dict):
        # 🔐 ENSURE NO BYTES EVER
        for k, v in message.items():
            if isinstance(v, (bytes, bytearray)):
                raise ValueError(f"❌ BYTES FOUND IN PAYLOAD: {k}")

        for ws in self.active_connections.get(group_id, []):
            await ws.send_json(message)

manager = ConnectionManager()

# ================= SCHEMA =================

class MessageCreate(BaseModel):
    message: str

# ================= REST: SEND TEXT MESSAGE =================

@router.post("/{group_id}")
def send_message(
    group_id: int,
    data: MessageCreate,
    payload: dict = Depends(get_payload)
):
    db = load_db()
    user_id = payload["user_id"]

    if not any(
        gm["group_id"] == group_id and gm["user_id"] == user_id
        for gm in db.get("group_members", [])
    ):
        raise HTTPException(status_code=403, detail="Not allowed")

    msg = {
        "id": len(db.get("messages", [])) + 1,
        "group_id": group_id,
        "sender_id": user_id,
        "message": data.message,
        "timestamp": datetime.utcnow().isoformat()
    }

    db.setdefault("messages", []).append(msg)
    save_db(db)

    return msg

# ================= GET GROUP MESSAGES =================

@router.get("/{group_id}")
def get_messages(group_id: int, payload: dict = Depends(get_payload)):
    db = load_db()
    user_id = payload["user_id"]
    role = payload.get("role")

    is_member = any(
        gm["group_id"] == group_id and gm["user_id"] == user_id
        for gm in db.get("group_members", [])
    )

    if role != "admin" and not is_member:
        raise HTTPException(status_code=403, detail="Not allowed")

    result = []
    for m in db.get("messages", []):
        if m["group_id"] == group_id:
            user = next(
                (u for u in db.get("users", []) if u["id"] == m["sender_id"]),
                None
            )
            result.append({
                "sender_id": m["sender_id"],
                "sender": user.get("name", user.get("email")) if user else "Unknown",
                "message": m["message"],
                "time": m["timestamp"],
                "type": "text"
            })

    return result

# ================= FILE / IMAGE UPLOAD =================

@router.post("/upload")
def upload_file(file: UploadFile = File(...)):
    try:
        print("UPLOAD STARTED")
        print("Filename:", file.filename)
        print("Content-Type:", file.content_type)

        ext = file.filename.split(".")[-1]
        unique_name = f"{uuid4()}.{ext}"
        path = os.path.join(UPLOAD_DIR, unique_name)

        with open(path, "wb") as f:
            content = file.file.read()
            print("BYTES SIZE:", len(content))
            f.write(content)

        print("UPLOAD SUCCESS")

        return {
            "file_url": f"/uploads/{unique_name}",
            "file_name": file.filename,
            "file_type": file.content_type
        }

    except Exception as e:
        print("UPLOAD ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

# ================= WEBSOCKET CHAT =================

@router.websocket("/ws/{group_id}")
async def websocket_chat(
    websocket: WebSocket,
    group_id: int,
    token: str = Query(...)
):
    await websocket.accept()
    print("WS ACCEPTED")

    payload = decode_token(token)
    if not payload:
        print("JWT INVALID")
        await websocket.close()
        return

    sender_id = payload["user_id"]
    db = load_db()

    await manager.connect(group_id, websocket)
    print("WS CONNECTED FOR USER", sender_id)

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type", "text")

            user = next(
                (u for u in db.get("users", []) if u["id"] == sender_id),
                None
            )

            base_payload = {
                "sender_id": sender_id,
                "sender": user.get("name", user.get("email")) if user else "Unknown",
                "time": datetime.utcnow().isoformat(),
                "type": msg_type
            }

            if msg_type == "text":
                message = data.get("message")
                if not message:
                    continue
                base_payload["message"] = message

            elif msg_type == "file":
                # ✅ ONLY STRINGS — NO BYTES
                base_payload["file_url"] = str(data.get("file_url"))
                base_payload["file_name"] = str(data.get("file_name"))
                base_payload["file_type"] = str(data.get("file_type"))

            await manager.broadcast(group_id, base_payload)

    except WebSocketDisconnect:
        print("CLIENT DISCONNECTED")
        manager.disconnect(group_id, websocket)
