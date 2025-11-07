# Story 2.7 - Testing Documentation

## Overview
Comprehensive unit and end-to-end tests for SkillWise AI Tutor workflows.

## Test Coverage

### 1. Backend Integration Tests

#### Goals API Tests (`backend/tests/integration/goals.test.js`)
Comprehensive test suite covering all goal CRUD operations and workflows.

**Test Cases:**
- ✅ Create Goal
  - Create new goal with all fields
  - Fail without authentication (401)
  - Fail with missing required fields (400)

- ✅ Retrieve Goals
  - Return all user goals
  - Filter goals by status
  - Fail without authentication (401)

- ✅ Get Single Goal
  - Return specific goal by ID
  - Return 404 for non-existent goal

- ✅ Update Goal
  - Update goal fields (title, description, priority, progress)
  - Auto-complete when progress reaches 100%
  - Prevent updating another user's goal (404)

- ✅ Delete Goal
  - Delete a goal successfully
  - Verify deletion persists

- ✅ Complete Workflow
  - Create → Update Progress → Complete
  - Verify status changes from 'active' to 'completed'
  - Verify completed_at timestamp is set

**Total: 13 Test Cases**

---

#### Challenges API Tests (`backend/tests/integration/challenges.test.js`)
Comprehensive test suite covering challenge CRUD and goal integration.

**Test Cases:**
- ✅ Create Challenge
  - Create challenge linked to goal
  - Create challenge without goal_id
  - Fail without authentication (401)
  - Fail with missing required fields (400)

- ✅ Retrieve Challenges
  - Return all challenges
  - Filter by goal_id
  - Filter by category
  - Filter by difficulty
  - Search by title

- ✅ Get Single Challenge
  - Return specific challenge by ID
  - Return 404 for non-existent challenge

- ✅ Update Challenge
  - Update challenge fields
  - Update status to 'in_progress'
  - Mark challenge as 'completed'
  - Set completed_at timestamp

- ✅ Delete Challenge
  - Delete challenge successfully
  - Verify deletion persists

- ✅ Complete Workflow
  - Create → Start → Complete
  - Verify status transitions: not_started → in_progress → completed

- ✅ Goal-Challenge Integration
  - Link challenge to goal
  - Filter challenges by goal
  - Cascade delete when goal is deleted

**Total: 18 Test Cases**

---

### 2. End-to-End Tests (Cypress)

#### Smoke Test (`frontend/cypress/e2e/smoke-test.cy.js`)
Comprehensive E2E test covering the complete user workflow.

**Primary Workflow Test:**
```
Login → Create Goal → Add Challenge → Mark Complete → Verify Progress
```

**Test Steps:**

1. **Login**
   - Navigate to login page
   - Authenticate as test user
   - Verify redirect to dashboard

2. **Create Goal**
   - Navigate to Goals page
   - Fill out goal creation form
   - Submit and verify goal appears
   - Verify initial progress is 0%

3. **Add Challenge**
   - Navigate to Challenges page
   - Fill out challenge creation form
   - Link challenge to created goal
   - Verify challenge appears with 'not_started' status

4. **Mark Challenge as Complete**
   - Open challenge details
   - Start challenge (in_progress)
   - Complete challenge
   - Verify status is 'completed'

5. **Verify Goal Progress**
   - Navigate back to Goals page
   - Verify progress updated
   - Check progress is no longer 0%

6. **Verify Progress Tracking**
   - Navigate to Progress page
   - Verify goal appears in progress overview
   - Verify statistics are displayed

**Extended Test: Multiple Goals & Challenges**
- Create 2 goals
- Create 2 challenges (one per goal)
- Complete one challenge
- Verify progress on dashboard

**Total: 2 E2E Test Cases**

---

## Test Configuration

### Backend (Jest)
**File:** `backend/jest.config.js`

```javascript
{
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  coverage: {
    collectFrom: ['src/**/*.js'],
    exclude: ['src/database/**', 'src/config/**']
  }
}
```

### Frontend (Cypress)
**File:** `frontend/cypress.config.js`

```javascript
{
  e2e: {
    baseUrl: 'http://localhost:3000',
    env: {
      apiUrl: 'http://localhost:3001/api'
    },
    viewportWidth: 1280,
    viewportHeight: 720
  }
}
```

---

## Running Tests

### Backend Integration Tests
```bash
# Run all integration tests
docker-compose exec backend npm test

# Run specific test suite
docker-compose exec backend npm test -- tests/integration/goals.test.js
docker-compose exec backend npm test -- tests/integration/challenges.test.js

# Run with coverage
docker-compose exec backend npm test:coverage
```

### Frontend E2E Tests
```bash
# Open Cypress Test Runner (interactive)
cd frontend
npm run cypress:open

# Run Cypress tests (headless)
npm run cypress:run

# Run specific test
npm run cypress:run -- --spec "cypress/e2e/smoke-test.cy.js"
```

---

## Custom Cypress Commands

### Authentication
```javascript
// Login with email/password
cy.login('user@example.com', 'password');

// Login as test user (auto-creates if needed)
cy.loginAsTestUser();

// Logout
cy.logout();
```

### Data Management
```javascript
// Clear all goals and challenges for current user
cy.clearTestData();

// Wait for element to be visible
cy.waitForElement('.goal-card', 10000);
```

---

## Test Data

### Test Users
- **Goals Test User:** goals.test@skillwise.com / Test123!
- **Challenges Test User:** challenges.test@skillwise.com / Test123!
- **Cypress Test User:** cypress.test@skillwise.com / Test123!

### Test Database
- Uses same database as development
- Automatically cleaned before/after test runs
- Test data isolated per test suite

---

## Acceptance Criteria ✅

### Story 2.7 Requirements
- [x] Unit tests for goal workflows
  - Create, Read, Update, Delete operations
  - Progress tracking
  - Status transitions
  
- [x] Unit tests for challenge workflows
  - Create, Read, Update, Delete operations
  - Goal linkage
  - Status transitions
  - Cascade deletion

- [x] End-to-end smoke test
  - Login flow
  - Create goal
  - Add challenge
  - Mark complete
  - Verify progress updates

- [x] Test framework setup
  - Jest configured for backend
  - Cypress configured for frontend
  - Custom commands and utilities
  - Test data management

---

## Test Results Summary

### Backend Integration Tests
- **Goals API:** 13 test cases
- **Challenges API:** 18 test cases
- **Total:** 31 test cases

### Frontend E2E Tests
- **Smoke Test:** 2 comprehensive workflows
- **Coverage:** Login → Goal → Challenge → Progress

### Overall Status
✅ **Story 2.7 Complete**
- Comprehensive test coverage
- Both unit and E2E tests implemented
- All critical workflows tested
- Test infrastructure fully configured

---

## Known Issues & Notes

1. **Test Database Connection**
   - Tests use the same database as development
   - Data is cleaned before/after runs
   - Ensure database is running before executing tests

2. **Cypress Prerequisites**
   - Frontend and backend must be running
   - Navigate to http://localhost:3000 should be accessible
   - API at http://localhost:3001/api should respond

3. **Token Management**
   - Tests create fresh users and tokens
   - Tokens are valid for test duration
   - Cleanup removes test users after completion

---

## Future Enhancements

1. **Additional Test Coverage**
   - Submission workflow tests
   - AI feedback integration tests
   - Peer review tests
   - Leaderboard tests

2. **Performance Tests**
   - Load testing for API endpoints
   - Stress testing for concurrent users
   - Database query optimization

3. **Visual Regression Tests**
   - Screenshot comparison
   - Component visual testing
   - Responsive design validation

4. **Accessibility Tests**
   - ARIA label validation
   - Keyboard navigation tests
   - Screen reader compatibility
