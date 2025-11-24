/**
 * Story 2.7 - E2E Smoke Test
 * 
 * This test covers the complete user workflow:
 * 1. Login to the application
 * 2. Create a new goal
 * 3. Add a challenge linked to the goal
 * 4. Mark the challenge as complete
 * 5. Verify the goal progress updates
 */

describe('Story 2.7 - Complete Workflow Smoke Test', () => {
  const testGoalTitle = 'E2E Test Goal - Learn Full Stack Development';
  const testChallengeTitle = 'E2E Test Challenge - Build REST API';

  beforeEach(() => {
    // Clear any existing test data
    cy.clearTestData();
  });

  it('should complete the full workflow: login → create goal → add challenge → mark complete', () => {
    // ========================================
    // STEP 1: LOGIN
    // ========================================
    cy.visit('/login');
    cy.log('Step 1: User Login');

    // Login as test user (creates if doesn't exist)
    cy.loginAsTestUser().then((authData) => {
      expect(authData).to.have.property('token');
      expect(authData).to.have.property('user');
      cy.log('✅ User logged in successfully');
    });

    // Verify redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard').should('be.visible');
    cy.log('✅ Redirected to dashboard');

    // ========================================
    // STEP 2: CREATE GOAL
    // ========================================
    cy.log('Step 2: Create Goal');

    // Navigate to Goals page
    cy.contains('a', 'Goals').click();
    cy.url().should('include', '/goals');
    cy.contains('My Learning Goals').should('be.visible');

    // Click create goal button
    cy.contains('button', 'Create Goal').click();

    // Fill out goal form
    cy.get('input[name="title"]').type(testGoalTitle);
    cy.get('textarea[name="description"]').type('Comprehensive full stack development skills');
    cy.get('select[name="category"]').select('Programming');
    cy.get('select[name="priority"]').select('high');
    
    // Set target date (30 days from now)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30);
    const dateString = targetDate.toISOString().split('T')[0];
    cy.get('input[name="target_date"]').type(dateString);

    // Submit goal form
    cy.contains('button', 'Create Goal').click();

    // Verify goal was created
    cy.contains(testGoalTitle).should('be.visible');
    cy.contains('0%').should('be.visible'); // Initial progress should be 0%
    cy.log('✅ Goal created successfully');

    // ========================================
    // STEP 3: ADD CHALLENGE
    // ========================================
    cy.log('Step 3: Add Challenge');

    // Navigate to Challenges page
    cy.contains('a', 'Challenges').click();
    cy.url().should('include', '/challenges');
    cy.contains('Challenges').should('be.visible');

    // Click create challenge button
    cy.contains('button', 'Create Challenge').click();

    // Fill out challenge form
    cy.get('input[name="title"]').type(testChallengeTitle);
    cy.get('textarea[name="description"]').type('Build a RESTful API with Express and PostgreSQL');
    cy.get('select[name="category"]').select('Web Development');
    cy.get('select[name="difficulty"]').select('intermediate');
    
    // Link to the goal we just created
    cy.get('select[name="goal_id"]').select(testGoalTitle);
    
    cy.get('input[name="points"]').clear().type('100');
    cy.get('input[name="estimated_time"]').type('6 hours');

    // Submit challenge form
    cy.contains('button', 'Create Challenge').click();

    // Verify challenge was created
    cy.contains(testChallengeTitle).should('be.visible');
    cy.contains('not_started').should('be.visible'); // Initial status
    cy.log('✅ Challenge created successfully');

    // ========================================
    // STEP 4: MARK CHALLENGE AS COMPLETE
    // ========================================
    cy.log('Step 4: Mark Challenge as Complete');

    // Find the challenge card and click on it
    cy.contains(testChallengeTitle).parents('.challenge-card').within(() => {
      // Click "View Details" or similar button
      cy.contains('button', /View|Details/i).click();
    });

    // Update challenge status to "in_progress"
    cy.contains('button', 'Start Challenge').click();
    cy.contains('in_progress').should('be.visible');
    cy.log('✅ Challenge marked as in progress');

    // Complete the challenge
    cy.contains('button', 'Complete Challenge').click();
    
    // Confirm completion in modal or dialog if present
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Confirm")').length > 0) {
        cy.contains('button', 'Confirm').click();
      }
    });

    // Verify challenge is marked as completed
    cy.contains('completed', { matchCase: false }).should('be.visible');
    cy.log('✅ Challenge marked as completed');

    // ========================================
    // STEP 5: VERIFY GOAL PROGRESS UPDATED
    // ========================================
    cy.log('Step 5: Verify Goal Progress');

    // Navigate back to Goals page
    cy.contains('a', 'Goals').click();
    cy.url().should('include', '/goals');

    // Find our goal and verify progress updated
    cy.contains(testGoalTitle).parents('.goal-card').within(() => {
      // Progress should no longer be 0%
      cy.get('.progress-bar, .progress').should('exist');
      cy.get('.progress-bar, .progress').should('not.contain', '0%');
    });

    cy.log('✅ Goal progress updated after challenge completion');

    // ========================================
    // STEP 6: VERIFY ON PROGRESS PAGE
    // ========================================
    cy.log('Step 6: Verify Progress Tracking');

    // Navigate to Progress page
    cy.contains('a', 'Progress').click();
    cy.url().should('include', '/progress');

    // Verify goal appears in progress overview
    cy.contains(testGoalTitle).should('be.visible');
    cy.contains('Overall Progress').should('be.visible');
    
    // Verify statistics are displayed
    cy.contains(/Total Goals|Active Goals/i).should('be.visible');
    cy.contains(/Completed|Challenges/i).should('be.visible');

    cy.log('✅ Progress tracking verified');

    // ========================================
    // TEST COMPLETE
    // ========================================
    cy.log('🎉 SMOKE TEST PASSED: Complete workflow successful!');
  });

  it('should handle the workflow with multiple goals and challenges', () => {
    cy.log('Extended Workflow Test: Multiple Goals & Challenges');

    // Login
    cy.visit('/login');
    cy.loginAsTestUser();
    cy.url().should('include', '/dashboard');

    // Create first goal
    cy.contains('a', 'Goals').click();
    cy.contains('button', 'Create Goal').click();
    cy.get('input[name="title"]').type('Learn React');
    cy.get('textarea[name="description"]').type('Master React fundamentals');
    cy.get('select[name="category"]').select('Programming');
    cy.contains('button', 'Create Goal').click();
    cy.contains('Learn React').should('be.visible');

    // Create second goal
    cy.contains('button', 'Create Goal').click();
    cy.get('input[name="title"]').type('Learn Node.js');
    cy.get('textarea[name="description"]').type('Backend development with Node');
    cy.get('select[name="category"]').select('Programming');
    cy.contains('button', 'Create Goal').click();
    cy.contains('Learn Node.js').should('be.visible');

    // Create challenge for first goal
    cy.contains('a', 'Challenges').click();
    cy.contains('button', 'Create Challenge').click();
    cy.get('input[name="title"]').type('Build Todo App');
    cy.get('textarea[name="description"]').type('React todo application');
    cy.get('select[name="category"]').select('Web Development');
    cy.get('select[name="difficulty"]').select('beginner');
    cy.get('select[name="goal_id"]').select('Learn React');
    cy.contains('button', 'Create Challenge').click();

    // Create challenge for second goal
    cy.contains('button', 'Create Challenge').click();
    cy.get('input[name="title"]').type('Build REST API');
    cy.get('textarea[name="description"]').type('Express REST API');
    cy.get('select[name="category"]').select('Backend');
    cy.get('select[name="difficulty"]').select('intermediate');
    cy.get('select[name="goal_id"]').select('Learn Node.js');
    cy.contains('button', 'Create Challenge').click();

    // Verify both challenges exist
    cy.contains('Build Todo App').should('be.visible');
    cy.contains('Build REST API').should('be.visible');

    // Complete first challenge
    cy.contains('Build Todo App').parents('.challenge-card').within(() => {
      cy.contains('button', /View|Details/i).click();
    });
    cy.contains('button', 'Start Challenge').click();
    cy.contains('button', 'Complete Challenge').click();

    // Verify progress on dashboard
    cy.contains('a', 'Dashboard').click();
    cy.contains('Overall Progress').should('be.visible');

    cy.log('✅ Multiple goals and challenges workflow completed');
  });

  afterEach(() => {
    // Clean up test data after each test
    cy.clearTestData();
  });
});
