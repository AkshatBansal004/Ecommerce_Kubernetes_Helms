from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/users")
def get_users():
    return [
        {"id": 1, "name": "Akshat"},
        {"id": 2, "name": "DevOps Engineer"}
    ]

Instrumentator().instrument(app).expose(app)