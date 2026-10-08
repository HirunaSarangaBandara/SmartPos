# SmartPOS — Point of Sale & Inventory Management System

**Project Status:** 🚧 Under Active Development  
**Development Model:** Solo Developer  
**Repository:** Public  
**License:** MIT  
**Current Phase:** Development Environment Setup

SmartPOS is a modern, web-based **Point of Sale (POS) and Inventory Management System** designed for small retail businesses.

The system aims to simplify daily retail operations by providing product management, inventory tracking, cash sales processing, receipt generation, employee access control, and basic sales reporting.

SmartPOS is being developed as a **14-day demonstration MVP** using React, TypeScript, Spring Boot, and Firebase, with an architecture designed to support future enhancements.

> **Development Notice**
>
> SmartPOS is currently under active development. Some documented features and API endpoints are planned and may not yet be implemented.
>
> This is a publicly accessible, independently developed project. External contributions and pull requests are not being accepted at this stage.

---

## 1. Project Objectives

SmartPOS aims to:

- Simplify product and inventory management.
- Provide an efficient cashier checkout interface.
- Maintain accurate product stock levels.
- Record sales transactions reliably.
- Generate printable customer receipts.
- Provide secure employee authentication and role-based permissions.
- Display basic daily sales reports.
- Establish a maintainable foundation for future improvements.

## 2. Features

### Core MVP Features

- [ ] Firebase Email/Password authentication
- [ ] Admin and Cashier role-based access control
- [ ] Product creation, updating, listing, searching, and deactivation
- [ ] Inventory adjustments with stock movement history
- [ ] Cashier POS interface and shopping cart
- [ ] Cash-only sales processing
- [ ] Atomic sales recording and inventory deduction
- [ ] Retry-safe checkout using idempotency keys
- [ ] Printable customer receipts
- [ ] Sales transaction history
- [ ] Basic daily sales reporting
- [ ] Responsive user interface

### Future Enhancements

The following features are outside the initial MVP:

- Barcode scanner integration
- Card and online payment processing
- Supplier and purchase order management
- Customer management
- Returns and refunds
- Advanced business analytics
- PDF and email receipts
- Multi-branch inventory
- Offline sales synchronization
- Advanced tax management

## 3. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| HTTP Client | Axios |
| Backend | Java 21, Spring Boot |
| Security | Spring Security |
| API Architecture | REST |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| Server-Side Firebase Integration | Firebase Admin SDK |
| Local Testing | Firebase Emulator Suite |
| Build Tools | npm, Maven |
| Frontend Hosting (Planned) | Firebase Hosting |
| Backend Hosting (Planned) | Google Cloud Run |
| Version Control | Git and GitHub |
| License | MIT |

## 4. System Architecture

SmartPOS follows a three-layer architecture.

```text
             +------------------------+
             |      React Frontend    |
             |   TypeScript + Vite    |
             +-----------+------------+
                         |
                  HTTPS REST API
                  Firebase ID Token
                         |
                         v
             +------------------------+
             |   Spring Boot Backend  |
             |                        |
             | - REST Controllers     |
             | - Business Logic       |
             | - Data Validation      |
             | - Authorization        |
             | - Sales Transactions   |
             +-----------+------------+
                         |
                   Firebase Admin SDK
                         |
                         v
             +------------------------+
             |    Cloud Firestore     |
             |                        |
             | - Users                |
             | - Products             |
             | - Inventory            |
             | - Sales                |
             | - Stock Movements      |
             +------------------------+
```

### Architecture Responsibilities

**React Frontend**

- Displays the user interface.
- Handles user interaction and form validation.
- Manages navigation and application state.
- Communicates with Spring Boot REST APIs.
- Uses Firebase Authentication for employee sign-in.

**Spring Boot Backend**

- Exposes REST API endpoints.
- Verifies Firebase authentication tokens.
- Enforces role-based authorization.
- Validates business data.
- Processes sales and inventory changes.
- Communicates securely with Firestore.

**Firebase**

- Firebase Authentication manages employee identities.
- Cloud Firestore stores application data.
- Firebase Emulator Suite supports local development and testing.

Business data is accessed through the Spring Boot backend rather than directly from the frontend.

## 5. Project Structure

The planned repository structure is:

```text
SmartPos/
├── .github/
│   └── workflows/
├── docs/
│   ├── project-overview.md
│   ├── requirements.md
│   ├── user-roles.md
│   ├── mvp-scope.md
│   ├── workflows.md
│   ├── development-backlog.md
│   └── wireframes/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── config/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/smartpos/backend/
│   │   │   └── resources/
│   │   └── test/
│   ├── pom.xml
│   └── mvnw.cmd
├── .gitignore
├── LICENSE
└── README.md
```

The structure will be updated as implementation progresses.

## 6. Getting Started

### Prerequisites

Install the following tools:

- Git
- Node.js (supported LTS version)
- npm
- Java Development Kit (JDK) 21
- Visual Studio Code or IntelliJ IDEA
- Maven Wrapper (included with the Spring Boot project)

Additional requirements for Firebase integration:

- Firebase project
- Firebase CLI
- Firebase Emulator Suite

### Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd SmartPos
```

Replace the placeholder with the actual public repository URL.

Switch to the development branch:

```bash
git switch development
```

## 7. Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file using `.env.example` as a reference.

Start the development server:

```bash
npm run dev
```

The frontend runs at:

http://localhost:5173

### Frontend Environment Variables

```dotenv
VITE_API_BASE_URL=http://localhost:8080/api/v1

# Planned Firebase configuration
VITE_FIREBASE_API_KEY=<WEB_API_KEY>
VITE_FIREBASE_AUTH_DOMAIN=<AUTH_DOMAIN>
VITE_FIREBASE_PROJECT_ID=<PROJECT_ID>
VITE_FIREBASE_APP_ID=<APP_ID>
```

Only the API base URL is required for the initial backend connection screen.

Firebase-related variables will be used after Firebase integration is implemented.

Never place server-side Firebase credentials in frontend environment variables.

## 8. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

The backend uses:

- Java 21
- Spring Boot
- Maven
- Spring Security
- REST APIs

### Run the Backend

On Windows PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```

On Linux or macOS:

```bash
./mvnw spring-boot:run
```

The default backend URL is:

http://localhost:8080

### Initial Health Check API

The initial backend setup includes a health-check endpoint:

```http
GET /api/v1/health
```

Expected response:

```json
{
  "status": "UP",
  "application": "SmartPOS",
  "message": "SmartPOS backend is running"
}
```

This endpoint is used to verify communication between React and Spring Boot.

The main business API endpoints will be added during later development phases.

## 9. Firebase Configuration

Firebase integration is planned for the next development phase.

### Firebase Setup Steps

1. Create a Firebase project.
2. Register a Firebase Web application.
3. Enable Email/Password authentication.
4. Create a Cloud Firestore database in Native mode.
5. Configure the Firebase Web SDK in React.
6. Configure Firebase Admin SDK in Spring Boot.
7. Set up Firebase Authentication and Firestore emulators.
8. Configure development and production environment variables.
9. Restrict direct client access to authoritative business data.

### Planned Firestore Collections

```text
users/
products/
categories/
sales/
stockMovements/
settings/
```

### Backend Environment Variables

Planned configuration:

```dotenv
SERVER_PORT=8080
FIREBASE_PROJECT_ID=<PROJECT_ID>
FRONTEND_ORIGIN=http://localhost:5173

# Local Firebase emulators only
FIRESTORE_EMULATOR_HOST=127.0.0.1:8085
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
```

Spring Boot must be configured to read the required variables.

Emulator environment variables must not be enabled in production.

Sensitive credentials must never be committed to this public repository.

## 10. Planned REST API Endpoints

All application endpoints use the `/api/v1` prefix.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Backend health status |
| GET | `/users/me` | Authenticated employee information |
| GET | `/products` | List and search products |
| GET | `/products/{id}` | Retrieve product |
| POST | `/products` | Create product |
| PUT | `/products/{id}` | Update product |
| PATCH | `/products/{id}/status` | Activate/deactivate product |
| POST | `/inventory/adjustments` | Adjust stock quantity |
| GET | `/inventory/movements` | View stock history |
| POST | `/sales` | Complete cash sale |
| GET | `/sales` | View permitted sales history |
| GET | `/sales/{id}/receipt` | Retrieve receipt |
| GET | `/reports/sales-summary` | Daily sales summary |

**Note:** Except for the initial health-check endpoint, these endpoints are planned for future implementation.

Protected endpoints will require a valid Firebase ID token and appropriate role permissions.

### Example Health Check

```bash
curl http://localhost:8080/api/v1/health
```

### Planned Product Creation Request

```bash
curl -X POST http://localhost:8080/api/v1/products \
  -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Notebook A5",
    "sku": "NB-A5-001",
    "priceMinor": 45000,
    "initialStockQuantity": 100,
    "reorderLevel": 10
  }'
```

### Planned Cash Checkout Request

```bash
curl -X POST http://localhost:8080/api/v1/sales \
  -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
  -H "Idempotency-Key: <UNIQUE_REQUEST_ID>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "product-001",
        "quantity": 2
      }
    ],
    "paymentMethod": "CASH",
    "amountTenderedMinor": 100000
  }'
```

These examples represent the planned API contract and are not yet implemented.

Monetary values use integer minor currency units. For example, `45000` represents LKR 450.00 when using two decimal places.

The backend will calculate authoritative sales totals and verify available stock.

## 11. Testing

### Frontend

Run the frontend production build:

```bash
cd frontend
npm run build
```

Run ESLint:

```bash
npm run lint
```

Automated frontend tests will be introduced as the feature modules are developed.

### Backend

On Windows:

```powershell
cd backend
.\mvnw.cmd test
```

On Linux or macOS:

```bash
cd backend
./mvnw test
```

### Planned Testing Areas

- Authentication and authorization
- Product validation
- Inventory adjustments
- Stock consistency
- Cash checkout
- Duplicate transaction prevention
- Receipt generation
- Sales reporting
- Frontend and backend integration

## 12. Development Roadmap

SmartPOS follows a 14-day MVP development schedule.

| Day | Development Task |
|---|---|
| 01 | Project definition and requirement planning |
| 02 | GitHub, React, and Spring Boot setup |
| 03 | Firebase configuration and database design |
| 04 | Authentication and role-based access control |
| 05 | Product management backend |
| 06 | Product management frontend |
| 07 | Inventory management |
| 08 | POS interface and shopping cart |
| 09 | Checkout transactions |
| 10 | Receipts, sales history, and reporting |
| 11 | Integration and testing |
| 12 | Debugging and stabilization |
| 13 | Documentation and final packaging |
| 14 | Release and presentation |

The schedule is a target and may be adjusted based on development progress.

## 13. Git Branching Strategy

SmartPOS uses a simple two-branch workflow.

| Branch | Purpose |
|---|---|
| `main` | Stable and tested project code |
| `development` | Active development, testing, and updates |

All day-to-day development takes place in `development`.

### Development Workflow

Switch to the development branch:

```bash
git switch development
git pull origin development
```

After making changes:

```bash
git add .
git commit -m "feat: describe implemented feature"
git push origin development
```

When a milestone is complete and tested, create a pull request:

**Base:** `main`  
**Compare:** `development`

Review the changes and merge them into `main`.

### Commit Message Conventions

| Prefix | Purpose |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation |
| `test:` | Testing |
| `chore:` | Setup or maintenance |
| `refactor:` | Internal code improvements |

## 14. Deployment

The planned deployment architecture is:

| Component | Platform |
|---|---|
| React frontend | Firebase Hosting |
| Spring Boot backend | Google Cloud Run |
| Database | Cloud Firestore |
| Authentication | Firebase Authentication |

Cloud deployment is optional for the 14-day MVP.

A reproducible local demonstration using Firebase emulators is an acceptable delivery alternative.

This project is not yet intended for production retail operations.

## 15. Project Documentation

Technical documentation is available in the `docs/` directory:

- [Project Overview](docs/project-overview.md)
- [Software Requirements](docs/requirements.md)
- [User Roles and Permissions](docs/user-roles.md)
- [MVP Scope](docs/mvp-scope.md)
- [System Workflows](docs/workflows.md)
- [Development Backlog](docs/development-backlog.md)
- [Wireframes](docs/wireframes/README.md)

Documentation will be updated as development progresses.

## 16. Development and Contributions

SmartPOS is an independently developed, solo-maintained project.

The repository is public for transparency, learning, demonstration, and source-code availability.

**External contributions are not being accepted at this time.**

Please do not submit unsolicited pull requests.

The project owner is responsible for implementing features, reviewing changes, maintaining documentation, and managing releases.

This contribution policy does not restrict rights granted under the MIT License.

## 17. License

SmartPOS is licensed under the **MIT License**.

See the [LICENSE](LICENSE) file for the full license text.

## 18. Project Status

**🚧 Under Active Development**

The project is currently progressing through its initial development phases.

The immediate objective is to establish reliable communication between the React frontend and Spring Boot backend before implementing Firebase integration and business features.

Feature checklists and setup instructions will be updated as the corresponding functionality becomes available.

---

**SmartPOS — Simplifying Retail Operations Through Modern Web Technologies.**
