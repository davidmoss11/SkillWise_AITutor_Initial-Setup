const request = require('supertest')
const app = require('../src/app')
const db = require('../src/database/connection')

async function clear() {
  await db.query('DELETE FROM challenges')
  await db.query('DELETE FROM goals')
  await db.query('DELETE FROM users')
}

describe('Auth + Goals + Challenges flow', () => {
  let token
  beforeAll(async () => {
    if (!global.__DB_AVAILABLE) return;
    await clear()
  })

  afterAll(async () => {
    if (!global.__DB_AVAILABLE) return;
    await clear()
  })

  test('register then login', async () => {
    if (!global.__DB_AVAILABLE) return void console.warn('Skipping test: DB unavailable');
    const reg = await request(app).post('/api/auth/register').send({
      email: 'tester@example.com',
      password: 'Passw0rd!',
      firstName: 'Test',
      lastName: 'User'
    })
    expect([200,201]).toContain(reg.statusCode)

    const login = await request(app).post('/api/auth/login').send({
      email: 'tester@example.com',
      password: 'Passw0rd!'
    })
    expect(login.statusCode).toBe(200)
    token = login.body.token
    expect(token).toBeTruthy()
  })

  test('create goal', async () => {
    if (!global.__DB_AVAILABLE) return void console.warn('Skipping test: DB unavailable');
    const res = await request(app)
      .post('/api/goals')
      .set('Authorization', 'Bearer ' + token)
      .send({ title: 'Learn React', description: 'Basics', targetDate: '2025-12-31' })
    expect(res.statusCode).toBe(201)
    expect(res.body.title).toBe('Learn React')
  })

  test('add challenge and mark complete', async () => {
    if (!global.__DB_AVAILABLE) return void console.warn('Skipping test: DB unavailable');
    // Need a goal id
    const goals = await request(app)
      .get('/api/goals')
      .set('Authorization', 'Bearer ' + token)
    const goalId = goals.body[0].id

    const chCreate = await request(app)
      .post('/api/challenges')
      .set('Authorization', 'Bearer ' + token)
      .send({ title: 'Build component', description: 'Create reusable button', goalId })
    expect(chCreate.statusCode).toBe(201)

    const updated = await request(app)
      .put('/api/challenges/' + chCreate.body.id)
      .set('Authorization', 'Bearer ' + token)
      .send({ status: 'done' })
    expect(updated.statusCode).toBe(200)
    expect(updated.body.status).toBe('done')
  })
})
