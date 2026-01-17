# backend/database.py
from pymongo import MongoClient # type: ignore
import os

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["taskmanager"]
users_collection = db["users"]
tasks_collection = db["tasks"]
