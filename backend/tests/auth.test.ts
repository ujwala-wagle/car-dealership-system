import request from 'supertest';
import app from '../src/app';
import { initDb, closeDb } from '../src/config/database';

describe('Auth Endpoints TDD', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await initDb(':memory:');
  });

  afterAll(async () => {
    await closeDb();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully and return user object without password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'johndoe',
          email: 'john@example.com',
          password: 'Password123!',
          role: 'user'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.username).toBe('johndoe');
      expect(res.body.user.email).toBe('john@example.com');
      expect(res.body.user.role).toBe('user');
      expect(res.body.user.password).toBeUndefined();
    });

    it('should reject registration if email is already taken', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'johndoe2',
          email: 'john@example.com',
          password: 'Password123!'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already registered|already in use|exists/i);
    });

    it('should reject registration if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'missingfields'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user and return a JWT token and user info', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'Password123!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(typeof res.body.token).toBe('string');
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('john@example.com');
      expect(res.body.user.role).toBe('user');
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'WrongPassword!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid|incorrect/i);
    });

    it('should reject login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
