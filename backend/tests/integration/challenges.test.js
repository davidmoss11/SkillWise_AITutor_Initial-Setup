const request = require('supertest');
const app = require('../../src/app');

describe('Challenges Integration (minimal)', () => {
  test('create + list + fetch challenge', async () => {
    if (!global.__DB_AVAILABLE) return void console.warn('Skipping challenges integration: DB unavailable');
    const email = `ch_${Date.now()}@example.com`;
    await request(app).post('/api/auth/register').send({ email, password: 'Passw0rd!', firstName: 'C', lastName: 'H' });
    const login = await request(app).post('/api/auth/login').send({ email, password: 'Passw0rd!' });
    const token = login.body.token;
    // Create goal
    const goal = await request(app).post('/api/goals').set('Authorization', 'Bearer ' + token)
      .send({ title: 'Goal', description: 'Desc', targetDate: '2025-12-31' });
    expect(goal.statusCode).toBe(201);
    // Create challenge
    const ch = await request(app).post('/api/challenges').set('Authorization', 'Bearer ' + token)
      .send({ title: 'Challenge', description: 'Do work', goalId: goal.body.id });
    expect(ch.statusCode).toBe(201);
    // List
    const list = await request(app).get('/api/challenges').set('Authorization', 'Bearer ' + token);
    expect(list.statusCode).toBe(200);
    expect(list.body.length).toBeGreaterThan(0);
    // Fetch single
    const single = await request(app).get('/api/challenges/' + ch.body.id).set('Authorization', 'Bearer ' + token);
    expect(single.statusCode).toBe(200);
    expect(single.body.id).toBe(ch.body.id);
  });
});

module.exports = {};