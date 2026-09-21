You are working on the project located at:

SkillPath/

Before writing or modifying any code, read this file completely:

SkillPath/docs/Document.md

Treat `Document.md` as the primary source of truth for the project requirements, system concept, features, OOAD/OOP design, algorithms, database structure, API design, frontend pages, and deployment architecture.

Your task is to build the SkillPath web application into a complete, functional, testable project.

IMPORTANT PRIORITY:

1. Functionality and completeness first.
2. Correct OOAD/OOP architecture.
3. Correct backend logic and algorithms.
4. Correct database and API integration.
5. Working frontend connected to the backend.
6. Testing and error handling.
7. Basic usable responsive UI.
8. Visual redesign and advanced styling are NOT the priority yet.

Do NOT spend excessive time creating complex animations, glassmorphism, gradients, decorative components, or highly polished visual design.

The current UI only needs to be clean, readable, responsive, consistent, and fully usable.

We will redesign the frontend after all core functionality is complete.

---

# 1. First Step — Analyze Existing Project

Before coding:

* Inspect the entire `SkillPath` repository.
* Read `docs/Document.md` completely.
* Inspect all existing source code.
* Inspect `package.json`.
* Inspect Python dependencies.
* Inspect environment configuration.
* Inspect database configuration.
* Inspect existing frontend and backend folders.
* Check whether any existing implementation should be reused instead of recreated.
* Identify missing files, incomplete implementations, broken imports, duplicated logic, and architecture problems.

Do not blindly overwrite working code.

Preserve useful existing implementation where possible.

---

# 2. Required Technology

Use the architecture defined in `Document.md`.

Preferred stack:

Frontend:

* Next.js
* TypeScript
* App Router
* Tailwind CSS
* Fetch API or a clean API client layer

Backend:

* Python
* FastAPI
* Pydantic
* SQLAlchemy

Database:

* PostgreSQL

Testing:

* pytest for backend domain/business logic

Deployment target:

* Prefer Vercel for the complete application if the current architecture supports it cleanly.
* Otherwise keep the backend compatible with Render deployment while deploying Next.js on Vercel.

Do not unnecessarily replace technologies already correctly configured in the repository.

---

# 3. Main Product Goal

SkillPath is a:

Personalized Career Readiness & Learning Roadmap System.

The system should allow a learner to:

1. Browse career options.
2. View skills required for a career.
3. Create/use a learner profile without requiring login.
4. Assess their current skill levels.
5. Compare their skill levels with career requirements.
6. Calculate Career Readiness.
7. Analyze skill gaps.
8. Rank skill gaps by priority.
9. Resolve prerequisite relationships between skills.
10. Generate a personalized learning roadmap.
11. Choose different roadmap strategies.
12. Update skill progress.
13. Recalculate readiness and roadmap after progress changes.
14. View recommended learning resources where available.

Follow the detailed behavior described in `Document.md`.

---

# 4. OOAD / OOP Is Mandatory

This is an OOAD/OOP project.

Do NOT create a backend where all logic lives inside FastAPI routes.

Keep API routing thin.

Business logic must live in domain/service classes.

Implement the important domain concepts from `Document.md`, including where appropriate:

* Skill
* Career
* SkillRequirement
* LearnerProfile
* SkillAssessment
* Roadmap
* RoadmapItem
* GapAnalyzer
* RoadmapEngine
* RoadmapStrategy

Use proper object-oriented design.

Demonstrate:

## Encapsulation

Domain objects should manage and validate their own state where appropriate.

Example:
skill levels must remain within the valid range.

## Abstraction

Complex analysis should be hidden behind clear interfaces such as:

GapAnalyzer.analyze(...)

RoadmapEngine.generate(...)

## Inheritance

Implement a roadmap strategy hierarchy.

Base abstraction:

RoadmapStrategy

Concrete implementations:

* BalancedStrategy
* FastTrackStrategy
* FoundationFirstStrategy

## Polymorphism

RoadmapEngine should work with the abstract strategy interface instead of hard-coding every strategy into one large conditional block.

Prefer clean OOP design over artificial use of classes.

---

# 5. Backend Architecture

Keep clear separation similar to:

API Router
↓
Service
↓
Domain
↓
Repository
↓
Database

Suggested structure:

api/
index.py

```
core/
    config.py
    database.py

models/
    skill.py
    career.py
    profile.py
    roadmap.py

schemas/
    skill_schema.py
    career_schema.py
    profile_schema.py
    roadmap_schema.py

domain/
    gap_analyzer.py
    roadmap_engine.py

    strategies/
        base.py
        balanced.py
        fast_track.py
        foundation_first.py

repositories/
    career_repository.py
    skill_repository.py
    profile_repository.py
    roadmap_repository.py

services/
    career_service.py
    assessment_service.py
    roadmap_service.py

routers/
    careers.py
    skills.py
    profiles.py
    assessments.py
    roadmaps.py
```

You may improve this structure if the current repository already has a better equivalent.

Do not create unnecessary abstraction solely to increase file count.

---

# 6. Core Algorithms

Implement the algorithms described in `Document.md`.

## Skill Gap

Use:

gap = max(required_level - current_level, 0)

Completed or already-qualified skills should not unnecessarily appear as learning gaps.

---

## Skill Readiness

Use a bounded readiness ratio:

min(current_level / required_level, 1)

Handle invalid or zero requirements safely.

---

## Career Readiness

Use weighted readiness:

Career Readiness =
Σ(skill readiness × importance)
/
Σ(importance)
× 100

Career Readiness must remain between 0 and 100.

---

## Priority

Use the design described in `Document.md`, considering factors such as:

* skill gap
* skill importance
* prerequisite/dependency significance

The code should make the priority logic easy to understand and adjust.

Avoid unexplained magic numbers.

If a dependency multiplier is used, define it clearly.

---

# 7. Skill Dependency Graph

Implement prerequisite relationships.

Examples:

JavaScript
↓
React
↓
Next.js

The roadmap generator must never produce an invalid learning sequence such as:

Next.js
↓
React
↓
JavaScript

when prerequisites require the reverse order.

Implement dependency resolution cleanly.

A graph/topological ordering approach is acceptable and encouraged.

Also protect against invalid cyclic dependencies.

Return a meaningful error if the data contains a prerequisite cycle.

---

# 8. Roadmap Strategies

Implement:

## BalancedStrategy

Balance:

* gap
* importance
* prerequisites
* learning difficulty or estimated effort where relevant

## FastTrackStrategy

Prioritize skills required to reach minimum career readiness quickly.

Focus heavily on:

* critical career requirements
* high-impact gaps

## FoundationFirstStrategy

Prioritize prerequisites and foundational skills before dependent advanced skills.

All strategies should produce valid prerequisite ordering.

---

# 9. Roadmap Generation

RoadmapEngine should consider:

* target career
* current learner skills
* skill gaps
* importance
* prerequisites
* roadmap strategy
* weekly available study hours
* estimated learning hours

Generate a roadmap containing information such as:

* order
* skill
* current level
* target level
* estimated learning hours
* estimated learning period/week
* status

Avoid pretending the time estimate is scientifically precise.

It is an application estimate based on the configured skill learning hours.

---

# 10. Progress and Recalculation

This feature is important.

Example:

Before:

JavaScript = 2
Readiness = 57%

User completes learning progress.

JavaScript = 4

System should:

* save the updated assessment
* recalculate skill gaps
* recalculate career readiness
* regenerate or update the roadmap
* remove skills that no longer require study where appropriate
* preserve valid progress/status where reasonable

The result should visibly demonstrate that SkillPath is adaptive rather than a static roadmap website.

---

# 11. Database

Implement the schema specified in `Document.md`.

Expected entities include:

careers

skills

career_skill_requirements

skill_prerequisites

learner_profiles

skill_assessments

learning_resources

roadmaps

roadmap_items

Use proper foreign keys and relationships.

Add created/updated timestamps where useful.

Avoid unnecessary denormalization.

---

# 12. Seed Data

Create enough realistic seed data for the application to be demonstrable.

Target approximately:

* 5 careers
* 20–30 skills
* meaningful career-skill requirements
* meaningful prerequisite relationships
* several learning resources

Recommended initial careers:

* Frontend Developer
* Backend Developer
* Data Analyst
* UI/UX Designer
* Digital Marketer

The seed data must be internally consistent.

Do not create fake requirements that contradict the dependency graph.

The goal is to demonstrate the system, not to claim the dataset is an authoritative industry standard.

---

# 13. API

Implement the REST API described in `Document.md`.

Expected endpoints include equivalents of:

GET /api/careers

GET /api/careers/{id}

GET /api/skills

POST /api/profiles

GET /api/profiles/{id}

PUT /api/profiles/{id}

POST /api/profiles/{id}/assessments

GET /api/profiles/{id}/analysis

POST /api/roadmaps/generate

GET /api/roadmaps/{id}

PATCH /api/roadmap-items/{id}

POST /api/roadmaps/{id}/recalculate

GET /api/skills/{id}/resources

You may adjust endpoint details if necessary for REST consistency, but preserve all required functionality.

Use correct:

* HTTP status codes
* request validation
* response schemas
* meaningful errors

Do not return raw database objects without proper serialization.

---

# 14. Frontend

Build a complete usable frontend connected to the real backend.

Required application flow:

Landing
↓
Career Explorer
↓
Career Detail
↓
Skill Assessment
↓
Career Readiness / Gap Analysis
↓
Roadmap
↓
Progress Update
↓
Recalculated Roadmap

Suggested routes:

/

/careers

/careers/[id]

/assessment/[careerId]

/dashboard

/analysis

/roadmap

The exact routing can be improved if necessary.

---

# 15. Frontend Design for This Phase

Do NOT redesign heavily yet.

Use a simple professional interface.

Requirements:

* responsive
* clear typography
* consistent spacing
* accessible buttons
* readable forms
* clear loading states
* clear empty states
* clear error states
* cards/tables where useful
* progress indicators
* basic roadmap timeline
* usable navigation

A simple dark or neutral UI is acceptable.

Avoid spending time on:

* advanced glassmorphism
* 3D effects
* large animations
* decorative gradients
* cinematic transitions
* excessive Framer Motion

Small transitions are fine but functionality comes first.

---

# 16. State Handling

Frontend must correctly handle:

* no careers
* API loading
* API failure
* invalid career ID
* profile not created
* incomplete assessment
* no skill gaps
* roadmap unavailable
* roadmap generation error
* prerequisite cycle error
* successful progress update

Do not leave pages permanently dependent on hard-coded mock data once the backend exists.

---

# 17. Validation

Implement validation on both frontend and backend.

Examples:

skill level:
0–5

required level:
valid configured range

weekly study hours:
positive reasonable value

importance:
valid configured range

career IDs:
must exist

skill IDs:
must exist

duplicate assessments:
update existing record instead of creating conflicting duplicates when appropriate

---

# 18. Testing

Create meaningful pytest tests.

At minimum test:

## GapAnalyzer

* current 2 / required 5 => gap 3
* current above required => gap 0
* readiness cannot exceed 100%
* invalid levels handled correctly

## Priority

* higher importance increases priority
* larger gap increases priority
* prerequisite significance affects ordering where expected

## Dependency resolution

* JavaScript occurs before React
* React occurs before Next.js
* cycle detection works

## Strategies

* BalancedStrategy works
* FastTrackStrategy changes ranking appropriately
* FoundationFirstStrategy respects foundations

## RoadmapEngine

* completed skills are excluded where appropriate
* generated roadmap respects prerequisites
* estimated hours are calculated
* weekly hours affect estimated timeline

## Progress update

* updated assessment changes readiness
* roadmap can be recalculated

Do not create trivial tests that only assert `True`.

---

# 19. Error Handling

Backend errors must be understandable.

Avoid returning raw Python exception traces to the user.

Frontend should show human-readable messages such as:

"Career not found."

"Unable to generate roadmap."

"Skill dependency configuration contains a cycle."

"Please complete your skill assessment first."

Log technical details where appropriate.

---

# 20. Environment Configuration

Provide a proper `.env.example`.

Do not commit real secrets.

Document required environment variables.

Examples may include:

DATABASE_URL=

NEXT_PUBLIC_API_URL=

Adjust to the actual deployment structure.

---

# 21. Documentation

Update or create:

README.md

Include:

* Project overview
* Problem statement
* Features
* Technology stack
* OOAD/OOP concepts
* Project architecture
* Folder structure
* Database setup
* Environment variables
* Installation
* How to run frontend
* How to run backend
* How to seed data
* How to run tests
* API overview
* Deployment notes

Do not replace `docs/Document.md`.

That file remains the primary project specification.

You may create additional docs if useful.

---

# 22. Local Development

The project must be easy to start.

Ensure commands are documented and actually work.

Example only:

Frontend:

npm install
npm run dev

Backend:

pip install -r requirements.txt
uvicorn api.index:app --reload

Tests:

pytest

Seed:

python -m api.seed

Use the real commands required by the final repository instead of blindly using these examples.

---

# 23. Deployment Readiness

Prepare the project so that it can later be deployed.

Preferred:

Next.js + FastAPI
→ Vercel

If this structure becomes unnecessarily fragile, keep architecture compatible with:

Next.js
→ Vercel

FastAPI
→ Render

PostgreSQL
→ hosted PostgreSQL

Do not sacrifice local functionality merely to optimize deployment prematurely.

---

# 24. Implementation Order

Work in this order:

PHASE 1 — Project Inspection

* Read Document.md
* Inspect repository
* Identify current state

PHASE 2 — Foundation

* configuration
* database
* models
* schemas
* seed data

PHASE 3 — Domain Logic

* OOP domain models
* GapAnalyzer
* priority calculation
* dependency resolver
* Strategy Pattern
* RoadmapEngine

PHASE 4 — Tests

* test domain logic before building a large UI

PHASE 5 — API

* repositories
* services
* FastAPI routes
* validation
* error handling

PHASE 6 — Frontend Core

* career explorer
* career detail
* assessment
* dashboard
* gap analysis
* roadmap
* progress update

PHASE 7 — Integration

* replace mocks
* connect all frontend features to backend
* loading/error states
* end-to-end manual test

PHASE 8 — Documentation and Cleanup

* README
* environment examples
* remove dead code
* fix imports
* run lint/build/tests

Do not start heavy UI redesign during these phases.

---

# 25. Definition of Done

Do not consider the task complete until:

* The application runs locally.
* Frontend builds successfully.
* Python backend starts successfully.
* Database tables work.
* Seed data works.
* Career Explorer works.
* Career Detail works.
* Skill Assessment saves data.
* Career Readiness is calculated by the backend.
* Skill Gap Analysis works.
* Dependency resolution works.
* Roadmap generation works.
* All required roadmap strategies work.
* Progress can be updated.
* Readiness recalculates.
* Roadmap can recalculate.
* Frontend uses the real API.
* Core business logic has tests.
* Tests pass.
* No obvious broken routes exist.
* No critical TypeScript errors exist.
* No critical Python import/runtime errors exist.
* README contains correct run instructions.
* `.env.example` exists.
* The application has a basic usable responsive design.

---

# 26. Important Rules

* Read `SkillPath/docs/Document.md` before implementing.
* Keep `Document.md` as the source of truth.
* Do not simplify away major requirements without a technical reason.
* Do not invent unrelated features.
* Do not add authentication unless the document explicitly requires it.
* Do not introduce AI/LLM APIs.
* Do not over-engineer the UI.
* Do not place all business logic inside FastAPI routers.
* Do not replace OOP architecture with simple procedural utility functions.
* Do not use mock frontend data once corresponding backend APIs are operational.
* Do not hide runtime errors with placeholder implementations.
* Do not leave TODO implementations for core features.
* Do not declare success without running the project and tests.

When requirements conflict, prioritize:

1. `docs/Document.md`
2. existing architecture that is already working correctly
3. this implementation prompt

If a minor implementation detail is unspecified, make a sensible software-engineering decision and continue without asking unnecessary questions.

---

# 27. Final Verification

After implementation:

1. Run backend tests.
2. Start the backend.
3. Verify FastAPI routes.
4. Start Next.js.
5. Test the full user flow.
6. Run frontend lint/type checking if configured.
7. Run production build.
8. Fix errors you find.
9. Check responsive usability.
10. Review the repository for dead or duplicated code.

Perform at least one complete scenario:

Create learner
→ select Frontend Developer
→ assess skills
→ analyze gaps
→ generate Balanced roadmap
→ update one skill
→ recalculate readiness
→ regenerate/update roadmap

Also verify at least one alternative roadmap strategy.

At the end, provide a concise summary containing:

* what was created
* major architecture decisions
* implemented OOAD/OOP concepts
* implemented algorithms
* API endpoints
* database entities
* tests completed
* commands used to verify the application
* any remaining non-critical limitations
* recommended next step for the later UI redesign

The immediate objective is:

BUILD A COMPLETE AND CORRECT WORKING SKILLPATH APPLICATION FIRST.

Do not redesign the application heavily yet.

Functionality, architecture, correctness, integration, testing, and completeness come before visual polish.
