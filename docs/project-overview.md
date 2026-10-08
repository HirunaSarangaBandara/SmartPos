# SmartPOS — Project Overview

**Version:** 0.1 (planning)  
**Status:** Under development  
**Development target:** 14-day single-store MVP  
**Technology:** React + TypeScript, Spring Boot (Java 21), Firebase Authentication, Cloud Firestore

## 1. Problem Statement
Small retail shops may rely on handwritten records or disconnected tools to record sales and monitor stock. This can make inventory counts, transaction history, and end-of-day totals difficult to maintain consistently.

## 2. Proposed Solution
SmartPOS is a browser-based point-of-sale and inventory application. Authorized employees can maintain a product catalog, adjust stock, conduct cash sales, print receipts, and review permitted transactions. The React client uses a Spring Boot REST API; Spring Boot verifies Firebase ID tokens and controls Firestore operations.

## 3. Project Objectives
1. Support secure sign-in for administrators and cashiers.
2. Maintain an accurate product catalog and stock balances.
3. Complete cash sales without overselling or duplicate checkout records.
4. Keep an auditable history of inventory adjustments and sales.
5. Generate printable receipts and a simple daily sales summary.
6. Deliver a reproducible, documented, tested demonstration MVP.

## 4. Intended Users
- **Administrator:** product management, inventory adjustments, all sales, reports, employee provisioning.
- **Cashier:** product lookup, cash checkout, receipt printing, own sales history.

## 5. Architecture
```text
React + Firebase Web Authentication
              |
       HTTPS + ID token
              v
Spring Boot REST API + Spring Security
              |
       Firebase Admin SDK
              v
       Cloud Firestore
```
The React client does **not** directly modify business collections. Server-side authorization remains mandatory because the Firebase Admin SDK bypasses Firestore Security Rules.

## 6. MVP Business Assumptions
- One store, one stock location, cash-only payments, online-only selling.
- Two roles: `ADMIN` and `CASHIER`.
- Products are deactivated instead of deleting historical records.
- Negative inventory is not permitted.
- Prices are stored as integer minor currency units (e.g., 45000 = LKR 450.00).
- Server validates products and calculates totals; the client never determines authoritative prices.
- Checkout uses a Firestore transaction and an idempotency key.
- Printable HTML receipts; no PDF generator required.

## 7. Success Measures
- An admin can create products and adjust stock.
- A cashier can complete a valid sale and print its receipt.
- A checkout fails safely when stock is insufficient.
- Repeated requests with the same idempotency key do not duplicate sales.
- A cashier cannot access administrator-only endpoints.
- A daily summary matches completed test sales.
- Another developer can run the application using the README and Firebase emulators.

## 8. Constraints
- Approximately 14 days with one developer assumed (6–8 focused hours/day).
- This is an academic/demo-ready MVP, **not** a certified commercial POS.
- Firebase and cloud deployment may require account setup and billing decisions.
- Tax, fiscal receipt, and local regulatory requirements must be checked before real business use.

## 9. Planned Delivery
Source repository, frontend, backend, Firebase configuration templates, basic tests, setup documentation, sample emulator data/seed instructions, a presentation/demo, and a tagged release. Live cloud deployment is optional.

## 10. Open Decisions
- [ ] Confirm single-store retail context and currency (LKR assumed for examples).
- [ ] Confirm discounts/taxes will be excluded from first MVP checkout.
- [ ] Confirm whether products can be sold in fractional units (assume no).
- [ ] Confirm demo-only receipt numbering scheme (use unique IDs; not fiscal numbering).
- [ ] Confirm public/private GitHub visibility and final license.