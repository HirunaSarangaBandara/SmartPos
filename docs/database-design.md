# SmartPOS — Cloud Firestore Database Design

> **Status:** Day 3 design specification. Sample emulator records are for development; business collections and validation logic will be implemented incrementally.

## 1. Overview

SmartPOS is a single-store POS and inventory management MVP using **Cloud Firestore (Native mode)**. React signs employees in using Firebase Authentication and sends authenticated HTTP requests to Spring Boot. **Spring Boot is the only component allowed to read or write authoritative business data** through the Firebase Admin SDK.

```text
React + Firebase Web Authentication
            |
   REST API + Firebase ID token
            v
Spring Boot + Spring Security
            |
       Admin SDK
            v
       Cloud Firestore
```

Firestore is a document database, not relational SQL. Collections contain documents, and the backend must enforce relationships, unique SKUs, valid stock and prices, and authorization.

## 2. Collections

| Collection | Document ID | Purpose | MVP priority |
|---|---|---|---|
| `users` | Firebase Authentication UID | Employee details, role and active status | Essential |
| `categories` | Category ID | Product categorization | Basic seeded values |
| `products` | Product ID | Catalog, prices and current stock | Essential |
| `skuReservations` | Safe normalized SKU key | SKU uniqueness | Essential |
| `stockMovements` | Generated movement ID | Inventory audit log | Essential |
| `sales` | Generated sale ID | Completed checkout records and receipt snapshots | Essential |
| `checkoutRequests` | Stable idempotency key scoped to store/cashier | Deduplicate retry requests | Essential (Day 9) |
| `settings` | `business` | Receipt/business settings | Basic |

### `users/{uid}`

| Field | Type | Notes |
|---|---|---|
| `name` | string | Display name |
| `email` | string | Corresponding Firebase Auth email |
| `role` | string | `ADMIN` or `CASHIER` |
| `active` | boolean | Backend rejects access if false |
| `createdAt` | timestamp | Server-generated |

```json
{
  "name": "Demo Cashier",
  "email": "cashier@example.test",
  "role": "CASHIER",
  "active": true
}
```

**Do not store passwords in Firestore.** A user document's ID must match the actual Firebase Authentication UID. Only trusted backend/admin provisioning may assign roles.

### `categories/{categoryId}`

| Field | Type | Notes |
|---|---|---|
| `name` | string | Required |
| `description` | string | Optional |
| `active` | boolean | Default true |

Sample: `categories/stationery` with `name: "Stationery"`.

### `products/{productId}`

| Field | Type | Notes |
|---|---|---|
| `name` | string | Required, nonblank |
| `sku` | string | Unique, normalized |
| `categoryId` | string | Existing category ID, if provided |
| `priceMinor` | integer | Price in minor currency units, >= 0 |
| `stockQuantity` | integer | >= 0 |
| `reorderLevel` | integer | >= 0 |
| `active` | boolean | Deactivate instead of permanently deleting |
| `createdAt` | timestamp | Server-generated |
| `updatedAt` | timestamp | Server-generated |

```json
{
  "name": "Notebook A5",
  "sku": "NB-A5-001",
  "categoryId": "stationery",
  "priceMinor": 45000,
  "stockQuantity": 100,
  "reorderLevel": 10,
  "active": true
}
```

With a currency convention of two fractional digits, `priceMinor: 45000` means **LKR 450.00**. Use integer arithmetic in the backend; do not trust client-provided totals.

### `skuReservations/{skuKey}`

| Field | Type | Notes |
|---|---|---|
| `productId` | string | Owner product ID |

Normalize SKU before generating a safe document key (for example uppercase/trim and an encoded key). Product creation and SKU reservation **must be atomic**. SKU changes must atomically release/reserve keys while avoiding conflicts.

### `stockMovements/{movementId}`

| Field | Type | Notes |
|---|---|---|
| `productId` | string | Related product |
| `type` | string | `INITIAL_STOCK`, `ADJUSTMENT`, `SALE` |
| `quantityDelta` | integer | Negative for a deduction |
| `previousQuantity` | integer | Snapshot before update |
| `newQuantity` | integer | Snapshot after update |
| `reason` | string | Adjustment reason or sale reference |
| `performedBy` | string | Employee UID |
| `saleId` | string/null | Populated for sale-linked movements |
| `createdAt` | timestamp | Server-generated |

Inventory adjustments and their movement records must commit in a single Firestore transaction.

### `sales/{saleId}`

| Field | Type | Notes |
|---|---|---|
| `receiptNumber` | string | Unique customer-facing reference |
| `cashierId` | string | Firebase employee UID |
| `items` | array of objects | Immutable product snapshots |
| `subtotalMinor` | integer | Backend-calculated |
| `discountMinor` | integer | Initially 0 |
| `totalMinor` | integer | Backend-calculated |
| `amountTenderedMinor` | integer | Cash received |
| `changeMinor` | integer | Cash change |
| `paymentMethod` | string | `CASH` for MVP |
| `status` | string | `COMPLETED` for MVP |
| `createdAt` | timestamp | Server-generated |

Each item stores `productId`, `productName`, `sku`, `quantity`, `unitPriceMinor`, and `lineTotalMinor` so old receipts remain correct after product updates.

```json
{
  "receiptNumber": "SALE-EXAMPLE-001",
  "cashierId": "firebase-cashier-uid",
  "items": [
    {
      "productId": "product-001",
      "productName": "Notebook A5",
      "sku": "NB-A5-001",
      "quantity": 2,
      "unitPriceMinor": 45000,
      "lineTotalMinor": 90000
    }
  ],
  "subtotalMinor": 90000,
  "discountMinor": 0,
  "totalMinor": 90000,
  "amountTenderedMinor": 100000,
  "changeMinor": 10000,
  "paymentMethod": "CASH",
  "status": "COMPLETED"
}
```

### `checkoutRequests/{requestKey}` (planned for Day 9)

Stores an idempotency request identifier and linked `saleId`, plus a request fingerprint and completion information. The backend must compare repeated requests with the original payload; a reused key with different payload must fail. Create/update this record atomically with the sale to prevent duplicate transactions.

### `settings/business`

| Field | Type | Notes |
|---|---|---|
| `businessName` | string | On printed receipt |
| `currency` | string | Start with `LKR` |
| `address` | string | Optional |
| `receiptFooter` | string | Optional |

## 3. Business Rules and Relationships

1. Each employee application record is linked to a Firebase Authentication UID.
2. A product optionally refers to an existing category.
3. Each sale belongs to the cashier who processed it.
4. Each sale item contains a snapshot, not a live join to product price/name.
5. Product SKU uniqueness is enforced by a backend-managed reservation document.
6. Stock must never be negative; every change requires a corresponding movement record.
7. The backend recalculates the subtotal, total, tendered amount and change.
8. Sale creation, stock deduction, audit movements and idempotency must be handled atomically.
9. Store timestamps as Firestore timestamps and display them in the appropriate local timezone.
10. Historical products and sales are preserved; deactivate products rather than deleting their history.

## 4. Query and Index Plan

Start with small, bounded queries. Add Firestore composite indexes only when specific queries require them:

- Products: by active status, optionally category, bounded pagination and search strategy.
- Sales: by `cashierId` and `createdAt` for cashier history; by `createdAt` for admin reports.
- Stock movements: by `productId` and `createdAt`.
- Reports: compute basic summaries from a bounded date range; consider pre-aggregated counters later if queries become expensive.

Firestore is not a full-text search engine; basic SKU/prefix search should have clearly defined MVP behavior. Avoid promising arbitrary substring search without a separate indexing design.

## 5. Security

- Firebase Authentication handles sign-in and token issuance.
- Spring Boot validates ID tokens and loads `users/{uid}` to determine current employee roles and active status.
- Spring Security guards each business API operation.
- The React app must not directly read or write business Firestore collections.
- Firestore client rules deny direct access for this API-only design; the Admin SDK bypasses those rules.
- Local emulator endpoints and seed routes must never be deployed publicly.
- Service-account credentials must not be committed to GitHub.

## 6. Local Development

| Service | Address |
|---|---|
| React | `http://localhost:5173` |
| Spring Boot | `http://localhost:8080` |
| Firebase Auth emulator | `127.0.0.1:9099` |
| Firestore emulator | `127.0.0.1:8085` |
| Emulator UI | `http://127.0.0.1:4000` |

Use the same Firebase project ID across React, Spring Boot and emulators. Emulator records are disposable unless exported and restored.

## 7. Status and Next Steps

- **Day 3:** Database design and local emulator connectivity; optional sample category/product/business-settings seed.
- **Day 4:** Employee authentication, role enforcement and `/users/me`.
- **Day 5:** Product CRUD, validation and SKU uniqueness.
- **Day 7:** Audited stock adjustments.
- **Day 9:** Atomic and idempotent checkout.
- **Day 10:** Receipts, sales history and daily summary.

> These document shapes define the **planned contract**. They do not imply the corresponding APIs and validations are already implemented.