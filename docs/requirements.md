# SmartPOS — Software Requirements Specification

**Status:** Proposed MVP requirements, not implemented functionality.  
**Priority legend:** `P0` = required for submission; `P1` = desirable if time permits; `P2` = future.

## 1. Scope
Single-store, online-only, cash-sale POS with basic product, inventory, user permission, receipt, and reporting functions. See [MVP scope](mvp-scope.md).

## 2. Functional Requirements
| ID | Priority | Requirement | Acceptance criteria |
|---|---|---|---|
| FR-01 | P0 | Employee email/password login and logout | Active employee can sign in and log out; invalid credentials are rejected. |
| FR-02 | P0 | Backend access control | No token → 401; insufficient role → 403; inactive employees cannot operate. |
| FR-03 | P0 | Product creation | Admin can save a product with valid name, unique SKU and nonnegative price. |
| FR-04 | P0 | Product listing/search | Authorized employee can list products and search by name/SKU with bounded results. |
| FR-05 | P0 | Product editing/deactivation | Admin can edit permitted fields and deactivate; historical sales stay intact. |
| FR-06 | P0 | Manual stock adjustment | Admin can add/remove stock with a reason; resulting quantity cannot be negative. |
| FR-07 | P0 | Stock movement audit trail | Every successful manual adjustment and sale records corresponding movement entries atomically. |
| FR-08 | P0 | POS cart | Cashier can select active products, edit whole-number quantities and remove items. |
| FR-09 | P0 | Cash checkout | Backend checks current prices/stock, tendered amount, and creates sale + stock changes in a Firestore transaction. |
| FR-10 | P0 | Idempotent sale submission | Retry with same idempotency key and identical payload returns the same sale; mismatched payload is rejected. |
| FR-11 | P0 | Printable receipt | Completed sale provides store/receipt information, line items, total, tendered cash, change, date/time. |
| FR-12 | P0 | Sales history | Cashier sees their permitted sales; Admin sees all; results are paginated or date-bounded. |
| FR-13 | P0 | Basic daily report | Admin sees count and sum of completed sales for a selected business day. |
| FR-14 | P1 | Low-stock view | Admin can identify products at or below reorder threshold. |
| FR-15 | P1 | Category management UI | Admin can create/edit categories; defer UI and use a predefined category if necessary. |
| FR-16 | P1 | Employee management UI | Admin can provision or deactivate staff via the backend; initial demo may use controlled seed setup. |
| FR-17 | P2 | Returns, refunds, discounts, taxes, card payments | Deferred; requires additional business rules. |

## 3. Nonfunctional Requirements
| ID | Requirement | Verification |
|---|---|---|
| NFR-01 | Backend verifies Firebase ID tokens on protected APIs | Invalid/expired token tests. |
| NFR-02 | Backend enforces roles and active state | Admin/Cashier 401/403 tests. |
| NFR-03 | No partial checkout records or negative stock | Firestore transaction and concurrency tests. |
| NFR-04 | Checkout amounts use integer minor units | Unit tests for calculations and change. |
| NFR-05 | Inputs are validated server-side | Invalid SKU, quantity, price, and payment tests. |
| NFR-06 | No secrets committed to source control | Review `.gitignore`, CI and git history. |
| NFR-07 | Desktop and tablet workflows usable | Manual viewport/smoke testing. |
| NFR-08 | Errors are understandable and do not expose stack traces to users | API error response checks. |
| NFR-09 | Project runs against Firebase emulators locally | Fresh-clone setup verification. |
| NFR-10 | Tests and build commands documented | Execute documented checks on delivery version. |

## 4. Proposed API Contract (Not Yet Implemented)
API prefix: `/api/v1`. All endpoints except a health-check require a verified token.

| Method | Path | Roles | Purpose |
|---|---|---|---|
| GET | `/health` | Public | Health check (non-sensitive) |
| GET | `/users/me` | Active user | Current employee profile |
| GET | `/products` | Admin, Cashier | Search/list active and permitted products |
| GET | `/products/{id}` | Admin, Cashier | Product detail |
| POST | `/products` | Admin | Create product |
| PUT | `/products/{id}` | Admin | Edit product |
| PATCH | `/products/{id}/status` | Admin | Activate/deactivate product |
| POST | `/inventory/adjustments` | Admin | Adjust stock with reason |
| GET | `/inventory/movements` | Admin | Review stock changes |
| POST | `/sales` | Admin, Cashier | Atomic cash checkout; requires `Idempotency-Key` header |
| GET | `/sales` | Admin, Cashier | Authorized sales history |
| GET | `/sales/{id}/receipt` | Admin, authorized Cashier | Receipt data |
| GET | `/reports/sales-summary` | Admin | Daily sales report |
| GET | `/reports/low-stock` | Admin | Optional low-stock report |

### Sample product creation request
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

### Sample checkout request
Header: `Idempotency-Key: <UNIQUE_REQUEST_ID>`
```json
{
  "items": [{"productId": "product-001", "quantity": 2}],
  "paymentMethod": "CASH",
  "amountTenderedMinor": 100000
}
```
The backend obtains prices from Firestore and determines the total and change. Do not accept product price or total from the client as authoritative.

## 5. Proposed Firestore Collections
| Collection | Core fields |
|---|---|
| `users` | `uid`, `name`, `email`, `role`, `active`, `createdAt` |
| `products` | `name`, `sku`, `categoryId`, `priceMinor`, `stockQuantity`, `reorderLevel`, `active`, `createdAt`, `updatedAt` |
| `sales` | `receiptNumber`, `cashierId`, `items` (price/name snapshots), `totalMinor`, `amountTenderedMinor`, `changeMinor`, `paymentMethod`, `status`, `createdAt`, `idempotencyKey` |
| `stockMovements` | `productId`, `quantityDelta`, `previousQuantity`, `newQuantity`, `saleId`, `reason`, `performedBy`, `createdAt` |
| `skuReservations` | normalized SKU → product ID (enforce uniqueness atomically) |
| `categories` | Optional MVP: `name`, `active` |

Choose a deterministic sale document ID or an idempotency lookup design that can be checked and written within the transaction. Design must safely handle identical keys from different cashiers and differing payloads.

## 6. Key Business Rules
1. Stock must remain at least zero and sales require whole-number quantities greater than zero.
2. Product price is captured in the sale item at checkout time.
3. The backend computes totals in integer minor units; tax/discount excluded from v1 unless formally specified.
4. Only completed sales affect daily sales totals.
5. Timestamp storage uses UTC; display in store-local time.
6. An inactive product cannot be sold, and an inactive employee cannot transact.
7. Product deactivation does not change historical receipt line items.
8. Cash tendered must be at least total payable; change is computed on the server.

## 7. Test Acceptance Scenarios
- Admin product create/edit; duplicate SKU; invalid negative price.
- Cashier product create denied; unauthenticated sales denied.
- Stock increase/decrease; reject quantity below zero.
- Two cashiers attempt to buy the last unit: at most one succeeds.
- Same idempotency key replay: only one completed sale.
- Checkout with too little cash: no sale/stock change.
- Print past sale with original product name/price.
- Admin daily report sums completed sales correctly.

## 8. Definition of MVP Completion
All P0 features are implemented and critical scenarios pass; fresh setup and tests are documented; no known critical data integrity or access-control defects remain.