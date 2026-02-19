from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator
app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/products")
def get_products():
    return [
        {"id": 101, "name": "iPhone"},
        {"id": 102, "name": "MacBook"}
    ]
Instrumentator().instrument(app).expose(app)