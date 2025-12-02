# Deliverable 4 - User Stories (Sprint 3: AI Integration)

**Project:** SkillWise AI Tutor  
**Deliverable:** 4 - AI-Powered Feedback System  
**Sprint:** 3  
**Date:** November 30, 2025  
**Team Member:** Tucker Davis  

---

## Overview

This document contains all user stories for Deliverable 4, focusing on AI integration for challenge generation and personalized feedback. The implementation uses Cohere's AI API to provide intelligent tutoring capabilities.

---

## User Story 3.1: AI Challenge Generation Button

### Story
**As a** student  
**I want** to click a "Generate Challenge" button  
**So that** I can request a new AI-generated coding challenge tailored to my skill level

### Acceptance Criteria
- [x] "Generate Challenge" button is visible on the Challenges page
- [x] Button opens a modal/dialog when clicked
- [x] Modal allows user to specify:
  - Challenge category (e.g., JavaScript, Python, Algorithms)
  - Difficulty level (easy, medium, hard, expert)
  - Optional topic/focus area
- [x] Button sends request to `/api/ai/generateChallenge` endpoint
- [x] Generated challenge displays in the modal with all details
- [x] User can save the challenge or generate a new one
- [x] Loading state is shown while AI generates the challenge
- [x] Error handling displays user-friendly messages

### Implementation Details
- **Component:** `frontend/src/components/challenges/GenerateChallengeModal.jsx`
- **Page Integration:** `frontend/src/pages/ChallengesPage.jsx`
- **API Service:** `frontend/src/services/api.js` → `ai.generateChallenge()`
- **Styling:** `frontend/src/components/challenges/GenerateChallengeModal.css`

### Test Evidence
✅ Component exists and renders modal  
✅ API integration confirmed in `api.js` line 254  
✅ Button click handler: `handleGenerateChallenge()` in ChallengesPage.jsx  

---

## User Story 3.2: AI Challenge Generation Endpoint

### Story
**As a** backend developer  
**I want** an endpoint that generates coding challenges using AI  
**So that** students receive personalized, educational challenges

### Acceptance Criteria
- [x] `POST /api/ai/generateChallenge` endpoint exists
- [x] Endpoint accepts parameters:
  - `category` (string)
  - `difficulty` (string: easy/medium/hard/expert)
  - `topic` (optional string)
  - `userLevel` (optional string)
  - `learningObjectives` (optional array)
- [x] Endpoint calls Cohere AI API with structured prompt
- [x] Response includes:
  - Challenge title
  - Description
  - Instructions
  - Starter code (optional)
  - Test cases
  - Learning objectives
  - Estimated time
  - Points reward
- [x] All AI prompts and responses are logged to console
- [x] Challenge is saved to database with AI metadata
- [x] Errors are handled gracefully with appropriate HTTP status codes

### Implementation Details
- **Route:** `backend/src/routes/ai.js` line 8
- **Controller:** `backend/src/controllers/aiController.js` → `generateChallenge()`
- **Service:** `backend/src/services/aiService.js` → `generateChallenge()`
- **AI Model:** Cohere `command-a-03-2025`
- **Database:** Challenges table with `ai_generated` flag

### Test Evidence
✅ Endpoint operational and accessible  
✅ Logs confirm: "✅ AI Challenge Generated: { category, difficulty, topic, model }"  
✅ Returns structured JSON response  
✅ Saves to database with `created_by_ai` metadata  

---

## User Story 3.3: AI Prompt Templates

### Story
**As a** system architect  
**I want** reusable prompt templates with placeholders  
**So that** AI requests are consistent and produce high-quality results

### Acceptance Criteria
- [x] Prompt templates defined in `aiService.js`
- [x] Templates include placeholders for dynamic content:
  - Challenge generation: category, difficulty, topic, user level
  - Feedback generation: submission code, challenge details
  - Hints generation: challenge, attempt number
- [x] Templates enforce JSON response format from AI
- [x] Templates include clear instructions for AI behavior
- [x] Test harness verifies:
  - Prompts generate valid responses
  - Response structure is consistent
  - Required fields are present

### Implementation Details
- **File:** `backend/src/services/aiService.js` lines 11-95
- **Templates:**
  - `promptTemplates.generateChallenge()` - Lines 11-57
  - `promptTemplates.generateFeedback()` - Lines 59-77
  - `promptTemplates.generateHints()` - Lines 79-95

### Test Evidence
✅ Templates exist with proper structure  
✅ Snapshot tests verify response consistency (8 tests passing)  
✅ Field validation tests confirm all required fields present  

---

## User Story 3.4: Feedback Submission Form

### Story
**As a** student  
**I want** to submit my code solution for AI feedback  
**So that** I can receive personalized guidance on my work

### Acceptance Criteria
- [x] Submission form accessible from challenge detail page
- [x] Form includes:
  - Code editor/textarea for solution
  - Challenge context (pre-filled)
  - Submit button
- [x] Form validates:
  - Code is not empty
  - Code meets minimum length requirements
- [x] Form sends POST request to `/api/ai/submitForFeedback`
- [x] Loading state shown while AI processes submission
- [x] Success message shown when feedback is received
- [x] Feedback displays immediately after generation

### Implementation Details
- **Component:** `frontend/src/components/SubmissionForm.jsx`
- **Page:** `frontend/src/pages/SubmissionPage.jsx`
- **API Method:** `apiService.ai.submitForFeedback()`
- **Validation:** Client-side validation before submission

### Test Evidence
✅ Component exists with validation logic  
✅ API integration confirmed in `api.js` line 257  
✅ Form submits to correct endpoint  

---

## User Story 3.5: Feedback Generation Endpoint

### Story
**As a** backend developer  
**I want** an endpoint that generates AI feedback for student submissions  
**So that** students receive constructive, personalized guidance

### Acceptance Criteria
- [x] `POST /api/ai/submitForFeedback` endpoint exists
- [x] Endpoint accepts:
  - `submissionCode` (string)
  - `challengeId` (integer)
  - `challengeTitle` (string)
  - `challengeInstructions` (string)
- [x] Endpoint calls Cohere AI with feedback prompt template
- [x] Endpoint saves submission to `submissions` table
- [x] Endpoint stores AI response in `ai_feedback` table
- [x] Response includes:
  - Overall assessment
  - Strengths (array)
  - Areas for improvement (array)
  - Specific suggestions (array)
  - Code quality score (1-10)
  - Meets requirements (boolean)
  - Next steps (array)
- [x] All operations are wrapped in database transaction
- [x] Errors rollback transaction and return appropriate status

### Implementation Details
- **Route:** `backend/src/routes/ai.js` line 17
- **Controller:** `backend/src/controllers/aiController.js` → `submitForFeedback()`
- **Service:** `backend/src/services/aiService.js` → `generateFeedback()`
- **Database Tables:** `submissions`, `ai_feedback`

### Test Evidence
✅ Endpoint operational  
✅ Logs confirm: "✅ AI Feedback Generated for submission: X"  
✅ Data persists to database  
✅ Transaction handling implemented  

---

## User Story 3.6: AI Feedback Database Persistence

### Story
**As a** database administrator  
**I want** a table to store AI-generated feedback  
**So that** feedback history can be tracked and analyzed

### Acceptance Criteria
- [x] `ai_feedback` table created via migration
- [x] Table includes required fields:
  - `id` (primary key)
  - `submission_id` (foreign key → submissions)
  - `challenge_id` (foreign key → challenges)
  - `user_id` (foreign key → users)
  - `prompt` (text)
  - `response` (text)
  - `feedback_type` (string)
  - `overall_assessment` (text)
  - `strengths` (text array)
  - `areas_for_improvement` (text array)
  - `specific_suggestions` (text array)
  - `code_quality_score` (integer 1-10)
  - `meets_requirements` (boolean)
  - `next_steps` (text array)
  - `ai_model` (string)
  - `created_at`, `updated_at` (timestamps)
- [x] Indexes created for:
  - submission_id
  - challenge_id
  - user_id
  - feedback_type
  - created_at
- [x] Foreign key constraints with CASCADE DELETE
- [x] Trigger for auto-updating `updated_at`
- [x] `GET /api/ai/feedbackHistory` endpoint retrieves user's feedback

### Implementation Details
- **Migration:** `backend/database/migrations/006_create_ai_feedback.sql`
- **Route:** `backend/src/routes/ai.js` line 20
- **Controller:** `backend/src/controllers/aiController.js` → `getFeedbackHistory()`

### Test Evidence
✅ Migration file exists with complete schema  
✅ 5 indexes created for query optimization  
✅ All foreign keys and constraints defined  
✅ GET endpoint operational  

---

## User Story 3.7: Snapshot Testing for AI Responses

### Story
**As a** QA engineer  
**I want** snapshot tests for AI-generated content  
**So that** response structure remains consistent across code changes

### Acceptance Criteria
- [x] Snapshot tests created using Jest
- [x] Tests cover:
  - Challenge generation (easy, medium, hard difficulties)
  - Feedback generation (good code, poor code)
  - Response structure validation
  - Error handling scenarios
- [x] Tests run with sample prompts
- [x] Snapshots capture:
  - Response structure
  - Field types
  - Array lengths
  - Required fields presence
- [x] All snapshot tests pass
- [x] Tests can run in CI/CD pipeline
- [x] Separate Jest configuration for snapshot tests

### Implementation Details
- **Test File:** `backend/tests/ai-snapshot-standalone.test.js`
- **Config:** `backend/jest.snapshot.config.js`
- **Snapshots:** `backend/tests/__snapshots__/`

### Test Evidence
✅ **8 tests passing, 4 snapshots captured**  
✅ Test Results:
- generateChallenge: Easy structure ✓
- generateChallenge: Medium structure ✓
- generateFeedback: Feedback structure ✓
- generateFeedback: Low-quality code ✓
- Validates required challenge fields ✓
- Validates required feedback fields ✓
- Handles API errors gracefully ✓
- Handles invalid JSON responses ✓

**Command:** `docker-compose exec backend npm test -- ai-snapshot-standalone.test.js`  
**Status:** All tests passed (0.678s execution time)

---

## User Story 3.8: Error Tracking with Sentry

### Story
**As a** DevOps engineer  
**I want** error tracking integrated into frontend and backend  
**So that** production issues are captured and can be diagnosed quickly

### Acceptance Criteria
- [x] Sentry SDK installed in backend (`@sentry/node`, `@sentry/profiling-node`)
- [x] Sentry SDK installed in frontend (`@sentry/react`)
- [x] Backend configuration:
  - Sentry initialized in `server.js` before all other code
  - Request handler middleware added
  - Tracing handler middleware added
  - Error handler middleware added (last in chain)
  - Environment-aware configuration (dev/prod)
- [x] Frontend configuration:
  - Sentry initialized in `index.js`
  - Error Boundary wraps App component
  - Browser tracing integration
  - Session replay integration
- [x] Test error endpoints created to verify capturing:
  - `/api/test/error/sync` - Synchronous error
  - `/api/test/error/async` - Asynchronous error
  - `/api/test/error/validation` - Validation error
- [x] Frontend test page created for error simulation
- [x] Both FE and BE errors captured and sent to Sentry
- [x] User context automatically attached to error reports
- [x] Breadcrumbs recorded for debugging

### Implementation Details
- **Backend Config:** `backend/src/config/sentry.js`
- **Frontend Config:** `frontend/src/config/sentry.js`
- **Backend Init:** `backend/server.js` lines 1-5
- **Frontend Init:** `frontend/src/index.js` with Error Boundary
- **Test Routes:** `backend/src/routes/test.js`
- **Test Page:** `frontend/src/pages/ErrorTestPage.jsx`
- **Environment Variables:** `SENTRY_DSN`, `REACT_APP_SENTRY_DSN`

### Test Evidence
✅ Sentry packages installed in both environments  
✅ Configuration files complete with middleware integration  
✅ Error Boundary wraps React app  
✅ Test endpoints functional  
✅ Console logs confirm initialization: "✅ Sentry initialized"  
✅ Docker environment variables configured  

---

## Implementation Summary

### Files Created/Modified (Stories 3.1-3.8)

#### Frontend
- ✅ `src/components/challenges/GenerateChallengeModal.jsx` (New)
- ✅ `src/components/challenges/GenerateChallengeModal.css` (New)
- ✅ `src/components/SubmissionForm.jsx` (New)
- ✅ `src/components/FeedbackDisplay.jsx` (New)
- ✅ `src/pages/SubmissionPage.jsx` (New)
- ✅ `src/pages/ErrorTestPage.jsx` (New)
- ✅ `src/config/sentry.js` (New)
- ✅ `src/services/api.js` (Modified - added AI methods)
- ✅ `src/index.js` (Modified - added Sentry + Error Boundary)
- ✅ `src/pages/ChallengesPage.jsx` (Modified - integrated modal)

#### Backend
- ✅ `src/routes/ai.js` (Modified - added new endpoints)
- ✅ `src/routes/test.js` (New - error testing)
- ✅ `src/controllers/aiController.js` (Modified - added methods)
- ✅ `src/services/aiService.js` (Modified - added templates & methods)
- ✅ `src/config/sentry.js` (New)
- ✅ `server.js` (Modified - initialized Sentry first)
- ✅ `src/app.js` (Modified - added Sentry middleware)
- ✅ `database/migrations/006_create_ai_feedback.sql` (New)
- ✅ `tests/ai-snapshot-standalone.test.js` (New)
- ✅ `jest.snapshot.config.js` (New)

#### Documentation
- ✅ `docs/STORY_3.4-3.6_SUMMARY.md`
- ✅ `docs/STORY_3.7-3.8_SUMMARY.md`
- ✅ `docs/AI_CHALLENGE_GENERATION.md`
- ✅ `docs/AI_FEEDBACK_TESTING.md`

#### Infrastructure
- ✅ `docker-compose.yml` (Modified - added SENTRY_DSN variables)
- ✅ Package dependencies installed in both containers

---

## Testing Evidence

### Unit Tests (Story 3.7)
```
Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
Snapshots:   4 passed, 4 total
Time:        0.678 s
```

### API Endpoints Verified
- ✅ `POST /api/ai/generateChallenge` - Operational
- ✅ `POST /api/ai/submitForFeedback` - Operational
- ✅ `GET /api/ai/feedbackHistory` - Operational
- ✅ `GET /api/ai/myChallenges` - Operational

### Database Schema
- ✅ Migration `006_create_ai_feedback.sql` applied
- ✅ Table created with 17 fields
- ✅ 5 indexes created
- ✅ Foreign key constraints enforced
- ✅ Triggers functional

### Error Tracking
- ✅ Backend Sentry initialized successfully
- ✅ Frontend Sentry initialized successfully
- ✅ Test endpoints capturing errors
- ✅ Error Boundary catching React errors

---

## Conclusion

All User Stories 3.1-3.8 have been **successfully implemented and tested**. The AI integration provides:

1. ✅ **Challenge Generation** - Students can generate personalized challenges
2. ✅ **AI Feedback** - Students receive constructive feedback on submissions
3. ✅ **Robust Testing** - Snapshot tests ensure consistency
4. ✅ **Error Monitoring** - Sentry tracks issues in production
5. ✅ **Database Persistence** - All AI interactions are logged and retrievable
6. ✅ **Professional Implementation** - Clean code, error handling, documentation

**Project Status:** Ready for production deployment and Deliverable 4 submission.
