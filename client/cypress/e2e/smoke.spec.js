describe('End-to-end flow', () => {
  const email = `e2e_${Date.now()}@example.com`
  const password = 'Passw0rd!'

  it('login -> create goal -> add challenge -> mark complete', () => {
    // Visit login
    cy.visit('/login')
    cy.contains('Login')

    // First register via API directly (bypass missing signup UI)
    cy.request('POST', `${Cypress.env('API_URL') || 'http://localhost:3001/api'}/auth/register`, {
      email,
      password,
      firstName: 'E2E',
      lastName: 'Tester'
    }).then((reg) => {
      expect(reg.status).to.eq(201)

      // Login through UI
      cy.get('input[placeholder="Email"]').type(email)
      cy.get('input[placeholder="Password"]').type(password)
      cy.contains('button', 'Sign In').click()

      // Arrive at dashboard and create goal
      cy.contains('Dashboard')
      cy.get('input[placeholder="Goal title"]').type('My Goal')
      cy.get('textarea[placeholder="Description"]').type('Do great things')
      const today = new Date().toISOString().slice(0, 10)
      cy.get('input[type="date"]').type(today)
      cy.contains('button', 'Add Goal').click()

      // Add a challenge
      cy.contains('+ Add Challenge').first().click()
      cy.get('input[placeholder="Challenge title"]').type('First Task')
      cy.get('input[placeholder="Description"]').type('Implement feature')
      cy.contains('button', 'Add').click()

      // Mark the challenge complete
      cy.contains('First Task').parents('[class*="border"]').within(() => {
        cy.contains('Mark Complete').click()
        cy.contains('Completed')
      })
    })
  })
})
