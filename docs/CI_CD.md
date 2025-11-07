# GitHub Actions CI/CD Setup

This document describes the continuous integration and deployment workflows for the SkillWise AI Tutor project.

---

## CI Pipeline Overview

The CI pipeline runs automatically on every pull request and push to main/develop branches. It consists of multiple jobs that run in parallel and sequentially to ensure code quality.

### Pipeline Stages

```
┌─────────────────────────────────────────────┐
│  Pull Request / Push to Main               │
└─────────────┬───────────────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼                   ▼
┌─────────┐       ┌──────────┐
│  Lint   │       │  Lint    │
│ Backend │       │ Frontend │
└────┬────┘       └────┬─────┘
     │                 │
     │    ┌────────────┤
     │    │            │
     ▼    ▼            ▼
┌──────────┐      ┌──────────┐      ┌────────┐
│ Backend  │      │ Frontend │      │ Build  │
│  Tests   │      │  Tests   │      │ Check  │
└────┬─────┘      └────┬─────┘      └────────┘
     │                 │
     └────────┬────────┘
              │
              ▼
         ┌─────────┐
         │   E2E   │
         │  Tests  │
         └────┬────┘
              │
              ▼
         ┌─────────┐
         │Success! │
         └─────────┘
```

---

## Workflow Jobs

### 1. **Lint Backend** (`lint-backend`)
- **Purpose:** Check backend code quality and style
- **Tools:** ESLint
- **Runs on:** Every PR/push
- **Dependencies:** None (runs in parallel)

**Commands:**
```bash
cd backend
npm ci
npm run lint
```

### 2. **Lint Frontend** (`lint-frontend`)
- **Purpose:** Check frontend code quality and style
- **Tools:** ESLint
- **Runs on:** Every PR/push
- **Dependencies:** None (runs in parallel)

**Commands:**
```bash
cd frontend
npm ci
npm run lint
```

### 3. **Backend Unit Tests** (`test-backend`)
- **Purpose:** Run backend integration tests
- **Tools:** Jest, Supertest
- **Services:** PostgreSQL 15, Redis 7
- **Dependencies:** Requires `lint-backend` to pass
- **Coverage:** Uploads to Codecov

**Environment:**
- PostgreSQL container on port 5432
- Redis container on port 6379
- Test database migrations run automatically

**Commands:**
```bash
cd backend
npm ci
npm run migrate
npm test -- --coverage --maxWorkers=2
```

### 4. **Frontend Unit Tests** (`test-frontend`)
- **Purpose:** Run frontend unit tests
- **Tools:** Jest, React Testing Library
- **Dependencies:** Requires `lint-frontend` to pass
- **Coverage:** Uploads to Codecov

**Commands:**
```bash
cd frontend
npm ci
npm test -- --coverage --watchAll=false
```

### 5. **E2E Tests** (`e2e-tests`)
- **Purpose:** Run end-to-end smoke tests
- **Tools:** Cypress
- **Dependencies:** Requires both backend and frontend tests to pass
- **Services:** Full application stack (PostgreSQL, Redis, Backend, Frontend)

**Process:**
1. Start PostgreSQL and Redis services
2. Run database migrations
3. Start backend server on port 3001
4. Build and serve frontend on port 3000
5. Wait for services to be ready
6. Run Cypress tests in Chrome
7. Upload screenshots/videos on failure

**Commands:**
```bash
# Backend
cd backend && npm start &

# Frontend
cd frontend && npm run build && npx serve -s build -l 3000 &

# E2E Tests
cd frontend && npx cypress run --browser chrome
```

### 6. **Build Check** (`build-check`)
- **Purpose:** Verify production build succeeds
- **Dependencies:** Requires linting to pass
- **Output:** Verifies `frontend/build` directory exists

**Commands:**
```bash
cd frontend
npm ci
npm run build
```

### 7. **CI Success** (`ci-success`)
- **Purpose:** Final status check
- **Dependencies:** All previous jobs must pass
- **Output:** Success message with checkmarks

---

## Environment Variables

### Required in GitHub Secrets
The following secrets should be configured in GitHub repository settings:

- `CODECOV_TOKEN` (optional) - For coverage reports
- Database credentials are handled by Docker services in CI

### CI Environment Variables
Set automatically in the workflow:
```yaml
NODE_ENV: test
DATABASE_URL: postgresql://skillwise_user:skillwise_pass@localhost:5432/skillwise_db
JWT_SECRET: test-jwt-secret-key-for-ci-only
JWT_REFRESH_SECRET: test-refresh-secret-key-for-ci-only
REDIS_URL: redis://localhost:6379
```

---

## Running Locally

To run the same checks locally before pushing:

### Lint
```bash
# Backend
cd backend && npm run lint

# Frontend  
cd frontend && npm run lint
```

### Fix Linting Issues
```bash
# Backend
cd backend && npm run lint:fix

# Frontend
cd frontend && npm run lint:fix
```

### Unit Tests
```bash
# Backend
docker-compose exec backend npm test

# Frontend
cd frontend && npm test
```

### E2E Tests
```bash
# Start the application
docker-compose up -d

# Run Cypress
cd frontend && npm run cypress:run

# Or interactive mode
cd frontend && npm run cypress:open
```

---

## Pull Request Workflow

When you create a pull request:

1. ✅ **Automatic Checks Run** - GitHub Actions triggers the CI pipeline
2. ⏳ **Status Checks** - PR shows pending status for each job
3. ✅ **All Pass** - PR is ready for review and merge
4. ❌ **Failure** - Review logs, fix issues, push updates

### Required Status Checks
Configure these as required in GitHub branch protection:
- `lint-backend`
- `lint-frontend`
- `test-backend`
- `test-frontend`
- `e2e-tests`
- `build-check`
- `ci-success`

---

## Viewing Results

### In GitHub UI
1. Go to the **Actions** tab in the repository
2. Click on the workflow run
3. View each job's logs and status
4. Download artifacts (screenshots, videos) if tests fail

### Status Badge
Add to README.md:
```markdown
![CI Pipeline](https://github.com/davidmoss11/SkillWise_AITutor_Initial-Setup/actions/workflows/ci.yml/badge.svg)
```

### Coverage Reports
- Backend coverage: Uploaded to Codecov with `backend` flag
- Frontend coverage: Uploaded to Codecov with `frontend` flag
- View detailed reports at codecov.io

---

## Troubleshooting

### Common Issues

**"npm ERR! network" errors**
- Solution: Retry the workflow, GitHub Actions may have network issues

**Database connection failures**
- Solution: Ensure PostgreSQL service health checks pass
- Check `DATABASE_URL` environment variable

**Cypress timeout errors**
- Solution: Increase `wait-on-timeout` in workflow
- Check if frontend/backend servers started successfully

**Build failures**
- Solution: Run `npm run build` locally to reproduce
- Check for missing dependencies or environment variables

### Debug Tips

**Enable debug logging:**
```bash
# Add to workflow
env:
  DEBUG: '*'
  ACTIONS_RUNNER_DEBUG: true
  ACTIONS_STEP_DEBUG: true
```

**View detailed logs:**
- Click on failed job in GitHub Actions
- Expand each step to see command output
- Download logs for offline analysis

---

## Workflow Configuration

### Trigger Events
```yaml
on:
  pull_request:
    branches: [ main, develop, Tucker---D8 ]
  push:
    branches: [ main, develop ]
```

### Job Dependencies
```
lint-backend → test-backend ──┐
                               ├─→ e2e-tests → ci-success
lint-frontend → test-frontend ─┤
                               │
lint-backend, lint-frontend ───→ build-check ──┘
```

### Caching Strategy
- **Node modules:** Cached by `actions/setup-node@v4`
- **Cache key:** Based on `package-lock.json` hash
- **Speeds up:** Dependency installation (from ~2min to ~30sec)

---

## Maintenance

### Updating Dependencies
```bash
# Update GitHub Actions
# Check for new versions at: https://github.com/marketplace?type=actions

# Update Node.js version
# Modify node-version in .github/workflows/ci.yml
```

### Adding New Tests
1. Add test files to appropriate directories
2. Tests are automatically discovered by Jest/Cypress
3. No workflow changes needed

### Modifying Workflow
1. Edit `.github/workflows/ci.yml`
2. Commit and push changes
3. Workflow updates apply immediately

---

## Best Practices

### For Developers
- ✅ Run linting and tests locally before pushing
- ✅ Fix failing CI checks promptly
- ✅ Review CI logs when checks fail
- ✅ Keep dependencies up to date
- ✅ Write tests for new features

### For Reviewers
- ✅ Wait for CI to pass before reviewing
- ✅ Check coverage reports for new code
- ✅ Review Cypress test results
- ✅ Verify build succeeds

---

## Future Enhancements

### Planned Additions
- [ ] Deploy to staging environment on merge to develop
- [ ] Deploy to production on merge to main
- [ ] Automated dependency updates (Dependabot)
- [ ] Security scanning (Snyk, npm audit)
- [ ] Performance testing
- [ ] Docker image builds and registry push
- [ ] Slack/Discord notifications for build status

---

## Support

For issues with CI/CD:
1. Check workflow logs in GitHub Actions
2. Reproduce locally using Docker
3. Review this documentation
4. Contact the DevOps team

---

**Last Updated:** November 7, 2025  
**Workflow Version:** 1.0.0  
**Maintained by:** SkillWise Development Team
