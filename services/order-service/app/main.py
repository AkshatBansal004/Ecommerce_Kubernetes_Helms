from fastapi import FastAPI
import os
import requests
from prometheus_fastapi_instrumentator import Instrumentator
app = FastAPI()

USER_SERVICE = os.getenv("USER_SERVICE_URL", "http://user-service:8000")
PRODUCT_SERVICE = os.getenv("PRODUCT_SERVICE_URL", "http://product-service:8000")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/orders")
def get_orders():

    users = requests.get(f"{USER_SERVICE}/users").json()
    products = requests.get(f"{PRODUCT_SERVICE}/products").json()

    return {
        "order_id": 5001,
        "user": users[0],
        "product": products[0]
    }
Instrumentator().instrument(app).expose(app)