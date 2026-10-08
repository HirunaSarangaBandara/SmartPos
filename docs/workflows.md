# SmartPOS — Business Workflows

These represent intended behavior, not yet implemented code.

## 1. Employee Sign-In
```mermaid
flowchart TD
  A[Open SmartPOS] --> B[Enter email and password]
  B --> C[Firebase Authentication]
  C --> D{Sign-in successful?}
  D -->|No| E[Show sign-in error]
  D -->|Yes| F[Send ID token to Spring Boot]
  F --> G{Active employee and authorized role?}
  G -->|No| H[Show access denied]
  G -->|Yes| I[Open authorized dashboard]
```

## 2. Product Maintenance (Admin)
```mermaid
flowchart TD
  A[Admin opens products] --> B[Create or edit product]
  B --> C[React validates form]
  C --> D[Send authenticated API request]
  D --> E{Backend role and data valid?}
  E -->|No| F[Return 400, 403, or 409 error]
  E -->|Yes| G[Write Firestore product and SKU reservation]
  G --> H[Return saved product]
  H --> I[Refresh listing]
```

Use a backend-owned uniqueness mechanism for SKU. Product deactivation retains historic sales.

## 3. Manual Stock Adjustment (Admin)
```mermaid
flowchart TD
  A[Admin selects product] --> B[Enter signed quantity change and reason]
  B --> C[Send adjustment request]
  C --> D[Start Firestore transaction]
  D --> E[Read current quantity]
  E --> F{New quantity at least zero?}
  F -->|No| G[Reject; no writes]
  F -->|Yes| H[Update stock and write movement]
  H --> I[Commit transaction]
  I --> J[Show updated stock]
```

## 4. Cash Sale Checkout
```mermaid
flowchart TD
  A[Cashier selects active products] --> B[Build cart with whole-unit quantities]
  B --> C[Enter tendered cash]
  C --> D[Submit request with idempotency key]
  D --> E[Backend authenticates and validates request]
  E --> F[Firestore transaction: check existing key and read products]
  F --> G{Stock and cash sufficient?}
  G -->|No| H[Reject without partial changes]
  G -->|Yes| I[Recalculate totals from stored prices]
  I --> J[Write sale, stock changes and movements]
  J --> K[Commit transaction]
  K --> L[Return saved receipt data]
  L --> M[Show printable receipt]
```

### Idempotency and retries
- A unique idempotency key is generated **once per checkout attempt**.
- A retry with the same key and identical payload returns the original sale; differing payload for that key is rejected.
- The backend must enforce this atomically; disabling the button alone is insufficient.
- If the network breaks after submission, the UI must not assert failure or success prematurely. Retry safely with the same key to determine the outcome.
- Firestore transaction callbacks can retry, so do not send emails, print or invoke external payment APIs inside them.

### Concurrent checkout example
For one remaining item, two cashiers submit a sale simultaneously. The transaction mechanism must allow at most one successful decrement; the other receives an insufficient-stock or retry failure. No negative quantity is allowed.

## 5. Receipt and Sales History
1. Completed sale has a receipt ID, stored line-item name/price snapshots, timestamps and cashier UID.
2. Authorized user opens own receipt; Admin may open any receipt.
3. Receipt is displayed as printable HTML; browser print dialog handles printing.
4. Sales history supports bounded queries / pagination and uses the authorized user scope.

## 6. Admin Daily Summary
1. Admin selects a business date.
2. Backend computes correct UTC interval for the configured store timezone.
3. Query completed sales in that interval.
4. Return count and total in integer minor units; frontend formats currency.
5. Confirm totals against a small known dataset. For large volumes, later add aggregations.

## 7. Errors to Handle
| Situation | Expected behavior |
|---|---|
| Wrong login | Generic authentication error; no data access. |
| Cashier requests admin API | HTTP 403; no update. |
| Duplicate SKU | HTTP 409; no second product. |
| Invalid product quantity/price | HTTP 400; clear field error. |
| Insufficient stock | Checkout rejected; no sale or stock write. |
| Cash tendered below payable | Checkout rejected; no sale. |
| Duplicate checkout retry | Original sale result returned when matching. |
| Temporary network failure | Safe retry with same key; avoid false success notices. |

## 8. Manual Demo Script
1. Log in as Admin and create a product with stock 10.
2. Adjust stock by +5; verify stock movement and quantity 15.
3. Log in as Cashier and sell quantity 2.
4. Verify receipt, saved sale, and stock quantity 13.
5. Replay checkout key and confirm quantity stays 13.
6. Attempt to sell 14; confirm rejection with stock unchanged.
7. Log in as Admin and verify daily sales summary.
8. Confirm Cashier cannot edit products.