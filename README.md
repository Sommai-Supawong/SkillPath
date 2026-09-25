# SkillPath

SkillPath is a personalized career readiness and learning roadmap web application. It compares a learner's current skills with career requirements, calculates weighted readiness and skill gaps, resolves prerequisites, and creates an adaptive learning plan based on strategy and weekly study time.

`docs/Document.md` is the primary product specification.

## Features

- Explore 15 seeded careers across software engineering, AI/ML, data, cloud/DevOps, design, and marketing
- Filter the Career Explorer by category
- Create a learner profile without authentication
- Submit or update 0–5 skill assessments
- View weighted career readiness and prioritized gaps
- Generate Balanced, Fast Track, or Foundation First roadmaps
- Enforce prerequisite order and report dependency cycles
- Estimate learning hours and weeks using available study time
- Update progress, recalculate readiness, and adapt the roadmap
- Open recommended learning resources
- Human-readable loading, empty, validation, and error states

## Architecture and OOP

The backend follows `router → service → domain → repository → database`.

- Encapsulation: `Learner.update_skill` and domain constructors protect level and time invariants.
- Abstraction: `GapAnalyzer.analyze` and `RoadmapEngine.generate` hide calculation and scheduling details.
- Inheritance: roadmap strategies implement the abstract `RoadmapStrategy` interface.
- Polymorphism: `RoadmapEngine` ranks through the supplied strategy without strategy-specific conditionals.
- Domain models: `SkillSpec`, `CareerSpec`, `Requirement`, `Learner`, `GapResult`, `RoadmapPlan`, and `RoadmapStep` are independent of HTTP and persistence.

Core algorithms:

- Gap: `max(required - current, 0)`
- Skill readiness: `min(current / required, 1)`
- Career readiness: importance-weighted skill readiness, bounded to 0–100%
- Priority: `gap × importance × dependency factor`, with named and bounded dependency constants
- Scheduling: strategy ranking followed by stable topological ordering and cycle detection
- Estimate: remaining levels × configured hours per level ÷ weekly study hours

## Technology

- Frontend: Next.js 15, React 19, TypeScript, App Router
- Backend: Python, FastAPI, Pydantic, SQLAlchemy
- Database: PostgreSQL in deployment; SQLite fallback for zero-setup local development
- Tests: pytest and FastAPI TestClient

## Structure

```text
backend/app/
  core/          configuration and database session
  models/        SQLAlchemy entities and relationships
  domain/        OOP analysis, roadmap engine, strategies
  repositories/  persistence queries
  services/      use-case orchestration and serialization
  routers/       thin FastAPI HTTP layer
  seed.py        consistent demo dataset
backend/tests/   unit and API integration tests
frontend/app/    App Router pages
frontend/lib/    API client and TypeScript contracts
frontend/components/
docs/Document.md primary specification
```

## Database entities

`careers`, `skills`, `career_skill_requirements`, `skill_prerequisites`, `learner_profiles`, `skill_assessments`, `learning_resources`, `roadmaps`, and `roadmap_items` use foreign keys and uniqueness constraints. The idempotent seed contains 15 careers, 87 shared skills, 181 requirements, 88 prerequisite edges, and 16 resources. It updates records by unique names and relationship keys, preserving existing IDs and learner data.

## Local setup

Copy `.env.example` values into your environment as needed. Do not commit secrets.

Backend (SQLite default):

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload
```

For PostgreSQL, create the database and set `DATABASE_URL` to a `postgresql+psycopg://...` connection string before seeding.

Frontend, in a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. API documentation is at `http://localhost:8000/docs`.

## Tests and checks

```powershell
cd backend
python -m pytest -q

cd ..\frontend
npm run typecheck
npm run build
```

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/careers` | List careers |
| GET | `/api/careers/{id}` | Career requirements |
| GET | `/api/skills` | List skills and prerequisites |
| GET | `/api/skills/{id}/resources` | Learning resources |
| POST | `/api/profiles` | Create learner |
| GET/PUT | `/api/profiles/{id}` | Read/update learner |
| POST | `/api/profiles/{id}/assessments` | Upsert assessments |
| GET | `/api/profiles/{id}/analysis` | Readiness and gaps |
| POST | `/api/roadmaps/generate` | Generate a strategy-based roadmap |
| GET | `/api/roadmaps/{id}` | Retrieve roadmap |
| PATCH | `/api/roadmap-items/{id}` | Update status and skill progress |
| POST | `/api/roadmaps/{id}/recalculate` | Adapt an existing roadmap |

## Deployment

Frontend: Vercel. Backend: Render. Database: Neon PostgreSQL. Authentication: Firebase Google Sign-In. Use [the deployment guide](docs/DEPLOYMENT.md) for environment variables, provider setup, seeding, and production verification.

## Current limits

The seed is a demonstration dataset, not an industry certification standard. Time estimates are transparent planning estimates rather than scientific predictions. Job scraping, AI services, and admin editing are outside the current scope.
