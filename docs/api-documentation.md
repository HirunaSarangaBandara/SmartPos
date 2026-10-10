# SmartPOS — REST API Documentation

> **Status:** Day 3 draft. The health endpoint is established in Day 2. The local Firebase test endpoints are available **only if** the corresponding controller has been added and the Spring Boot `local` profile is active. Business endpoints below are **planned**, not yet implemented.

## 1. Overview

- **Backend:** Spring Boot (Java 21)
- **Local API base URL:** `http://localhost:8080/api/v1`
- **Data storage:** Cloud Firestore, accessed by Spring Boot via Firebase Admin SDK
- **Authentication (planned Day 4):** Firebase Authentication ID token, passed as `Authorization: Bearer <FIREBASE_ID_TOKEN>`
- **Permissions (planned Day 4):** Spring Security; `ADMIN` and `CASHIER` roles loaded from Firestore
- **Format:** JSON request/response bodies, unless otherwise specified

## 2. Initial Health Check (Day 2)

### `GET /health`

Public endpoint to confirm the backend is running.

**Example:**

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/health" -Method GET
```

**Expected success — HTTP 200:**

```json
{
  "status": "UP",
  "application": "SmartPOS",
  "message": "SmartPOS backend is running"
}
```

## 3. Local-Only Firebase Endpoints (Day 3)

> These endpoints are development utilities. They must exist only under the `local` Spring profile, should bind only to loopback, and must not be exposed in production. If you haven't implemented the controller yet, treat these examples as planned local tests.

### `GET /dev/firebase-status`

Attempts a read against the Firestore emulator to verify the backend database connection.

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/dev/firebase-status" -Method GET
```

**Expected success — HTTP 200:**

```json
{
  "status": "CONNECTED",
  "database": "Cloud Firestore Emulator",
  "message": "Firebase connection successful"
}
```

### `POST /dev/seed`

Seeds fixed **disposable local** demonstration documents (if `FirebaseSeedService` has been implemented): `categories/stationery`, `products/product-001`, and `settings/business`. Re-running can overwrite these particular sample documents.

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/dev/seed" -Method POST
```

**Expected success — HTTP 201:**

```json
{
  "status": "SUCCESS",
  "message": "Local demo data created",
  "productId": "product-001",
  "categoryId": "stationery"
}
```

### `GET /dev/products`

Lists at most 20 product documents from the emulator. This is a temporary connectivity check, **not** the secured production product API.

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/dev/products" -Method GET |
    ConvertTo-Json -Depth 5
```

**Example response — HTTP 200:**

```json
[
  {
    "id": "product-001",
    "name": "Notebook A5",
    "sku": "NB-A5-001",
    "categoryId": "stationery",
    "priceMinor": 45000,
    "stockQuantity": 100,
    "reorderLevel": 10,
    "active": true
  }
]
```

Timestamp fields may also appear.

## 4. Planned Business Endpoints

All endpoints below are **not yet implemented**. Their payloads and permissions are initial contracts, subject to refinement during development.

| Method | Endpoint | Purpose | Role | Target day |
|---|---|---|---|---|
| `GET` | `/users/me` | Current employee profile | Authenticated | 4 |
| `GET` | `/products` | Product listing / search | Admin, Cashier | 5 |
| `GET` | `/products/{id}` | Get product | Admin, Cashier | 5 |
| `POST` | `/products` | Create product | Admin | 5 |
| `PUT` | `/products/{id}` | Update product | Admin | 5 |
| `PATCH` | `/products/{id}/status` | Activate/deactivate product | Admin | 5 |
| `POST` | `/inventory/adjustments` | Adjust stock and record movement | Admin | 7 |
| `GET` | `/inventory/movements` | Inventory history | Admin | 7 |
| `POST` | `/sales` | Atomic cash checkout | Admin, Cashier | 9 |
| `GET` | `/sales` | Permitted sale history | Admin, Cashier | 10 |
| `GET` | `/sales/{id}/receipt` | Receipt data | Authorized employee | 10 |
| `GET` | `/reports/sales-summary` | Daily completed-sales summary | Admin | 10 |

## 5. Example Requests (Planned)

### Create a product — `POST /products`

```http
POST /api/v1/products
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: application/json
```

```json
{
  "name": "Notebook A5",
  "sku": "NB-A5-001",
  "categoryId": "stationery",
  "priceMinor": 45000,
  "initialStockQuantity": 100,
  "reorderLevel": 10
}
```

The server validates the request, enforces SKU uniqueness, and creates an initial stock audit record. Intended success status: `201 Created`.

### Adjust inventory — `POST /inventory/adjustments`

```json
{
  "productId": "product-001",
  "quantityDelta": 20,
  "reason": "New stock received"
}
```

The server checks permissions, validates that the resulting stock is nonnegative, and atomically updates the product quantity and movement history.

### Complete a cash sale — `POST /sales`

```http
POST /api/v1/sales
Authorization: Bearer <FIREBASE_ID_TOKEN>
Idempotency-Key: <UNIQUE_REQUEST_ID>
Content-Type: application/json
```

```json
{
  "items": [
    { "productId": "product-001", "quantity": 2 }
  ],
  "paymentMethod": "CASH",
  "amountTenderedMinor": 100000
}
```

The server recalculates prices/totals, verifies stock and cash tendered, then atomically writes the sale, stock deductions, movement logs and idempotency record. Never trust prices or totals supplied by the client.

## 6. Planned Error Semantics

| HTTP status | Meaning | Example |
|---|---|---|
| `400` | Invalid request | Negative quantity |
| `401` | Unauthenticated | Missing or invalid token |
| `403` | Forbidden | Cashier modifies products |
| `404` | Not found | Unknown product ID |
| `409` | Conflict | Duplicate SKU or insufficient stock |
| `500` | Unexpected server failure | Internal exception |
| `503` | Dependency temporarily unavailable | Firestore service unavailable |

Error response shape will be standardized when the business controllers are implemented. Avoid exposing exception traces or credentials in production responses.

## 7. Security and Development Notes

1. Firebase Web SDK performs employee sign-in; Spring Boot verifies Firebase ID tokens.
2. Spring Boot—not the browser—enforces Admin/Cashier permissions and application rules.
3. Firestore client Security Rules deny direct business data access in the planned API-only architecture.
4. Local `/dev/**` routes are only for testing. Do **not** deploy the `local` Spring profile or expose the seed endpoint on the internet.
5. Emulator and production settings must be isolated.
6. All sample endpoints and payloads should be updated to match actual implementation before marking them complete.

## 8. Verification Checklist

- [ ] `GET /health` returns `UP`.
- [ ] Firebase emulators run on configured ports.
- [ ] `GET /dev/firebase-status` returns `CONNECTED` under `local`.
- [ ] `POST /dev/seed` inserts emulator test records (if implemented).
- [ ] `GET /dev/products` returns the sample Notebook A5 (if implemented).
- [ ] Default-profile backend tests pass.
- [ ] No development-only endpoints are publicly deployed.