import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "data.json")

def load_db():
    with open(DB_PATH, "r") as file:
        return json.load(file)

def save_db(data):
    with open(DB_PATH, "w") as file:
        json.dump(data, file, indent=4)
