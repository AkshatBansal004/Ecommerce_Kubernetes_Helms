# Ecommerce Platform

A microservices-based ecommerce demo platform with:
- `user-service` (FastAPI)
- `product-service` (FastAPI)
- `order-service` (FastAPI, aggregates user + product)
- `api-gateway` (Nginx reverse proxy)
- `frontend` (static dashboard served by gateway)

## Architecture

```text
Browser (http://localhost:8080)
        |
        v
api-gateway (Nginx)
  /users    -> user-service:8000
  /products -> product-service:8000
  /orders   -> order-service:8000
                 |-> user-service:8000/users
                 |-> product-service:8000/products
```

## Repository Structure

```text
api-gateway/           # Nginx config + Dockerfile
frontend/              # UI files (index.html, styles.css, app.js)
services/
  user-service/
  product-service/
  order-service/
docker-compose.yml     # Local development stack
helm/
  ecommerce-platform/  # Umbrella chart
  user-svc/            # User service chart
  product-svc/         # Product service chart
  order-svc/           # Order service chart
k8s/                   # Raw Kubernetes manifests (alternative to Helm)
```

## Prerequisites

- Docker + Docker Compose
- (Optional for Kubernetes) `kubectl`, `helm`

## Run Locally (Docker Compose)

From project root:

```bash
docker compose down --remove-orphans
docker compose up -d --build
docker compose ps
```

Open:
- UI: `http://localhost:8080`

API endpoints:
- `GET http://localhost:8080/health`
- `GET http://localhost:8080/users`
- `GET http://localhost:8080/products`
- `GET http://localhost:8080/orders`

Logs:

```bash
docker compose logs -f
```

Stop:

```bash
docker compose down
```

## Helm Deployment

The active umbrella chart path is:
- `helm/ecommerce-platform`

Update dependencies and render:

```bash
helm dependency update helm/ecommerce-platform
helm template shop helm/ecommerce-platform
```

Install/upgrade:

```bash
helm upgrade --install shop helm/ecommerce-platform -n ecommerce --create-namespace
kubectl get pods,svc -n ecommerce
```

Note:
- `helm/ecommerce-platform/values.yaml` has `platform.enabled: false` by default, so only subcharts (`user-svc`, `product-svc`, `order-svc`) are deployed from the umbrella chart.

## Service Notes

- All FastAPI services expose `/health`.
- `order-service` calls:
  - `${USER_SERVICE_URL}/users`
  - `${PRODUCT_SERVICE_URL}/products`
- In Compose, these envs are set to:
  - `http://user-service:8000`
  - `http://product-service:8000`

## Frontend

- Frontend is served by `api-gateway` from `/usr/share/nginx/html`.
- UI fetches data from:
  - `/users`
  - `/products`
  - `/orders`
- No backend API contract changes required.

## Troubleshooting

### 1) `docker compose up` container name conflict

```bash
docker compose down --remove-orphans
docker compose up -d --build
```

### 2) UI loads but CSS not applied

Rebuild gateway and hard refresh:

```bash
docker compose up -d --build api-gateway
```

Then browser hard refresh (`Ctrl+Shift+R`).

### 3) Helm path error (`could not find ecommerce-platform`)

Use:

```bash
helm dependency update helm/ecommerce-platform
```

not `helm dependency update ecommerce-platform`.

## Future Improvements

- Add persistent datastore (PostgreSQL/MySQL)
- Add API gateway auth/rate-limit
- Add CI pipeline for image tagging and Helm release
- Add integration tests for service-to-service contract

