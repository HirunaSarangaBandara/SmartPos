# SmartPOS — Point of Sale & Inventory Management System

> **Status: Planning / Under Development**  
> SmartPOS is a proposed **14-day demonstration MVP**. Items marked as planned are **not yet implemented**.

SmartPOS is a web-based POS system for a single retail store. It aims to simplify product management, stock tracking, cash checkout, receipt printing, employee permissions and daily sales reporting.

## Planned Features
- [ ] Firebase Email/Password employee sign-in
- [ ] Admin and Cashier role-based permissions
- [ ] Product creation, update, listing, search and deactivation
- [ ] Stock adjustments with audit history
- [ ] Cashier POS cart and cash-only checkout
- [ ] Atomic sale recording and stock deduction
- [ ] Retry-safe checkout using an idempotency key
- [ ] Printable receipts and permitted sales history
- [ ] Basic daily completed-sales report

### Outside the initial MVP
Card payments, tax engines, returns/refunds, offline checkout, barcode hardware, supplier purchasing and multi-store inventory.

## Technology Stack (Planned)
| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Backend | Java 21, Spring Boot, Spring Security |
| REST client | Axios |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| Firebase server access | Firebase Admin SDK |
| Local testing | Firebase Emulator Suite |
| Hosting (optional) | Firebase Hosting + Google Cloud Run |
| Version control | Git and GitHub |

## Architecture
```text
React (Firebase Web Auth)
        |
  HTTPS + Firebase ID token
        |
        v
Spring Boot REST API (token verification + role checks + validation)
        |
    Firebase Admin SDK
        |
        v
Cloud Firestore (products, stock, sales, users)
```

Business data is accessed through the Spring Boot API, not directly from the frontend. The backend is responsible for authorization, accurate totals and atomic Firestore transactions. Firebase Admin SDK calls bypass Firestore Security Rules, so the server must enforce permissions itself.

## Project Structure
```text
smartpos/
├── docs/
│   ├── project-overview.md
│   ├── requirements.md
│   ├── user-roles.md
│   ├── mvp-scope.md
│   ├── workflows.md
│   ├── development-backlog.md
│   └── wireframes/
│       └── README.md
├── frontend/        # React app will be initialized during setup
├── backend/         # Spring Boot app will be initialized during setup
└── README.md
```

## Getting Started (Planned Setup)
The frontend and backend have **not been generated in this planning package**. The commands below apply **after** those projects are scaffolded and dependencies/configuration are added.

### Prerequisites
- Git, Node.js LTS and npm
- Java JDK 21, a Maven wrapper (generated with Spring Initializr)
- VS Code or IntelliJ IDEA
- Firebase project for eventual cloud use, and Firebase CLI/emulators for local development

### Clone
```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd smartpos
git switch development
```
Replace the placeholder with your real GitHub repository URL. Create/push the `development` branch first if it does not exist.

### Frontend (after scaffolding)
```bash
cd frontend
npm install
npm run dev
```
Expected local development URL with standard Vite settings: `http://localhost:5173`.

### Backend (after scaffolding)
On Windows PowerShell:
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
On macOS/Linux:
```bash
cd backend
./mvnw spring-boot:run
```
Expected API base URL with standard Spring Boot port: `http://localhost:8080/api/v1`. Actual port and CORS configuration must be implemented.

### Firebase configuration (to be implemented)
1. Create a Firebase project and register a Web app.
2. Enable Firebase Authentication with Email/Password.
3. Create Firestore in Native mode.
4. Configure Firebase Web SDK in React and Admin SDK in Spring Boot.
5. Configure Authentication and Firestore emulators for local development.
6. Provision demo employee accounts through a controlled backend or emulator seed process.
7. Lock down direct client access to business collections for this API-only architecture.

**Planned frontend environment keys** (create `frontend/.env.example` during setup):
```dotenv
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_FIREBASE_API_KEY=<WEB_API_KEY>
VITE_FIREBASE_AUTH_DOMAIN=<PROJECT_AUTH_DOMAIN>
VITE_FIREBASE_PROJECT_ID=<PROJECT_ID>
VITE_FIREBASE_APP_ID=<WEB_APP_ID>
VITE_USE_FIREBASE_EMULATORS=true
```

**Planned backend environment keys** (configure in terminal/IDE or server environment):
```dotenv
FIREBASE_PROJECT_ID=<PROJECT_ID>
FRONTEND_ORIGIN=http://localhost:5173
FIRESTORE_EMULATOR_HOST=127.0.0.1:8085
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
```
The emulator variables are **local-only**; do not set them in production. Backend `.env` files are not automatically loaded by Spring Boot. Never commit service-account credentials. In production on Cloud Run, prefer attached service-account identity with least-privilege permissions.

## Proposed API (Not Yet Implemented)
All paths below are relative to `/api/v1`. Protected routes require `Authorization: Bearer <FIREBASE_ID_TOKEN>`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Basic API health check |
| GET | `/users/me` | Current employee profile |
| GET | `/products` | Search/list products |
| POST | `/products` | Admin creates product |
| PUT | `/products/{id}` | Admin edits product |
| PATCH | `/products/{id}/status` | Admin activates/deactivates product |
| POST | `/inventory/adjustments` | Admin adjusts stock |
| POST | `/sales` | Complete cash checkout |
| GET | `/sales` | Permitted sales history |
| GET | `/sales/{id}/receipt` | Receipt information |
| GET | `/reports/sales-summary` | Admin daily summary |

### Example product creation request (planned)
```bash
curl -X POST http://localhost:8080/api/v1/products \
  -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Notebook A5","sku":"NB-A5-001","priceMinor":45000,"initialStockQuantity":100,"reorderLevel":10}'
```

### Example cash checkout request (planned)
```bash
curl -X POST http://localhost:8080/api/v1/sales \
  -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
  -H "Idempotency-Key: <UNIQUE_REQUEST_ID>" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":"product-001","quantity":2}],"paymentMethod":"CASH","amountTenderedMinor":100000}'
```
Prices in `priceMinor` are integer minor currency units; `45000` represents LKR 450.00 when using two decimal places. The server must compute the actual checkout totals from stored product data.

## Testing (Planned)
Once test tooling is configured:
```bash
# frontend
cd frontend
npm run test

# backend (Windows)
cd ../backend
.\mvnw.cmd test
```
Prioritize invalid-token/role checks, SKU validation, nonnegative inventory, two cashiers selling the final unit, duplicate checkout retries, and the accuracy of completed-sales reporting. The actual test command may be adjusted when the application is scaffolded.

## Deployment (Optional for 14-Day MVP)
- **Frontend:** Firebase Hosting.
- **Backend:** Google Cloud Run.
- **Data and identity:** Firestore + Firebase Authentication.
- **Fallback:** Documented local demo using Firebase emulators and seeded data if cloud deployment is not feasible.

Before production business use, security, backups, monitoring, receipt/tax rules and operational reliability require further work.

## Documentation
- [Project overview](docs/project-overview.md)
- [Requirements](docs/requirements.md)
- [User roles](docs/user-roles.md)
- [MVP scope](docs/mvp-scope.md)
- [Workflows](docs/workflows.md)
- [14-day backlog](docs/development-backlog.md)
- [Wireframes guide](docs/wireframes/README.md)

## Git Workflow
This project intentionally uses **two branches only**:
- `development` — daily implementation and testing.
- `main` — stable, reviewed/tested code for demonstration or release.

Commit daily work to `development`; when a milestone is tested, create a GitHub pull request with base `main` and compare `development`. Do not directly commit unfinished work to `main`.

## Contributing
For this solo-developer workflow, keep changes small and focused, write meaningful commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`), and verify tests before merging `development` into `main`. Issues should reference the acceptance criteria in the [backlog](docs/development-backlog.md).

## License
**To be determined.** No open-source license has been granted yet. Add a `LICENSE` file only when a license is selected.

---
**Project note:** SmartPOS is under development. This repository initially contains planning documentation; functionality, setup scripts and tests will be added incrementally.