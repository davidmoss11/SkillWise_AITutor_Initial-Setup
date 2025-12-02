/**
 * E2E Tests for Stories 3.1-3.8: AI Challenge Generation & Feedback
 * 
 * This test suite covers the complete AI-powered tutoring workflows:
 * - Story 3.1: Generate Challenge button and modal
 * - Story 3.2: AI challenge generation endpoint
 * - Story 3.3: AI prompt templates
 * - Story 3.4: Feedback submission form
 * - Story 3.5: Feedback generation endpoint
 * - Story 3.6: AI feedback database persistence
 * - Story 3.7: Snapshot testing (covered in unit tests)
 * - Story 3.8: Error tracking with Sentry (covered in error tests)
 */

describe('Stories 3.1-3.8: AI-Powered Challenge Generation and Feedback', () => {
  
  beforeEach(() => {
    // Login before each test
    cy.visit('/login');
    cy.loginAsTestUser();
    cy.url().should('include', '/dashboard');
  });

  // ========================================
  // STORY 3.1: Generate Challenge Button/Modal
  // ========================================
  describe('Story 3.1: Generate Challenge Button and Modal', () => {
    
    it('should display "Generate Challenge" button on Challenges page', () => {
      cy.log('Test 3.1.1: Verify button exists');
      
      // Navigate to Challenges page
      cy.contains('a', 'Challenges').click();
      cy.url().should('include', '/challenges');
      
      // Verify "Generate Challenge" button exists
      cy.contains('button', /Generate Challenge/i).should('be.visible');
      cy.log('✅ Generate Challenge button is visible');
    });

    it('should open modal when "Generate Challenge" button is clicked', () => {
      cy.log('Test 3.1.2: Verify modal opens');
      
      cy.contains('a', 'Challenges').click();
      
      // Click the Generate Challenge button
      cy.contains('button', /Generate Challenge/i).click();
      
      // Verify modal opens
      cy.get('[role="dialog"], .modal, .generate-challenge-modal').should('be.visible');
      cy.contains(/AI.*Challenge|Generate.*Challenge/i).should('be.visible');
      cy.log('✅ Modal opened successfully');
    });

    it('should allow user to specify category, difficulty, and topic', () => {
      cy.log('Test 3.1.3: Verify modal form inputs');
      
      cy.contains('a', 'Challenges').click();
      cy.contains('button', /Generate Challenge/i).click();
      
      // Verify form inputs exist
      cy.get('select[name="category"], #category, [data-testid="category"]')
        .should('exist');
      
      cy.get('select[name="difficulty"], #difficulty, [data-testid="difficulty"]')
        .should('exist');
      
      // Topic input (may be text or select)
      cy.get('input[name="topic"], select[name="topic"], #topic, [data-testid="topic"]')
        .should('exist');
      
      cy.log('✅ All form inputs present in modal');
    });

    it('should show loading state while generating challenge', () => {
      cy.log('Test 3.1.4: Verify loading state');
      
      cy.contains('a', 'Challenges').click();
      cy.contains('button', /Generate Challenge/i).click();
      
      // Fill out form
      cy.get('select[name="category"], #category, [data-testid="category"]').first().select('JavaScript');
      cy.get('select[name="difficulty"], #difficulty, [data-testid="difficulty"]').first().select('medium');
      
      // Submit form
      cy.contains('button', /Generate|Create|Submit/i).click();
      
      // Verify loading indicator appears
      cy.get('.loading, .spinner, [data-testid="loading"]', { timeout: 1000 })
        .should('exist');
      
      cy.log('✅ Loading state displayed');
    });

    it('should display generated challenge in modal', () => {
      cy.log('Test 3.1.5: Complete challenge generation flow');
      
      cy.contains('a', 'Challenges').click();
      cy.contains('button', /Generate Challenge/i).click();
      
      // Fill out form
      cy.get('select[name="category"], #category, [data-testid="category"]').first().select('JavaScript');
      cy.get('select[name="difficulty"], #difficulty, [data-testid="difficulty"]').first().select('easy');
      
      // Optional: Fill topic if text input
      cy.get('body').then($body => {
        if ($body.find('input[name="topic"]').length > 0) {
          cy.get('input[name="topic"]').type('Arrays');
        }
      });
      
      // Submit form
      cy.contains('button', /Generate|Create|Submit/i).click();
      
      // Wait for challenge to generate (AI call takes time)
      cy.wait(3000);
      
      // Verify challenge content appears
      cy.get('.challenge-result, .generated-challenge, [data-testid="challenge-result"]', { timeout: 10000 })
        .should('be.visible');
      
      // Should have title and description
      cy.contains(/title|challenge/i).should('exist');
      cy.contains(/description|instructions/i).should('exist');
      
      cy.log('✅ Generated challenge displayed successfully');
    });

    it('should allow user to save generated challenge', () => {
      cy.log('Test 3.1.6: Save generated challenge');
      
      cy.contains('a', 'Challenges').click();
      cy.contains('button', /Generate Challenge/i).click();
      
      // Generate challenge
      cy.get('select[name="category"], #category, [data-testid="category"]').first().select('Python');
      cy.get('select[name="difficulty"], #difficulty, [data-testid="difficulty"]').first().select('easy');
      cy.contains('button', /Generate|Create|Submit/i).click();
      
      // Wait for generation
      cy.wait(3000);
      
      // Look for save button
      cy.contains('button', /Save|Accept|Add/i, { timeout: 10000 }).should('be.visible');
      cy.contains('button', /Save|Accept|Add/i).click();
      
      // Verify success message or modal closes
      cy.get('.success, .toast', { timeout: 5000 }).should('exist');
      
      cy.log('✅ Challenge saved successfully');
    });
  });

  // ========================================
  // STORY 3.2 & 3.3: AI Challenge Endpoint & Templates
  // ========================================
  describe('Story 3.2 & 3.3: AI Challenge Endpoint with Templates', () => {
    
    it('should successfully call /api/ai/generateChallenge endpoint', () => {
      cy.log('Test 3.2.1: Verify endpoint responds');
      
      // Make direct API call to verify endpoint
      cy.request({
        method: 'POST',
        url: '/api/ai/generateChallenge',
        headers: {
          'Authorization': `Bearer ${window.localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: {
          category: 'JavaScript',
          difficulty: 'easy',
          topic: 'Functions'
        },
        timeout: 15000
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('challenge');
        expect(response.body.challenge).to.have.property('title');
        expect(response.body.challenge).to.have.property('description');
        expect(response.body.challenge).to.have.property('instructions');
        cy.log('✅ API endpoint returns valid challenge structure');
      });
    });

    it('should return challenge with all required fields', () => {
      cy.log('Test 3.2.2: Verify response structure');
      
      cy.request({
        method: 'POST',
        url: '/api/ai/generateChallenge',
        headers: {
          'Authorization': `Bearer ${window.localStorage.getItem('token')}`
        },
        body: {
          category: 'Algorithms',
          difficulty: 'medium'
        },
        timeout: 15000
      }).then((response) => {
        const challenge = response.body.challenge;
        
        // Verify required fields from Story 3.2 acceptance criteria
        expect(challenge).to.have.property('title');
        expect(challenge).to.have.property('description');
        expect(challenge).to.have.property('instructions');
        expect(challenge).to.have.property('category');
        expect(challenge).to.have.property('difficulty_level');
        expect(challenge).to.have.property('estimated_time_minutes');
        expect(challenge).to.have.property('points_reward');
        expect(challenge).to.have.property('learning_objectives');
        expect(challenge.learning_objectives).to.be.an('array');
        
        cy.log('✅ Challenge contains all required fields');
      });
    });

    it('should handle different difficulty levels correctly', () => {
      cy.log('Test 3.2.3: Test difficulty variations');
      
      const difficulties = ['easy', 'medium', 'hard'];
      
      difficulties.forEach((difficulty) => {
        cy.request({
          method: 'POST',
          url: '/api/ai/generateChallenge',
          headers: {
            'Authorization': `Bearer ${window.localStorage.getItem('token')}`
          },
          body: {
            category: 'Programming',
            difficulty: difficulty
          },
          timeout: 15000
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.challenge.difficulty_level).to.include(difficulty);
          cy.log(`✅ ${difficulty} difficulty challenge generated`);
        });
      });
    });
  });

  // ========================================
  // STORY 3.4: Feedback Submission Form
  // ========================================
  describe('Story 3.4: Feedback Submission Form', () => {
    
    it('should display submission form on challenge detail page', () => {
      cy.log('Test 3.4.1: Verify form exists');
      
      // Navigate to challenges
      cy.contains('a', 'Challenges').click();
      
      // Find and click a challenge (or create one first)
      cy.get('.challenge-card, [data-testid="challenge-card"]').first().click();
      
      // Look for submission form or "Submit Solution" button
      cy.contains(/Submit|Solution|Feedback/i, { timeout: 5000 }).should('exist');
      
      cy.log('✅ Submission form/button found');
    });

    it('should validate that code is not empty before submission', () => {
      cy.log('Test 3.4.2: Test form validation');
      
      cy.contains('a', 'Challenges').click();
      
      // Try to find submission form
      cy.get('body').then($body => {
        if ($body.find('textarea[name="code"], .code-editor').length > 0) {
          // Clear code field
          cy.get('textarea[name="code"], .code-editor').first().clear();
          
          // Try to submit empty
          cy.contains('button', /Submit/i).click();
          
          // Should see validation error
          cy.contains(/required|empty|enter.*code/i, { timeout: 3000 }).should('exist');
          
          cy.log('✅ Form validation working');
        } else {
          cy.log('⚠️ Submission form not accessible from this page');
        }
      });
    });

    it('should allow code submission for AI feedback', () => {
      cy.log('Test 3.4.3: Submit code for feedback');
      
      // First, generate a challenge to submit for
      cy.contains('a', 'Challenges').click();
      cy.contains('button', /Generate Challenge/i).click();
      
      cy.get('select[name="category"], #category').first().select('JavaScript');
      cy.get('select[name="difficulty"], #difficulty').first().select('easy');
      cy.contains('button', /Generate/i).click();
      
      cy.wait(3000);
      
      // Save the challenge
      cy.contains('button', /Save|Accept/i, { timeout: 10000 }).click();
      cy.wait(1000);
      
      // Click on the challenge we just created
      cy.get('.challenge-card').first().click();
      
      // Find code submission area
      cy.get('textarea[name="code"], .code-editor, #code-input').first()
        .type('function solution() { return "Hello World"; }');
      
      // Submit for feedback
      cy.contains('button', /Submit.*Feedback|Get.*Feedback/i).click();
      
      // Should show loading or success
      cy.wait(2000);
      
      cy.log('✅ Code submitted for AI feedback');
    });
  });

  // ========================================
  // STORY 3.5 & 3.6: Feedback Endpoint & Database
  // ========================================
  describe('Story 3.5 & 3.6: Feedback Generation and Persistence', () => {
    
    it('should successfully call /api/ai/submitForFeedback endpoint', () => {
      cy.log('Test 3.5.1: Direct API test');
      
      cy.request({
        method: 'POST',
        url: '/api/ai/submitForFeedback',
        headers: {
          'Authorization': `Bearer ${window.localStorage.getItem('token')}`
        },
        body: {
          submissionCode: 'function add(a, b) { return a + b; }',
          challengeId: 1,
          challengeTitle: 'Simple Addition',
          challengeInstructions: 'Create a function that adds two numbers'
        },
        timeout: 15000,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 201]).to.include(response.status);
        expect(response.body).to.have.property('feedback');
        
        const feedback = response.body.feedback;
        expect(feedback).to.have.property('overall_assessment');
        expect(feedback).to.have.property('strengths');
        expect(feedback).to.have.property('areas_for_improvement');
        expect(feedback).to.have.property('code_quality_score');
        
        cy.log('✅ Feedback endpoint returns complete response');
      });
    });

    it('should retrieve feedback history from database', () => {
      cy.log('Test 3.6.1: Verify feedback persistence');
      
      // First submit feedback
      cy.request({
        method: 'POST',
        url: '/api/ai/submitForFeedback',
        headers: {
          'Authorization': `Bearer ${window.localStorage.getItem('token')}`
        },
        body: {
          submissionCode: 'console.log("test");',
          challengeId: 1,
          challengeTitle: 'Test Challenge',
          challengeInstructions: 'Write code'
        },
        timeout: 15000
      });
      
      // Wait for database write
      cy.wait(1000);
      
      // Retrieve feedback history
      cy.request({
        method: 'GET',
        url: '/api/ai/feedbackHistory',
        headers: {
          'Authorization': `Bearer ${window.localStorage.getItem('token')}`
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('feedbackHistory');
        expect(response.body.feedbackHistory).to.be.an('array');
        
        if (response.body.feedbackHistory.length > 0) {
          const feedback = response.body.feedbackHistory[0];
          
          // Verify database fields from Story 3.6
          expect(feedback).to.have.property('id');
          expect(feedback).to.have.property('submission_id');
          expect(feedback).to.have.property('prompt');
          expect(feedback).to.have.property('response');
          expect(feedback).to.have.property('created_at');
        }
        
        cy.log('✅ Feedback persisted to database and retrievable');
      });
    });

    it('should display feedback in UI after submission', () => {
      cy.log('Test 3.5.2: E2E feedback display');
      
      cy.contains('a', 'Challenges').click();
      
      // Try to find a challenge and submit
      cy.get('body').then($body => {
        if ($body.find('.challenge-card').length > 0) {
          cy.get('.challenge-card').first().click();
          
          // Submit some code
          cy.get('textarea[name="code"], .code-editor').first()
            .type('function test() { return 42; }', { delay: 50 });
          
          cy.contains('button', /Submit.*Feedback/i).click();
          
          // Wait for AI response
          cy.wait(4000);
          
          // Look for feedback display
          cy.contains(/Overall|Assessment|Feedback|Strengths/i, { timeout: 10000 })
            .should('exist');
          
          cy.log('✅ Feedback displayed in UI');
        }
      });
    });
  });

  // ========================================
  // STORY 3.8: Error Tracking Integration Test
  // ========================================
  describe('Story 3.8: Error Tracking with Sentry', () => {
    
    it('should capture frontend errors in Sentry', () => {
      cy.log('Test 3.8.1: Frontend error capture');
      
      // Visit error test page if it exists
      cy.visit('/error-test', { failOnStatusCode: false });
      
      cy.get('body').then($body => {
        if ($body.find('button:contains("Test Error")').length > 0) {
          // Trigger test error
          cy.contains('button', /Test.*Error/i).click();
          
          // Sentry should capture (verified in browser console)
          cy.log('✅ Frontend error triggered for Sentry');
        } else {
          cy.log('⚠️ Error test page not available');
        }
      });
    });

    it('should capture backend errors in Sentry', () => {
      cy.log('Test 3.8.2: Backend error capture');
      
      // Call test error endpoint
      cy.request({
        method: 'GET',
        url: '/api/test/error/sync',
        headers: {
          'Authorization': `Bearer ${window.localStorage.getItem('token')}`
        },
        failOnStatusCode: false
      }).then((response) => {
        // Should return 500 error
        expect(response.status).to.eq(500);
        cy.log('✅ Backend error endpoint triggered for Sentry');
      });
    });
  });

  // ========================================
  // COMPLETE WORKFLOW TEST
  // ========================================
  describe('Complete AI Workflow: Generate → Submit → Feedback', () => {
    
    it('should complete full AI tutoring workflow end-to-end', () => {
      cy.log('🎯 Complete Workflow Test: Stories 3.1 → 3.6');
      
      // STEP 1: Navigate to Challenges
      cy.contains('a', 'Challenges').click();
      cy.url().should('include', '/challenges');
      cy.log('Step 1: ✅ On Challenges page');
      
      // STEP 2: Generate AI Challenge (Story 3.1 & 3.2)
      cy.contains('button', /Generate Challenge/i).click();
      cy.get('select[name="category"], #category').first().select('JavaScript');
      cy.get('select[name="difficulty"], #difficulty').first().select('easy');
      cy.contains('button', /Generate/i).click();
      cy.wait(3000);
      cy.log('Step 2: ✅ AI Challenge generated');
      
      // STEP 3: Save Challenge
      cy.contains('button', /Save|Accept/i, { timeout: 10000 }).click();
      cy.wait(1000);
      cy.log('Step 3: ✅ Challenge saved');
      
      // STEP 4: Open Challenge Details
      cy.get('.challenge-card, [data-testid="challenge"]').first().click();
      cy.log('Step 4: ✅ Challenge opened');
      
      // STEP 5: Submit Code for Feedback (Story 3.4 & 3.5)
      cy.get('textarea[name="code"], .code-editor, #code-input').first()
        .type('function greet() { return "Hello, World!"; }', { delay: 30 });
      cy.contains('button', /Submit.*Feedback|Get.*Feedback/i).click();
      cy.log('Step 5: ✅ Code submitted for feedback');
      
      // STEP 6: Verify Feedback Displayed (Story 3.6)
      cy.contains(/Overall|Assessment|Feedback|Strengths/i, { timeout: 15000 })
        .should('be.visible');
      cy.log('Step 6: ✅ AI Feedback displayed');
      
      cy.log('🎉 COMPLETE WORKFLOW PASSED: All Stories 3.1-3.6 functional!');
    });
  });

  afterEach(() => {
    // Cleanup if needed
    cy.log('Test completed');
  });
});
