# SmartPOS — MVP Scope and Scope Freeze

**Timeline:** 14 days  
**Target:** Tested, documented, demonstration-ready single-store MVP.

## 1. In Scope (P0 — Required)
- Employee sign-in/out via Firebase Authentication and backend role authorization.
- Admin/Cashier roles; test accounts provisioned through a controlled setup process.
- Product creation, editing, search/listing, and deactivation.
- Inventory adjustment with stock movement history.
- Cashier cart and cash checkout.
- Backend price and stock validation; atomic sale + stock updates.
- Idempotency-protected checkout requests.
- Basic printable receipt and authorized sales history.
- Admin daily sales count/total summary.
- Local Firebase Emulator configuration, tests, setup guide, and release package.

## 2. If Time Allows (P1 — Optional)
- Category CRUD interface (initially a fixed category field is acceptable).
- Low-stock report/filter.
- Employee management interface (use controlled demo seeds instead).
- More complete dashboards, CSV export, UI polish, additional E2E automation.
- Deployment to Firebase Hosting + Cloud Run (reproducible local delivery is the fallback).

## 3. Out of Scope (P2 — Later Releases)
- Card/online payments, payment gateway integration.
- Tax calculations, discount engines, fiscal receipt compliance.
- Refunds/returns/exchanges.
- Barcode hardware integration and product image uploads.
- Supplier purchasing and multi-store inventory.
- Customer profiles, loyalty and notifications.
- Offline checkout, queues and conflict synchronization.
- Advanced real-time analytics and enterprise scalability.

## 4. Scope Rules
- **Store:** exactly one store and one inventory location in MVP.
- **Currency:** examples use LKR in minor units; implementation may make display configurable.
- **Payment:** record cash tendered and change only.
- **Product quantities:** whole-number units only.
- **Inventory:** no negative balances.
- **Historical data:** preserve sale item snapshots and deactivate products instead of hard-deleting.
- **Receipt:** browser-printable HTML, not required to generate PDF.
- **Reporting:** completed sales only; one daily aggregation is sufficient.

## 5. Time-Box Priorities
| By day | Expected outcome | Contingency |
|---|---|---|
| 3 | Setup, Firebase, agreed API/data contracts | Fix configuration before new features. |
| 6 | Authentication and product CRUD | Drop category UI and cosmetic features. |
| 9 | Atomic cash checkout | Stop reporting work until sales are correct. |
| 11 | Integrated core workflow tests | Fix critical defects only. |
| 14 | Final documentation, stable local demo, release | Skip cloud deployment if blocked. |

## 6. MVP Acceptance
A reviewer can start the stack from documentation, authenticate as each role, add/edit a product as Admin, adjust stock, check out as Cashier, print a receipt, and verify daily completed sales. Invalid, duplicated, and concurrent checkout attempts must not corrupt inventory or create duplicate sales.

## 7. Change Control
Any new feature requires removing or postponing another item of comparable effort. No new feature work after Day 10 unless it is necessary to meet a P0 acceptance criterion.