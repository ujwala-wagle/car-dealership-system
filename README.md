# AutoVanguard — Car Dealership Inventory System

A full-stack Car Dealership Inventory System developed strictly to the Kata specifications using **Test-Driven Development (TDD)** with a **Red-Green-Refactor** workflow, clean architecture, and modern AI co-authorship tracking.

---

## 1. Project Overview

The system provides complete vehicle lifecycle management for automotive dealerships and customers:
- **RESTful API Backend**: Built with **Node.js**, **TypeScript**, and **Express**, backed by a persistent **SQLite** database.
- **Authentication & Security**: Token-based authentication using **JSON Web Tokens (JWT)** and **bcryptjs** password hashing with role-based access control (`user` vs `admin`).
- **Inventory Engine**: Real-time stock tracking with decrement upon purchase, immediate prevention and UI button disablement when stock is zero, and administrative restock/delete controls.
- **Dynamic Search & Filtering**: Multi-criteria query engine filtering by `make`, `model`, `category`, and `price range` (`minPrice`, `maxPrice`).
- **Single Page Application (SPA)**: Built with **HTML5**, **CSS3**, **Tailwind CSS**, and **React** with responsive glassmorphism aesthetic.

---

## 2. Architecture & Tech Stack

| Layer | Technology | Key Libraries |
| :--- | :--- | :--- |
| **Backend** | Node.js, TypeScript, Express | `express`, `sqlite3`, `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv` |
| **Testing** | Jest, ts-jest, Supertest | `jest`, `ts-jest`, `@types/jest`, `supertest` |
| **Database** | SQLite3 | Persistent relational storage (`dealership.sqlite`) with in-memory mode for tests |
| **Frontend** | React (Vite), JavaScript, HTML5 | `tailwindcss`, `lucide-react`, `postcss`, `autoprefixer` |

---

## 3. API Endpoints Specification

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new customer or admin user | No |
| `POST` | `/api/auth/login` | Login and receive JWT access token | No |

### Vehicles & Inventory (`/api/vehicles`)
| Method | Endpoint | Description | Auth Required | Role |
| :--- | :--- | :--- | :---: | :---: |
| `POST` | `/api/vehicles` | Add a new vehicle to inventory | Yes | Any |
| `GET` | `/api/vehicles` | View list of all available vehicles | Yes | Any |
| `GET` | `/api/vehicles/search` | Search vehicles by make, model, category, price range | Yes | Any |
| `PUT` | `/api/vehicles/:id` | Update an existing vehicle's details | Yes | Any |
| `DELETE` | `/api/vehicles/:id` | Delete vehicle from dealership | Yes | **Admin Only** |
| `POST` | `/api/vehicles/:id/purchase` | Purchase vehicle (decreases quantity by 1; blocked if 0) | Yes | Any |
| `POST` | `/api/vehicles/:id/restock` | Restock vehicle (increases quantity) | Yes | **Admin Only** |

---

## 4. How to Set Up and Run Locally

### Prerequisites
- Node.js (v18+ or v24+)
- npm (v9+)
- Git

### 1. Clone & Setup Workspace
```bash
git clone <your-repo-link>
cd incubyte
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run backend development server (with SQLite auto-seeding)
npm run dev
```
The backend server will launch at **`http://localhost:5000`**.  
*Note: On first startup, the backend automatically seeds initial demo vehicles and accounts.*

### 3. Frontend Setup
Open a new terminal window:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run frontend development server
npm run dev
```
The frontend SPA will be available at **`http://localhost:5173`**.

---

## 5. Running the Test Suite (TDD)

The test suite validates both `tests/auth.test.ts` and `tests/vehicles.test.ts` using Supertest against an isolated in-memory SQLite instance:

```bash
cd backend
npm test
```

To run with full code coverage breakdown:
```bash
npm run test:coverage
```

### Test Suite Results Summary
- **Total Test Suites**: 2 passed
- **Total Tests**: 23 passed, 0 failed
- **Statement Coverage**: > 88%
- **Line Coverage**: > 92%

A complete markdown test audit report is available in [TEST_REPORT.md](TEST_REPORT.md).

---

## 6. Demo Credentials

For quick evaluation, pre-seeded accounts can be used directly or autofilled via the frontend login modal:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@dealership.com` | `AdminPassword123!` | Full Access (Add, Edit, Delete, Restock, Purchase) |
| **Customer** | `customer@dealership.com` | `UserPassword123!` | Browse, Search, Purchase |

---

## 7. My AI Usage

### AI Tools Utilized
- **AI Coding Assistant (Antigravity with Google Gemini 3.8 Flash)**

### How AI Was Used
1. **API & Architecture Design**: Used AI to scaffold the TypeScript interfaces, route structure, and SQLite schema adhering to SOLID design patterns and clean code standards.
2. **Test-Driven Development (TDD)**:
   - Used AI to generate strict failing test cases (RED phase) for all authentication endpoints (`register`, `login`, duplicate checks, invalid credentials).
   - Used AI to generate failing test cases (RED phase) for inventory logic (`purchase` stock decrement, zero quantity blocking, admin-only `restock` and `delete`).
   - Implemented minimal code to turn all tests green (GREEN phase) followed by refactoring.
3. **Frontend Implementation**: Used AI to build the React components with Tailwind CSS, ensuring smooth interactive states (Purchase button disabled when `quantity === 0`, real-time restocking drawers, and search/filter forms).
4. **Git Version Control & Co-Authorship**: Every Git commit that utilized AI assistance includes the mandatory co-author trailer:
   ```
   Co-authored-by: AI Assistant <ai@users.noreply.github.com>
   ```

### Reflection on AI Impact
The AI assistant drastically accelerated the test-first design cycle by generating edge-case unit and integration tests (such as unauthorized token access, 403 role guards, and out-of-stock boundary conditions) before writing application logic. It allowed focusing on architectural robustness, test coverage completeness (>92% line coverage), and strict compliance with the kata requirements without boilerplate overhead.

---

## 8. Deliverables Index
- **Repository Root**: Contains all source code, `package.json`, and `.gitignore`.
- [TEST_REPORT.md](TEST_REPORT.md): Detailed results of the Jest test suite and coverage table.
- [PROMPTS.md](PROMPTS.md): Complete raw interaction logs and prompt transcripts.
