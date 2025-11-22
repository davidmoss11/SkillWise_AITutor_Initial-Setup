# Backend Structure Guidelines

## Technology Stack

- **Node.js (LTS)** with Express.js
- **PostgreSQL** database with Docker
- **JWT** authentication with httpOnly cookies
- **bcrypt** for password hashing
- **Zod** for request validation
- **pino** for logging

## Folder Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── goalController.js
│   │   ├── challengeController.js
│   │   ├── progressController.js
│   │   ├── submissionController.js
│   │   ├── aiController.js
│   │   ├── peerReviewController.js
│   │   └── leaderboardController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   ├── logger.js
│   │   └── cors.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Goal.js
│   │   ├── Challenge.js
│   │   ├── Progress.js
│   │   ├── Submission.js
│   │   ├── AIFeedback.js
│   │   ├── PeerReview.js
│   │   └── Leaderboard.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── goals.js
│   │   ├── challenges.js
│   │   ├── progress.js
│   │   ├── submissions.js
│   │   ├── ai.js
│   │   ├── reviews.js
│   │   └── leaderboard.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── goalService.js
│   │   ├── challengeService.js
│   │   ├── progressService.js
│   │   ├── aiService.js
│   │   ├── emailService.js
│   │   └── leaderboardService.js
│   ├── database/
│   │   ├── connection.js
│   │   ├── migrations/
│   │   │   ├── 001_create_users.sql
│   │   │   ├── 002_create_goals.sql
│   │   │   ├── 003_create_challenges.sql
│   │   │   ├── 004_create_progress.sql
│   │   │   ├── 005_create_submissions.sql
│   │   │   ├── 006_create_ai_feedback.sql
│   │   │   ├── 007_create_peer_reviews.sql
│   │   │   └── 008_create_leaderboard.sql
│   │   └── seeds/
│   │       ├── users.js
│   │       ├── goals.js
│   │       └── challenges.js
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── validators.js
│   │   ├── helpers.js
│   │   ├── constants.js
│   │   └── errors.js
│   ├── config/
│   │   ├── database.js
│   │   ├── auth.js
│   │   ├── ai.js
│   │   └── server.js
│   └── app.js
├── tests/
│   ├── unit/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── utils/
│   ├── integration/
│   │   ├── auth.test.js
│   │   ├── goals.test.js
│   │   ├── challenges.test.js
│   │   └── ai.test.js
│   └── fixtures/
│       ├── users.json
│       ├── goals.json
│       └── challenges.json
├── docs/
│   ├── api/
│   │   ├── swagger.yaml
│   │   └── endpoints.md
│   └── database/
│       ├── schema.md
│       └── relationships.md
├── scripts/
│   ├── migrate.js
│   ├── seed.js
│   └── deploy.js
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── server.js
└── README.md
```

## API Endpoints Structure

### Authentication Routes (`/api/auth`)

- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /refresh` - Refresh access token
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile

### Goals Routes (`/api/goals`)

- `GET /` - Get user's goals
- `POST /` - Create new goal
- `GET /:id` - Get specific goal
- `PUT /:id` - Update goal
- `DELETE /:id` - Delete goal

### Challenges Routes (`/api/challenges`)

- `GET /` - Get challenges for a goal
- `POST /` - Create new challenge
- `GET /:id` - Get specific challenge
- `PUT /:id` - Update challenge
- `DELETE /:id` - Delete challenge

### Progress Routes (`/api/progress`)

- `GET /goals/:goalId` - Get progress for a goal
- `POST /` - Update progress
- `GET /dashboard` - Get dashboard data

### Submissions Routes (`/api/submissions`)

- `POST /` - Submit work for challenge
- `GET /challenge/:challengeId` - Get submissions for challenge
- `GET /:id` - Get specific submission
- `PUT /:id/review` - Add peer review

### AI Routes (`/api/ai`)

- `POST /generate-challenges` - Generate challenges for goal
- `POST /feedback` - Get AI feedback on submission
- `POST /explain` - Get explanation for concept

### Leaderboard Routes (`/api/leaderboard`)

- `GET /` - Get leaderboard data
- `GET /user/:userId` - Get user ranking

## Database Schema Design

### Core Tables

- **users** - User authentication and profile data
- **refresh_tokens** - JWT refresh token storage
- **goals** - Learning goals with timelines
- **challenges** - Individual challenges within goals
- **progress** - User progress tracking
- **submissions** - User work submissions
- **ai_feedback** - AI-generated feedback
- **peer_reviews** - Peer review data
- **leaderboard** - User rankings and scores

## Key Features to Implement

### Authentication System

- JWT access/refresh token pattern
- Password hashing with bcrypt
- httpOnly cookie security
- Rate limiting on auth endpoints

### Goal Management

- CRUD operations for learning goals
- Timeline and milestone tracking
- Goal categorization and tagging

### Challenge System

- Manual challenge creation
- AI-generated challenges
- Submission tracking and validation

### AI Integration

- OpenAI API integration
- Prompt template management
- Rate limiting and error handling
- Response caching

### Progress Tracking

- Milestone completion tracking
- Progress percentage calculation
- Activity timeline

### Peer Review System

- Review assignment logic
- Rating and feedback system
- Review quality scoring

### Leaderboard

- Point calculation system
- Ranking algorithms
- Achievement badges

## Security Considerations

- Input validation with Zod
- SQL injection prevention
- XSS protection
- CORS configuration
- Rate limiting
- Environment variable management

## Testing Strategy

- Unit tests for services and utilities
- Integration tests for API endpoints
- Database transaction testing
- AI service mocking
- Authentication flow testing

## Logging and Monitoring

- Structured logging with pino
- Error tracking and alerting
- Performance monitoring
- API usage analytics

## Sprint 3: AI Integration & Monitoring

Implemented user stories 3.1–3.8:

1. Generate Challenge (UI + endpoint): `GET /api/ai/generateChallenge?topic=JS+arrays&difficulty=beginner`
2. Challenge Logging: Prompts and AI responses persisted in `ai_challenge_logs`
3. Prompt Templates: Centralized template service assembling challenge and feedback prompts
4. Submission Feedback Form: Frontend posts code/text for feedback
5. Feedback Endpoint: `POST /api/ai/submitForFeedback` stores prompt, response, and submission linkage
6. Persistence Enhancements: Added `prompt` and `response` columns to `ai_feedback` (migration 013)
7. Snapshot Tests: Stable snapshots for challenge + feedback generation (`tests/aiService.snapshot.test.js`)
8. Sentry Integration: Backend (`src/app.js`) + Frontend initialization for error capture

### New/Updated Database Migrations

- `012_create_ai_challenge_logs.sql` – stores challenge prompt/response metadata
- `013_add_prompt_response_columns_ai_feedback.sql` – extends existing feedback table

### AI Endpoints (Current Scope)

- `GET /api/ai/generateChallenge` – Query params: `topic`, `difficulty`, optional `goal`.
  Response sample:
  ```json
  {
    "challenge": "Implement a function to reverse an array without using built-in reverse.",
    "prompt": "...compiled prompt text..."
  }
  ```
- `POST /api/ai/submitForFeedback`
  Body:
  ```json
  {
    "submissionText": "function reverse(arr){...}",
    "challengeId": 42
  }
  ```
  Response sample:
  ```json
  {
    "feedback": "Consider using two-pointer technique to reduce memory.",
    "prompt": "...feedback prompt..."
  }
  ```

### Environment Variables

| Variable                    | Purpose                                                 |
| --------------------------- | ------------------------------------------------------- |
| `OPENAI_API_KEY`            | Enables real OpenAI responses (mock fallback if absent) |
| `SENTRY_DSN`                | Activates Sentry error/request handlers                 |
| `SENTRY_TRACES_SAMPLE_RATE` | (Optional) Performance trace sampling (default 0.1)     |

If `OPENAI_API_KEY` is not set, the service returns deterministic mock challenge and feedback strings to allow development and testing without external calls.

### Testing

Run all tests:

```bash
npm test
```

Snapshot tests cover AI output structure. To update snapshots after intentional prompt/template changes:

```bash
npm test -- -u
```

### Error Monitoring

When `SENTRY_DSN` is present, request and error handlers capture exceptions. Tracing integrations were simplified—performance traces are optional and can be re-enabled by adding Express tracing integration if needed.

### Usage Notes

- Frontend Challenge generation button triggers `GET /api/ai/generateChallenge` and displays result in a modal.
- Feedback submission posts to `POST /api/ai/submitForFeedback` and renders returned AI feedback.
- Logs and feedback storage are resilient: if tables are missing (early dev), operations fail gracefully without crashing the app.

### Next Improvement Opportunities (Post Sprint 3)

- Add E2E tests (Cypress) exercising challenge generation & feedback flow.
- Enhance UX (loading states, error toasts, retry buttons).
- Add rate limiting specific to AI endpoints distinct from global limit.
- Introduce caching for repeated challenge requests per topic/difficulty.
