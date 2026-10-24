# Raw AI Prompts and Interaction Log

This file contains the complete, raw interaction and development prompts executed to design, test-drive (TDD), implement, and verify the **Car Dealership Inventory System**.

---

## Prompt 1: Initial Requirement Analysis and Scaffolding
**User Request:**
> "build a project based on the information given in the 3 picture that i have attached, build project exactly as it is mentioned no extra should be added to the project"

**AI Action & Interpretation:**
- Analyzed 3 specification images:
  1. Image 1: Deliverables checklist (Git repo, README.md with project explanation, setup guide, test suite report, PROMPTS.md, screenshots, mandatory "My AI Usage" section, no plagiarism).
  2. Image 2: Guidelines (TDD Red-Green-Refactor, commit co-authorship format `Co-authored-by: AI Assistant <ai@users.noreply.github.com>`, Clean code & SOLID principles, AI usage documentation).
  3. Image 3: Core Functional Specs:
     - Backend API (RESTful): Node.js/TypeScript with Express, SQLite database, JWT authentication.
     - Auth: `POST /api/auth/register`, `POST /api/auth/login`.
     - Vehicles (Protected):
       - `POST /api/vehicles` (Add new vehicle)
       - `GET /api/vehicles` (View list of all available vehicles)
       - `GET /api/vehicles/search` (Search by make, model, category, price range)
       - `PUT /api/vehicles/:id` (Update vehicle details)
       - `DELETE /api/vehicles/:id` (Delete vehicle - Admin only)
     - Inventory (Protected):
       - `POST /api/vehicles/:id/purchase` (Purchase vehicle, decrease quantity, disabled if 0)
       - `POST /api/vehicles/:id/restock` (Restock vehicle, increase quantity - Admin only)
     - Frontend (SPA): HTML5, CSS3, Tailwind CSS, React.
     - Fields: unique ID, make, model, category, price, quantity in stock.

---

## Prompt 2: TDD Cycle 1 - Authentication Endpoints
**Action:**
- Red Phase: Create `backend/tests/auth.test.ts` testing user registration, password hashing verification, duplicate registration prevention, input validation, and JWT issuing upon login.
- Run tests: Result = FAIL (no application or database layer).
- Commit: `test(auth): add failing tests for registration and login (RED)` with co-author trailer.
- Green Phase: Implement `src/config/database.ts` (SQLite), `src/services/authService.ts`, `src/controllers/authController.ts`, `src/routes/authRoutes.ts`, and `src/app.ts`.
- Run tests: Result = PASS (6/6 tests passing).
- Commit: `feat(auth): implement user registration and login with JWT and bcrypt (GREEN)`.

---

## Prompt 3: TDD Cycle 2 - Vehicles and Inventory Endpoints
**Action:**
- Red Phase: Create `backend/tests/vehicles.test.ts` with 17 integration tests covering:
  - Auth protection verification on vehicle routes
  - Vehicle creation (`POST /api/vehicles`)
  - Retrieval of all vehicles (`GET /api/vehicles`)
  - Filter and search by make, category, and price range (`GET /api/vehicles/search`)
  - Vehicle update (`PUT /api/vehicles/:id`)
  - Vehicle purchase decreasing quantity (`POST /api/vehicles/:id/purchase`)
  - Disallowing purchase if quantity is zero
  - Admin-only restock increasing quantity (`POST /api/vehicles/:id/restock`)
  - Admin-only vehicle deletion (`DELETE /api/vehicles/:id`)
- Run tests: Result = FAIL (404/routes not mounted).
- Commit: `test(vehicles): add failing integration tests for vehicle CRUD, search, purchase, and restock (RED)`.
- Green Phase:
  - Implement JWT middleware `src/middleware/auth.ts` (token verification and admin role guard)
  - Implement `src/services/vehicleService.ts` with SQLite query builders and transactional updates
  - Implement `src/controllers/vehicleController.ts` and routes in `src/routes/vehicleRoutes.ts`
- Run tests: Result = PASS (23/23 tests passing across both test suites).
- Commit: `feat(vehicles): implement vehicle CRUD, search, purchase and restock with admin controls (GREEN)`.

---

## Prompt 4: Frontend Implementation (React + Tailwind CSS)
**Action:**
- Scaffolding: Create Vite React frontend with Tailwind CSS and Lucide icons.
- Implement `frontend/src/services/api.js` for all backend REST endpoints.
- Implement `frontend/src/components/AuthModal.jsx` supporting Register/Login and quick demo autofill.
- Implement `frontend/src/components/VehicleCard.jsx` with purchase button (disabled when quantity is zero), stock counter, and admin action drawer.
- Implement `frontend/src/components/VehicleFormModal.jsx` for Admin Add/Update operations.
- Implement `frontend/src/App.jsx` with real-time showroom dashboard, multi-parameter search/filters, purchase workflows, and role-based views.
- Build verification: Run `npm run build` -> Built cleanly with 0 errors.
- Commit: `feat(frontend): create React single-page application with Tailwind CSS`.

---

## Prompt 5: Test Coverage & Verification
**Action:**
- Executed `npm test -- --coverage` on backend.
- Result: 23 passed out of 23 tests, 92.59% lines coverage.
- Exported execution metrics to `TEST_REPORT.md`.
