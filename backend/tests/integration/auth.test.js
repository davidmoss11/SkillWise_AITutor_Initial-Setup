const request = require('supertest');
const app = require('../../src/app');

describe('Authentication Integration', () => {
  test('register and login flow', async () => {
    if (!global.__DB_AVAILABLE) return void console.warn('Skipping auth integration: DB unavailable');
    const email = `flow_${Date.now()}@example.com`;
    const reg = await request(app).post('/api/auth/register').send({ email, password: 'Passw0rd!', firstName: 'Flow', lastName: 'Test' });
    expect([200,201]).toContain(reg.statusCode);
    expect(reg.body).toHaveProperty('token');
    const login = await request(app).post('/api/auth/login').send({ email, password: 'Passw0rd!' });
    expect(login.statusCode).toBe(200);
    expect(login.body).toHaveProperty('token');
  });
});

module.exports = {};