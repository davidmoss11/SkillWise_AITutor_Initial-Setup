Run the SkillWise project locally

This document explains how to run the project locally for development and testing. Two approaches are supported: with Docker Compose (recommended) and without Docker (manual).

Prerequisites

- Docker Desktop (Windows) OR Node.js v18+, npm, and PostgreSQL 15 installed locally
- Git

Option A — Recommended: Run with Docker Compose

1. Start Docker Desktop and ensure the engine is running.
2. From the repository root:

```powershell
# Build and start services in the background
docker-compose up --build -d
```

3. Confirm services:

```powershell
docker-compose ps
# You should see skillwise_frontend (3000), skillwise_backend (3001), skillwise_db (5433), skillwise_redis (6379)
```

4. View logs if needed:

```powershell
# Tail backend logs
docker-compose logs -f backend

# Tail frontend logs
docker-compose logs -f frontend
```

5. Open the apps in your browser:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api (health: /api/health)

6. To run the database migrations (if needed):

```powershell
# Execute migration script inside backend container
docker-compose exec backend node scripts/migrate.js
```

7. To stop and remove containers:

```powershell
docker-compose down -v
```

Option B — Run without Docker (manual)

1. Backend

- Install dependencies and set env var DATABASE_URL pointing at your local Postgres instance.

```powershell
cd backend
npm install
$env:DATABASE_URL='postgresql://skillwise_user:skillwise_pass@localhost:5432/skillwise_db'
node scripts/migrate.js
npm run dev
```

2. Frontend

```powershell
cd frontend
npm install
npm start
```

- Frontend will run at http://localhost:3000 and the backend at http://localhost:3001 by default.

Troubleshooting

- If you see `ERR_CONNECTION_REFUSED` on localhost:3000 or :3001, make sure Docker is running and that the containers are Up.
- If the frontend container restarts with `Could not find a required file Name: index.html`, ensure the `frontend/public/index.html` file exists (it is included in this repo).
- If Postgres migrations do not run automatically (e.g., existing DB volume), run `node scripts/migrate.js` to create missing tables.
- If ports are in use, update `docker-compose.yml` to map to different host ports.

Security Note

- The docker-compose file includes development secrets for convenience only. Do not use these values in production. Rotate secrets before deploying publicly.

Support

- If you hit problems, paste the output of the following commands so someone can help debug:
  - `docker-compose ps`
  - `docker-compose logs --tail=200 backend`
  - `docker-compose logs --tail=200 frontend`
  - `Invoke-RestMethod -Uri 'http://localhost:3001/api/health'`

Happy hacking!
