# SmartPOS — 14-Day Development Backlog

**Branch strategy:** `development` for daily work, `main` for reviewed/tested integration and final release. **No feature branches are required.** Open a pull request from `development` into `main` at tested milestones; do not merge failing or incomplete work.

**Priorities:** P0 required; P1 optional; P2 postponed.

## 1. Daily Tasks
| Day | ID | Priority | Issue / deliverable | Done when |
|---:|---|---|---|---|
| 1 | PLAN-01 | P0 | Scope, permissions, workflows, wireframes | Documentation reviewed; P0 criteria defined. |
| 2 | SETUP-01 | P0 | GitHub repo, React/Vite, Spring Boot | Both applications start; health API reachable. |
| 3 | DATA-01 | P0 | Firebase auth/Firestore emulators and models | Both SDKs connect; schemas/contracts documented. |
| 4 | AUTH-01 | P0 | Sign-in, token verification, RBAC | Admin/Cashier authorized; 401/403 tested. |
| 5 | PROD-01 | P0 | Product REST API | CRUD, unique SKU, validation, authorization tested. |
| 6 | PROD-02 | P0 | Product management UI | Admin creates/edits; Cashier has read-only view. |
| 7 | INV-01 | P0 | Stock adjustments/audit + UI | Atomic quantity and movement updates pass tests. |
| 8 | POS-01 | P0 | POS cart and tendered cash UI | Valid checkout request assembled. |
| 9 | SALE-01 | P0 | Atomic idempotent checkout | Race, retry, stock and cash validations pass. |
| 10 | SALE-02 | P0 | Receipt, history, daily summary | All use persisted completed sales. |
| 11 | TEST-01 | P0 | Integrated flow and tests | Critical workflows pass; bugs logged. |
| 12 | FIX-01 | P0 | Fix critical bugs; release candidate | No critical security/data-integrity defects. |
| 13 | DOC-01 | P0 | README, API docs, test report, packaging | Fresh-clone instructions verified. |
| 14 | REL-01 | P0 | Merge/release/demo | Final build, tests, tagged archive and demo pass. |

## 2. User Stories and Acceptance Criteria

### AUTH-01 — Authenticate employees (P0)
**As an employee**, I want to sign in, so that I can access permitted SmartPOS functionality.
- [ ] Firebase Email/Password login works.
- [ ] React attaches ID token to requests.
- [ ] Backend verifies ID token and active user record.
- [ ] Invalid token returns 401 and denied role returns 403.

### PROD-01 — Manage products (P0)
**As an Admin**, I want to create and update products, so that catalog information stays current.
- [ ] Create/read/update/deactivate supported.
- [ ] Unique SKU, nonnegative price, required name enforced.
- [ ] Cashier cannot create/edit/deactivate products.
- [ ] Search/list requests are bounded.

### INV-01 — Adjust stock (P0)
**As an Admin**, I want to adjust stock with a reason, so that physical corrections are traceable.
- [ ] No negative ending stock.
- [ ] Quantity and movement log written atomically.
- [ ] Cashier adjustment denied.

### POS-01 — Prepare a sale (P0)
**As a Cashier**, I want a cart, so that I can collect items for checkout.
- [ ] Add/remove product and change positive whole-number quantity.
- [ ] Display running estimated total.
- [ ] Can submit only a valid cart and tender amount.

### SALE-01 — Complete a cash sale (P0)
**As a Cashier**, I want checkout to update inventory reliably, so that stock and sales records agree.
- [ ] Backend reads authoritative product prices.
- [ ] Checkout performs sale, stock decrement and movements atomically.
- [ ] Insufficient stock or insufficient cash makes no writes.
- [ ] Duplicate request with same idempotency key does not duplicate sale.
- [ ] Two concurrent sales of final unit do not oversell.

### SALE-02 — View receipts and sales (P0)
**As a Cashier**, I want receipts and history, so that I can provide proof of sales.
- [ ] Receipt prints item price snapshots, quantities and change.
- [ ] Cashier only sees permitted sales.
- [ ] Admin sees all sales and daily completed sales summary.

## 3. Optional Backlog
| ID | Priority | Enhancement |
|---|---|---|
| CAT-01 | P1 | Category management screen |
| REP-02 | P1 | Low-stock list and product charts |
| USER-01 | P1 | Employee management UI |
| DEPLOY-01 | P1 | Firebase Hosting + Cloud Run deployment |
| FUT-01 | P2 | Barcode scanning |
| FUT-02 | P2 | Returns/refunds, taxes, discounts |
| FUT-03 | P2 | Multi-store and offline checkout |

## 4. Suggested GitHub Issue Format
```markdown
## Goal
Describe the user-facing outcome.

## Tasks
- [ ] Implementation task
- [ ] Validation task
- [ ] Test task

## Acceptance criteria
- [ ] Observable result

## Dependencies
Related issue IDs

## Priority
P0 / P1 / P2

## Target day
Day N
```

## 5. Git Workflow
Daily:
```bash
git switch development
git pull origin development
git add .
git commit -m "docs: add MVP requirements"
git push origin development
```
When tested and ready, create GitHub PR **base `main` ← compare `development`**. After merging:
```bash
git switch main
git pull origin main
git switch development
git pull origin development
```
If `main` receives an exceptional fix, bring it back into `development` using a merge. Use commits such as `feat:`, `fix:`, `test:`, `docs:`, `chore:`.

## 6. Stop Rules
- Do not add P1/P2 features while P0 checkout, security or data-integrity tests fail.
- Freeze features after Day 10.
- If cloud deployment is blocked, submit verified local run steps and demo evidence.