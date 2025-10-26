const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database/connection');

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    // Clear test database
    await db.query('DELETE FROM users');
  });

  test('should create new user', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      email: 'test@test.com',
      password: 'Test123!',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  test('should login user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@test.com',
      password: 'Test123!',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  afterAll(async () => {
    await db.end();
  });
});
