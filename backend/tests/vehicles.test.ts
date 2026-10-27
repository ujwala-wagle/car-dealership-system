import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import { initDb, closeDb } from '../src/config/database';

describe('Vehicles and Inventory Endpoints TDD', () => {
  let userToken: string;
  let adminToken: string;
  let createdVehicleId: number;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await initDb(':memory:');

    // Register normal user
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'regularuser',
        email: 'user@dealership.com',
        password: 'Password123!',
        role: 'user'
      });

    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@dealership.com',
        password: 'Password123!'
      });
    userToken = userLogin.body.token;

    // Register admin user
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'adminuser',
        email: 'admin@dealership.com',
        password: 'AdminPassword123!',
        role: 'admin'
      });

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@dealership.com',
        password: 'AdminPassword123!'
      });
    adminToken = adminLogin.body.token;
  });

  afterAll(async () => {
    await closeDb();
  });

  describe('POST /api/vehicles (Protected)', () => {
    it('should reject adding a vehicle without authentication token', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .send({
          make: 'Toyota',
          model: 'Camry',
          category: 'Sedan',
          price: 25000,
          quantity: 5
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should allow authenticated users to add a new vehicle', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          make: 'Toyota',
          model: 'Camry',
          category: 'Sedan',
          price: 25000,
          quantity: 5,
          image_url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.vehicle).toBeDefined();
      expect(res.body.vehicle.id).toBeDefined();
      expect(res.body.vehicle.make).toBe('Toyota');
      expect(res.body.vehicle.model).toBe('Camry');
      expect(res.body.vehicle.category).toBe('Sedan');
      expect(res.body.vehicle.price).toBe(25000);
      expect(res.body.vehicle.quantity).toBe(5);

      createdVehicleId = res.body.vehicle.id;
    });

    it('should reject adding vehicle with missing fields', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          make: 'Toyota'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/vehicles (Protected)', () => {
    it('should return a list of all available vehicles when authenticated', async () => {
      const res = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.vehicles)).toBe(true);
      expect(res.body.vehicles.length).toBeGreaterThanOrEqual(1);
    });

    it('should reject listing vehicles if not authenticated', async () => {
      const res = await request(app).get('/api/vehicles');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/vehicles/search (Protected)', () => {
    beforeAll(async () => {
      // Add more vehicles for search testing
      await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          make: 'Tesla',
          model: 'Model 3',
          category: 'Electric',
          price: 45000,
          quantity: 2
        });

      await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          make: 'Ford',
          model: 'F-150',
          category: 'Truck',
          price: 35000,
          quantity: 0
        });
    });

    it('should search vehicles by make', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?make=Tesla')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.vehicles.length).toBe(1);
      expect(res.body.vehicles[0].make).toBe('Tesla');
    });

    it('should search vehicles by category', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?category=Truck')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.vehicles.length).toBe(1);
      expect(res.body.vehicles[0].category).toBe('Truck');
    });

    it('should search vehicles by price range (minPrice & maxPrice)', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?minPrice=30000&maxPrice=50000')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.vehicles.length).toBe(2);
      res.body.vehicles.forEach((v: any) => {
        expect(v.price).toBeGreaterThanOrEqual(30000);
        expect(v.price).toBeLessThanOrEqual(50000);
      });
    });
  });

  describe('PUT /api/vehicles/:id (Protected)', () => {
    it('should update a vehicle details', async () => {
      const res = await request(app)
        .put(`/api/vehicles/${createdVehicleId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          price: 24000,
          model: 'Camry Hybrid'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.vehicle.price).toBe(24000);
      expect(res.body.vehicle.model).toBe('Camry Hybrid');
    });

    it('should return 404 for updating non-existent vehicle', async () => {
      const res = await request(app)
        .put('/api/vehicles/99999')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ price: 20000 });

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/vehicles/:id/purchase (Protected)', () => {
    it('should decrease the vehicle quantity by 1 when purchased', async () => {
      const beforeRes = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`);
      const car = beforeRes.body.vehicles.find((v: any) => v.id === createdVehicleId);
      const initialQty = car.quantity;

      const res = await request(app)
        .post(`/api/vehicles/${createdVehicleId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.vehicle.quantity).toBe(initialQty - 1);
    });

    it('should fail to purchase if vehicle quantity is zero (out of stock)', async () => {
      // Find the Ford F-150 with quantity 0
      const listRes = await request(app)
        .get('/api/vehicles/search?model=F-150')
        .set('Authorization', `Bearer ${userToken}`);
      const outOfStockVehicle = listRes.body.vehicles[0];

      const res = await request(app)
        .post(`/api/vehicles/${outOfStockVehicle.id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/out of stock|zero/i);
    });
  });

  describe('POST /api/vehicles/:id/restock (Protected, Admin only)', () => {
    it('should reject restock if user is not an admin', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${createdVehicleId}/restock`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 10 });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/admin/i);
    });

    it('should allow admin to restock and increase quantity', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${createdVehicleId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 10 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.vehicle.quantity).toBeGreaterThanOrEqual(10);
    });

    it('should reject invalid restock quantity (e.g. negative or non-number)', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${createdVehicleId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: -5 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/vehicles/:id (Protected, Admin only)', () => {
    it('should reject delete if user is not an admin', async () => {
      const res = await request(app)
        .delete(`/api/vehicles/${createdVehicleId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow admin to delete a vehicle', async () => {
      const res = await request(app)
        .delete(`/api/vehicles/${createdVehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify deletion
      const checkRes = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`);
      const found = checkRes.body.vehicles.find((v: any) => v.id === createdVehicleId);
      expect(found).toBeUndefined();
    });
  });
});
