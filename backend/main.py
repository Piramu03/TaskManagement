from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import user_routes,task_routes
from fastapi.openapi.utils import get_openapi

from activity_routes import router as activity_router
from notification_routes import router as notification_router
from group_routes import router as group_router
from chat_routes import router as chat_router
from fastapi.staticfiles import StaticFiles






app = FastAPI(
    title="Task Manager API",
    version="1.0.0",
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    swagger_ui_parameters={
        "defaultModelsExpandDepth": -1,
        "displayRequestDuration": True,
        "persistAuthorization": True  # <-- IMPORTANT!
    }

)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(user_routes.router)
app.include_router(task_routes.router)
app.include_router(activity_router)
app.include_router(notification_router)
app.include_router(group_router)
app.include_router(chat_router)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="Task Manager API",
        version="1.0.0",
        description="Task Manager Backend with JWT Authentication",
        routes=app.routes,
    )

    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }

    openapi_schema["security"] = [{"BearerAuth": []}]

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi




@app.get("/")
def home():
    return {"message": "Backend Running Successfully!"}
