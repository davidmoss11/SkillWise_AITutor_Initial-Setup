// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command for login
Cypress.Commands.add('login', (email, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: {
      email,
      password
    }
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body).to.have.property('token');
    
    // Store token in localStorage
    window.localStorage.setItem('token', response.body.token);
    window.localStorage.setItem('user', JSON.stringify(response.body.user));
    
    return response.body;
  });
});

// Custom command for creating a test user and logging in
Cypress.Commands.add('loginAsTestUser', () => {
  const testUser = {
    email: 'cypress.test@skillwise.com',
    password: 'Test123!'
  };

  // Try to login first
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: testUser,
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 200) {
      // User exists, use the token
      window.localStorage.setItem('token', response.body.token);
      window.localStorage.setItem('user', JSON.stringify(response.body.user));
      return response.body;
    } else {
      // User doesn't exist, create new user
      return cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/auth/register`,
        body: {
          name: 'Cypress Test User',
          email: testUser.email,
          password: testUser.password
        }
      }).then((registerResponse) => {
        expect(registerResponse.status).to.eq(201);
        window.localStorage.setItem('token', registerResponse.body.token);
        window.localStorage.setItem('user', JSON.stringify(registerResponse.body.user));
        return registerResponse.body;
      });
    }
  });
});

// Custom command for logout
Cypress.Commands.add('logout', () => {
  window.localStorage.removeItem('token');
  window.localStorage.removeItem('user');
  cy.visit('/login');
});

// Custom command to clear test data
Cypress.Commands.add('clearTestData', () => {
  const token = window.localStorage.getItem('token');
  
  if (token) {
    // Delete all challenges and goals for the current user
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/challenges`,
      headers: {
        Authorization: `Bearer ${token}`
      },
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200 && response.body.length > 0) {
        response.body.forEach((challenge) => {
          cy.request({
            method: 'DELETE',
            url: `${Cypress.env('apiUrl')}/challenges/${challenge.id}`,
            headers: {
              Authorization: `Bearer ${token}`
            },
            failOnStatusCode: false
          });
        });
      }
    });

    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/goals`,
      headers: {
        Authorization: `Bearer ${token}`
      },
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200 && response.body.length > 0) {
        response.body.forEach((goal) => {
          cy.request({
            method: 'DELETE',
            url: `${Cypress.env('apiUrl')}/goals/${goal.id}`,
            headers: {
              Authorization: `Bearer ${token}`
            },
            failOnStatusCode: false
          });
        });
      }
    });
  }
});

// Custom command to wait for element and check visibility
Cypress.Commands.add('waitForElement', (selector, timeout = 10000) => {
  cy.get(selector, { timeout }).should('be.visible');
});
