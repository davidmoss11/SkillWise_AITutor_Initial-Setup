# CI Pipeline Quick Reference

## 🚀 Quick Commands

### Run Checks Locally Before PR
```bash
# Lint
cd backend && npm run lint
cd frontend && npm run lint

# Fix lint issues
npm run lint:fix

# Test
docker-compose exec backend npm test
cd frontend && npm test

# E2E
cd frontend && npm run cypress:run
```

## 📊 CI Job Flow

```
PR Created/Updated
        │
        ├─── lint-backend ──→ test-backend ──┐
        │                                     │
        └─── lint-frontend ─→ test-frontend ─┤
                    │                         ├─→ e2e-tests ─→ ✅
                    └───────→ build-check ────┘
```

## ⏱️ Expected Durations

- **lint-backend:** ~1-2 min
- **lint-frontend:** ~1-2 min  
- **test-backend:** ~3-5 min
- **test-frontend:** ~2-3 min
- **e2e-tests:** ~5-7 min
- **build-check:** ~2-3 min
- **Total:** ~12 min

## ✅ Required Checks

All must pass to merge:
- [x] lint-backend
- [x] lint-frontend
- [x] test-backend
- [x] test-frontend
- [x] e2e-tests
- [x] build-check
- [x] ci-success

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Lint failure | Run `npm run lint:fix` locally |
| Test timeout | Increase timeout in test file |
| E2E failure | Check screenshots in Artifacts |
| Build failure | Run `npm run build` locally |
| DB connection | Check PostgreSQL service health |

## 📝 View Results

1. Go to **Actions** tab in GitHub
2. Click on workflow run
3. View job logs
4. Download artifacts if needed

## 🔗 Links

- [Full CI/CD Documentation](./CI_CD.md)
- [Testing Guide](./TESTING.md)
- [Story 2.8 Summary](./STORY_2.8_SUMMARY.md)
