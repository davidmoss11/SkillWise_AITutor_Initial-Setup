const request = require('supertest');
const app = require('../../src/app');

describe('Goals Integration (minimal)', () => {
  test('list goals returns array', async () => {
    if (!global.__DB_AVAILABLE) return void console.warn('Skipping goals integration: DB unavailable');
    // Need auth first
    const email = `goals_${Date.now()}@example.com`;
    await request(app).post('/api/auth/register').send({ email, password: 'Passw0rd!', firstName: 'G', lastName: 'I' });
    const login = await request(app).post('/api/auth/login').send({ email, password: 'Passw0rd!' });
    const token = login.body.token;
    const res = await request(app).get('/api/goals').set('Authorization', 'Bearer ' + token);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

module.exports = {};