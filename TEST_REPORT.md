# TDD Kata: Car Dealership Inventory System Test Suite Report

**Executed at**: 2026-10-24  
**Framework**: Jest v29.7.0 & ts-jest v29.2.5  
**Environment**: Node.js v24.20.0 with in-memory SQLite isolation  
**Total Test Suites**: 2 Passed, 2 Total  
**Total Tests**: 23 Passed, 23 Total (100% Pass Rate)

---

## 1. Test Execution Summary

| Test Suite | Tests Passed | Tests Failed | Execution Time | Status |
| :--- | :---: | :---: | :---: | :---: |
| `tests/auth.test.ts` | 6 | 0 | 179 ms | **PASS** |
| `tests/vehicles.test.ts` | 17 | 0 | 258 ms | **PASS** |
| **Total** | **23** | **0** | **2.68 s** | **ALL PASSED** |

---

## 2. Code Coverage Metrics

```
-----------------------|---------|----------|---------|---------|--------------------------------------
File                   | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s                    
-----------------------|---------|----------|---------|---------|--------------------------------------
All files              |   88.23 |    59.52 |   98.14 |   92.59 |                                      
 src                   |   91.66 |      100 |       0 |   91.66 |                                      
  app.ts               |   91.66 |      100 |       0 |   91.66 | 16                                   
 src/config            |   83.33 |    18.18 |     100 |      90 |                                      
  database.ts          |   83.33 |    18.18 |     100 |      90 | 8,21,76                              
 src/controllers       |   81.03 |       44 |     100 |   81.03 |                                      
  authController.ts    |     100 |       50 |     100 |     100 | 14-33                                
  vehicleController.ts |   77.08 |    42.85 |     100 |   77.08 | 31,55,66-67,88-89,98,109-110,131-132 
 src/middleware        |   90.47 |      100 |     100 |   89.47 |                                      
  auth.ts              |   90.47 |      100 |     100 |   89.47 | 29-33                                
 src/routes            |     100 |      100 |     100 |     100 |                                      
  authRoutes.ts        |     100 |      100 |     100 |     100 |                                      
  vehicleRoutes.ts     |     100 |      100 |     100 |     100 |                                      
 src/services          |    90.2 |    75.43 |     100 |   97.72 |                                      
  authService.ts       |   90.69 |    78.94 |     100 |    97.5 | 57                                   
  vehicleService.ts    |      90 |    73.68 |     100 |   97.82 | 28,131                               
-----------------------|---------|----------|---------|---------|--------------------------------------
```

---

## 3. Detailed Specification Verification

### Authentication Endpoints (`POST /api/auth`)
- [x] `POST /api/auth/register`: Successfully registers user, hashes password with bcrypt, omits password in response.
- [x] `POST /api/auth/register`: Rejects registration if email is already taken.
- [x] `POST /api/auth/register`: Rejects registration if required fields (username, email, password) are missing.
- [x] `POST /api/auth/login`: Issues signed JWT token upon valid credential match.
- [x] `POST /api/auth/login`: Rejects login with wrong password (401 Unauthorized).
- [x] `POST /api/auth/login`: Rejects login with non-existent email (401 Unauthorized).

### Vehicles & Inventory Endpoints (`/api/vehicles`)
- [x] `POST /api/vehicles`: Rejects unauthenticated requests with 401.
- [x] `POST /api/vehicles`: Adds a new vehicle with make, model, category, price, quantity.
- [x] `POST /api/vehicles`: Rejects payload with missing mandatory fields.
- [x] `GET /api/vehicles`: Returns all available vehicles in dealership database for authenticated users.
- [x] `GET /api/vehicles`: Blocks unauthenticated access.
- [x] `GET /api/vehicles/search`: Filters vehicles by make (case-insensitive substring).
- [x] `GET /api/vehicles/search`: Filters vehicles by category (e.g. Sedan, SUV, Coupe, Truck, Electric).
- [x] `GET /api/vehicles/search`: Filters vehicles by price range (`minPrice` and `maxPrice`).
- [x] `PUT /api/vehicles/:id`: Updates an existing vehicle's attributes.
- [x] `PUT /api/vehicles/:id`: Returns 404 when updating non-existent vehicle ID.
- [x] `POST /api/vehicles/:id/purchase`: Decreases inventory quantity by 1 upon purchase.
- [x] `POST /api/vehicles/:id/purchase`: Rejects purchase with 400 when vehicle quantity is 0 (out of stock).
- [x] `POST /api/vehicles/:id/restock`: Restricts restocking strictly to admin users (returns 403 for standard users).
- [x] `POST /api/vehicles/:id/restock`: Increases quantity by requested amount when performed by admin.
- [x] `POST /api/vehicles/:id/restock`: Rejects invalid restock quantity (e.g. non-numeric or negative).
- [x] `DELETE /api/vehicles/:id`: Restricts vehicle deletion strictly to admin users (returns 403 for standard users).
- [x] `DELETE /api/vehicles/:id`: Successfully deletes vehicle record when performed by admin.
