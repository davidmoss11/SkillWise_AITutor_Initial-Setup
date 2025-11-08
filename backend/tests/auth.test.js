const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database/connection');

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    if (!global.__DB_AVAILABLE) return;
    await db.query('DELETE FROM users');
  });

  test('should create new user', async () => {
    if (!global.__DB_AVAILABLE) return void console.warn('Skipping test: DB unavailable');
    const res = await request(app).post('/api/auth/signup').send({
      email: 'test@test.com',
      password: 'Test123!',
    });

    expect([200,201]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('token');
  });

  test('should login user', async () => {
    if (!global.__DB_AVAILABLE) return void console.warn('Skipping test: DB unavailable');
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@test.com',
      password: 'Test123!',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  afterAll(async () => {
    // use connection helper close if exposed; otherwise no-op in tests
  });
});
