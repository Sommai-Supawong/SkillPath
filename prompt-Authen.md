You are working on the existing SkillPath project.

Your task is to ANALYZE the existing project first, then implement a complete USER AUTHENTICATION + PERSONAL LEARNING PLAN system.

The user should be able to:

1. Sign in easily with Google.
2. Have a persistent SkillPath account.
3. Save their personal career development plan.
4. Return later and continue the same plan.
5. Update their current skills and learning progress.
6. Recalculate Career Readiness.
7. Recalculate their Learning Roadmap.
8. Track progress until they reach their target career requirements.
9. Manage their basic profile.
10. Have multiple saved career development plans if the current architecture can support it cleanly.

The visual implementation MUST follow:

SkillPath/docs/DESIGN.md

The product/business behavior must continue to follow:

SkillPath/docs/Document.md

Do NOT redesign the backend roadmap algorithm.

Do NOT add AI.

==================================================
1. FIRST: FULL PROJECT ANALYSIS
==================================================

Before writing code:

Read completely:

SkillPath/docs/Document.md
SkillPath/docs/DESIGN.md

Then inspect:

- frontend architecture
- backend architecture
- current database models
- current LearnerProfile model
- SkillAssessment model
- Roadmap model
- RoadmapItem model
- current API routes
- API client
- current frontend state handling
- existing profile creation flow
- current assessment flow
- roadmap generation flow
- roadmap recalculation flow
- current deployment configuration
- environment variables
- SQLite development setup
- PostgreSQL production setup
- current test infrastructure

Do not blindly introduce a new architecture.

Preserve the existing:

router → service → domain → repository → database

architecture.

Before implementation, determine how authentication and ownership can be introduced with the smallest safe structural change.

==================================================
2. AUTHENTICATION ARCHITECTURE
==================================================

Preferred authentication architecture:

Firebase Authentication
+
Google Sign-In

Frontend:

Next.js
→ Firebase Web SDK
→ Google Provider

Backend:

FastAPI
→ receives Firebase ID Token
→ verifies token using Firebase Admin SDK
→ resolves SkillPath User
→ authorizes access to user-owned resources

The browser should send:

Authorization: Bearer <firebase-id-token>

to authenticated FastAPI endpoints.

This architecture is preferred because SkillPath frontend and backend may be deployed separately:

Frontend:
Vercel

Backend:
Render

Avoid cross-domain authentication designs that depend heavily on third-party cookies.

If the current project architecture already contains a better secure authentication solution, evaluate it first.

Do NOT change authentication architecture without a strong technical reason.

==================================================
3. IMPORTANT SECURITY RULES
==================================================

NEVER trust:

email
user_id
google user id
profile ownership

sent directly by the frontend.

The backend must derive authenticated identity from the VERIFIED Firebase token.

Never implement authorization like:

user_id = request.body.user_id

Instead use:

Authorization token
→ verify
→ firebase_uid
→ database User

All user-owned database queries must be scoped by the authenticated User.

Example:

get_plan(plan_id, user.id)

not:

get_plan(plan_id)

This is mandatory.

==================================================
4. FIREBASE FRONTEND SETUP
==================================================

Use Firebase Web SDK.

Install only if not already installed:

firebase

Create a centralized Firebase client configuration such as:

frontend/lib/firebase/client.ts

or a structure consistent with the existing project.

Use environment variables.

Expected frontend variables may include:

NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID

These Firebase client values are intentionally public configuration.

Do NOT put backend Firebase Admin credentials in NEXT_PUBLIC variables.

==================================================
5. FIREBASE BACKEND SETUP
==================================================

Use Firebase Admin SDK on FastAPI.

Install if necessary:

firebase-admin

Create a centralized authentication module such as:

backend/app/core/firebase.py

and/or:

backend/app/auth/dependencies.py

Backend credentials must remain server-only.

Environment configuration may include:

FIREBASE_PROJECT_ID

and either:

GOOGLE_APPLICATION_CREDENTIALS

or secure environment-based Firebase service account configuration.

Do NOT commit service account JSON files.

Do NOT commit private keys.

If Render deployment is used, document how credentials should be configured using environment variables / secrets.

==================================================
6. BACKEND TOKEN VERIFICATION
==================================================

Implement a reusable authentication dependency.

Example concept:

get_current_user()

Flow:

Authorization Header
        ↓
Extract Bearer Token
        ↓
Firebase Admin verify_id_token()
        ↓
firebase_uid
email
name
picture
        ↓
Find or create SkillPath User
        ↓
Return authenticated User domain/database entity

Unauthorized requests should return:

401 Unauthorized

Invalid ownership:

403 Forbidden

Missing resources:

404 Not Found

Do not expose Firebase/Admin exceptions directly.

==================================================
7. USER DATABASE MODEL
==================================================

Add a User entity.

Recommended fields:

users

id
firebase_uid
email
display_name
avatar_url
created_at
updated_at
last_login_at

Constraints:

firebase_uid UNIQUE
email indexed

Do not store Google passwords.

SkillPath must never manage Google passwords.

Authentication is delegated to Google/Firebase.

==================================================
8. USER AUTO-CREATION / SYNC
==================================================

On first authenticated request:

if firebase_uid does not exist:

create User

populate:

email
display_name
avatar_url

On future login:

update safe profile fields such as:

display_name
avatar_url
last_login_at

Do not create duplicate accounts for every login.

Firebase UID is the main external identity key.

==================================================
9. EXISTING LEARNER PROFILE OWNERSHIP
==================================================

The existing SkillPath project already has LearnerProfile behavior.

Modify it carefully.

Recommended relationship:

User
1
↓
many
LearnerProfile / DevelopmentPlan

or, if the current architecture strongly assumes a single profile:

User
1
↓
1 LearnerProfile
↓
many DevelopmentPlans

Choose the cleanest option after inspecting the existing domain model.

The final structure must support:

one authenticated user
→ own saved data
→ own skill assessments
→ own roadmaps
→ own development plans

Do NOT expose one user's records to another user.

==================================================
10. DEVELOPMENT PLAN CONCEPT
==================================================

Introduce the concept:

Personal Development Plan

or:

Learning Plan

This represents a long-term career goal saved by a user.

Example:

My Frontend Developer Plan

Target Career:
Frontend Developer

Strategy:
Balanced

Weekly Study:
8 hours

Started:
September 2026

Career Readiness:
57%

Progress:
42%

Status:
ACTIVE

==================================================
11. DEVELOPMENT PLAN MODEL
==================================================

Inspect existing Roadmap/LearnerProfile models first.

Avoid duplicating data already represented correctly.

If necessary, add a model similar to:

development_plans

id
user_id
career_id
learner_profile_id
name
strategy
weekly_hours
status
target_date nullable
initial_readiness
current_readiness
created_at
updated_at
completed_at nullable

Possible status values:

ACTIVE
COMPLETED
ARCHIVED

Do not store calculated values redundantly unless needed for history/performance.

If readiness should be calculated dynamically by GapAnalyzer, keep it dynamic.

==================================================
12. RELATIONSHIP WITH ROADMAP
==================================================

A DevelopmentPlan should use the existing RoadmapEngine.

Do NOT create a second roadmap engine.

Conceptually:

DevelopmentPlan
        │
        ▼
Learner Profile
        │
        ▼
Skill Assessments
        │
        ▼
GapAnalyzer
        │
        ▼
RoadmapEngine
        │
        ▼
Roadmap
        │
        ▼
RoadmapItems

When progress changes:

update skill assessment
        ↓
GapAnalyzer
        ↓
Career Readiness
        ↓
Roadmap recalculation
        ↓
UI update

==================================================
13. MULTIPLE PLANS
==================================================

Prefer allowing a user to have multiple plans.

Example:

My Plans

Frontend Developer
57% Ready

AI Engineer
31% Ready

Cloud Engineer
44% Ready

However:

Do not overcomplicate the architecture if existing LearnerProfile data cannot safely support multiple plans without major refactoring.

If necessary:

one DevelopmentPlan
→ one LearnerProfile snapshot/context

This is acceptable.

Document the architectural decision.

==================================================
14. PLAN CREATION FLOW
==================================================

Desired user flow:

Career Explorer
        ↓
Select Career
        ↓
Skill Assessment
        ↓
Skill Gap Analysis
        ↓
Generate Roadmap
        ↓
SAVE MY PLAN
        ↓
If guest:
Login with Google
        ↓
Save Development Plan
        ↓
My Plans

If already authenticated:

save immediately.

Do not force login merely to browse careers.

==================================================
15. GUEST ACCESS
==================================================

Keep public access for:

Home

Career Explorer

Career Detail

basic SkillPath explanation

Prefer allowing users to experiment with assessment/roadmap if the existing flow supports it.

But persistent saving must require authentication.

Guest CTA example:

บันทึกแผนของฉัน

If not signed in:

redirect to Login

After successful login:

return user to the intended save/plan flow.

Implement a safe redirect parameter.

Do not allow open redirect vulnerabilities.

Only accept internal application paths.

==================================================
16. LOGIN PAGE
==================================================

Create a dedicated route:

/login

The Login page MUST follow:

SkillPath/docs/DESIGN.md

Design direction:

Dark Theme
Blue / Cyan
Soft UI
Glass
Premium developer platform
Thai-first
Minimal

Do NOT make the page look like a generic Firebase demo.

==================================================
17. LOGIN PAGE LAYOUT
==================================================

Suggested desktop layout:

┌─────────────────────────────────────────────┐
│                                             │
│ SkillPath                                   │
│                                             │
│ กลับมาพัฒนา Skill ต่อจากที่คุณค้างไว้      │
│                                             │
│ บันทึก Learning Roadmap                    │
│ ติดตาม Skill Progress                      │
│ และไปให้ถึง Career Goal ของคุณ              │
│                                             │
│ ┌─────────────────────────────────────┐     │
│ │                                     │     │
│ │        เข้าสู่ระบบ SkillPath        │     │
│ │                                     │     │
│ │  [ G  Continue with Google ]         │     │
│ │                                     │     │
│ │  ใช้บัญชี Google เพื่อบันทึก        │     │
│ │  Roadmap และ Progress ของคุณ         │     │
│ │                                     │     │
│ └─────────────────────────────────────┘     │
│                                             │
└─────────────────────────────────────────────┘

Use DESIGN.md Glass UI selectively.

Possible visual background:

subtle Cursor Ring Field
or
very restrained blue ambient motion

Do not make login visually distracting.

==================================================
18. GOOGLE BUTTON
==================================================

Create a clear Google sign-in button.

Example:

[ Google icon ] Continue with Google

or:

เข้าสู่ระบบด้วย Google

Use the official Google logo correctly.

Do not recolor/distort the Google logo.

Button should not use strong Neon Glow.

Google sign-in should look trustworthy and familiar.

==================================================
19. LOGIN STATES
==================================================

Handle:

loading

Google popup pending

popup cancelled

authentication failure

network failure

successful login

Show human-readable Thai error messages.

Example:

ไม่สามารถเข้าสู่ระบบได้
กรุณาลองใหม่อีกครั้ง

Do not show raw Firebase error codes directly.

==================================================
20. NAVBAR LOGIN BUTTON
==================================================

Update the global Navbar.

When user is NOT authenticated:

show:

เข้าสู่ระบบ

or:

Login

Use a clear secondary/soft button.

Optional:

เริ่มต้นใช้งาน

may remain the primary CTA if it already exists.

Do not make Login the strongest CTA on the entire page.

==================================================
21. NAVBAR AUTHENTICATED STATE
==================================================

When signed in:

replace Login button with:

avatar
display name optional

Example:

[ avatar ] Som

Click opens dropdown:

แผนของฉัน
My Plans

โปรไฟล์
Profile

Dashboard

ออกจากระบบ
Logout

Keep dropdown consistent with DESIGN.md:

dark glass
soft border
subtle shadow

==================================================
22. AUTH STATE PROVIDER
==================================================

Create a centralized frontend authentication layer.

Possible structure:

AuthProvider

useAuth()

Responsibilities:

- firebase auth state
- current Firebase user
- ID token retrieval
- loading state
- loginWithGoogle()
- logout()
- authenticated API integration

Do not initialize Firebase independently in multiple pages.

==================================================
23. API CLIENT AUTH SUPPORT
==================================================

Update the existing frontend API client.

Authenticated requests should automatically include:

Authorization: Bearer <Firebase ID Token>

Create a clean abstraction.

Do not manually repeat:

getIdToken()
fetch()

inside every React component.

Example concept:

apiClient.authenticatedFetch()

or equivalent.

Handle expired tokens using Firebase SDK token refresh behavior.

==================================================
24. CURRENT USER API
==================================================

Create endpoints similar to:

GET /api/users/me

Response example:

{
  "id": 12,
  "email": "user@example.com",
  "display_name": "Som",
  "avatar_url": "...",
  "created_at": "...",
  "last_login_at": "..."
}

Add:

PUT /api/users/me

for editable profile fields.

Do NOT allow clients to update:

firebase_uid
email ownership identity

unless there is a safe reason.

==================================================
25. USER PROFILE PAGE
==================================================

Create:

/profile

Follow DESIGN.md.

Allow user to update SkillPath-specific preferences such as:

display name

weekly study hours default

preferred roadmap strategy

optional target study time settings

Do not attempt to edit Google account email.

Show:

avatar
Google email
account information

with clear read-only treatment.

==================================================
26. MY PLANS PAGE
==================================================

Create:

/my-plans

or another route consistent with the current app routing.

Primary heading:

แผนการพัฒนาของฉัน

Supporting:

My Learning Plans

Display saved plans.

Example card:

Frontend Developer

Career Readiness
57%

Progress
42%

Current Step
JavaScript

Strategy
Balanced

8 hrs/week

[ เรียนต่อ ]

==================================================
27. PLAN CARD STATES
==================================================

Plan states:

ACTIVE

COMPLETED

ARCHIVED

Translate visually:

กำลังพัฒนา
Completed
Archived

Use subtle status badges.

Do not use strong neon for all states.

==================================================
28. PLAN DETAIL PAGE
==================================================

Create a user-owned plan route such as:

/my-plans/[id]

This should become the main long-term progress workspace.

Include:

Career goal

Career readiness

Learning roadmap diagram

skill progress

current learning step

completed skills

remaining skills

estimated time

strategy

weekly study hours

resources

plan settings

==================================================
29. PLAN OWNERSHIP
==================================================

Every plan API must verify:

plan.user_id == current_user.id

Never rely on frontend hiding data.

This must be enforced in repository/service/backend code.

==================================================
30. PLAN API
==================================================

Implement appropriate APIs such as:

GET /api/plans

POST /api/plans

GET /api/plans/{id}

PUT /api/plans/{id}

DELETE or ARCHIVE /api/plans/{id}

POST /api/plans/{id}/recalculate

PATCH /api/plans/{id}/skills/{skill_id}

Adapt names to existing API conventions.

Do not duplicate existing roadmap endpoints unnecessarily.

Reuse existing services wherever possible.

==================================================
31. SAVE ROADMAP AS PLAN
==================================================

When user chooses:

บันทึกแผนของฉัน

Persist:

target career

assessment state

weekly study hours

roadmap strategy

generated roadmap relationship

current progress

Do not save only frontend JSON.

Persist normalized data using the existing database/domain structure.

==================================================
32. PROGRESS UPDATE
==================================================

Within a saved plan user can update:

skill current level

roadmap item status

completed learning step

weekly study hours

roadmap strategy if allowed

Example:

JavaScript

Before:
2 / 5

After:
4 / 5

System should:

save assessment
        ↓
run GapAnalyzer
        ↓
calculate Career Readiness
        ↓
recalculate roadmap
        ↓
update node states
        ↓
display new progress

==================================================
33. PLAN PROGRESS
==================================================

Calculate plan progress using deterministic data.

Possible approach:

completed required skill goals
/
total required skill goals

or a weighted variant if the existing domain supports it.

Do not use arbitrary fake progress.

Document the chosen formula.

Career Readiness and Plan Progress may be different concepts.

Do not merge them incorrectly.

==================================================
34. GOAL COMPLETION
==================================================

A DevelopmentPlan should automatically detect when the user reaches the target.

Suggested deterministic condition:

For every required career skill:

current_level >= required_level

Then:

Career Readiness = 100%

Plan status:
COMPLETED

completed_at:
current timestamp

Show a completion experience:

เป้าหมายสำเร็จแล้ว

Career Goal Completed

Do not use confetti excessively.

A subtle celebratory animation is acceptable if allowed by DESIGN.md and reduced-motion settings.

==================================================
35. COMPLETED PLAN
==================================================

Completed plan should still remain viewable.

Show:

Career achieved

Final readiness

Completed date

Skills completed

Learning journey

Allow:

Archive

or optionally:

Create another plan

Do not automatically delete completed data.

==================================================
36. ROADMAP DIAGRAM IN USER PLAN
==================================================

Reuse the existing deterministic Roadmap Diagram.

Do NOT introduce a separate graph implementation.

Node states should reflect saved user progress:

COMPLETED

CURRENT

AVAILABLE

LOCKED

CRITICAL

When progress updates:

refresh/recalculate graph.

==================================================
37. DASHBOARD PERSONALIZATION
==================================================

If authenticated:

Dashboard should prioritize the user's saved plans.

Suggested sections:

แผนที่กำลังพัฒนา

Career Readiness

Current Skill

Next Step

Overall Progress

Recently Completed

Continue Learning

If not authenticated:

existing generic/demo dashboard behavior may remain or redirect appropriately depending on current product flow.

==================================================
38. HOME AUTHENTICATED STATE
==================================================

When user is logged in:

Home Hero CTA may adapt.

Guest:

เริ่มค้นหาเส้นทางของคุณ

Authenticated user with active plan:

เรียนต่อจากจุดเดิม

Secondary:

ดูแผนของฉัน

Keep changes subtle.

==================================================
39. USER DATA MODEL RELATIONSHIPS
==================================================

Final relationships should be explicit and documented.

Conceptually:

User
 │
 ├── DevelopmentPlan
 │      │
 │      ├── Career
 │      ├── LearnerProfile
 │      ├── SkillAssessments
 │      ├── Roadmap
 │      └── RoadmapItems
 │
 └── preferences

Actual implementation should reuse existing tables where possible.

Do not duplicate assessment data unnecessarily.

==================================================
40. DATABASE MIGRATION
==================================================

Protect existing data.

Do NOT reset the production/development database unnecessarily.

If schema changes are required:

create a safe migration.

If Alembic already exists:

use it.

If it does not exist:

inspect the current migration strategy before introducing a new migration framework.

Do not delete:

careers
skills
requirements
prerequisites
resources
existing demo data

==================================================
41. EXISTING ANONYMOUS PROFILES
==================================================

The current application may contain profiles created without login.

Do not accidentally assign old anonymous profiles to a new user.

New authenticated data must have explicit ownership.

For existing anonymous/demo data:

keep it nullable/unowned where necessary.

Authenticated API queries must not return unowned demo profiles unless explicitly intended.

==================================================
42. OPTIONAL GUEST PLAN HANDOFF
==================================================

If the current frontend already allows a guest to:

assess skills
generate roadmap

before login:

preserve this UX if possible.

Ideal flow:

Guest creates roadmap
        ↓
Clicks Save
        ↓
Login with Google
        ↓
Successful auth
        ↓
Create user-owned DevelopmentPlan from current temporary roadmap context

Implement this only if it can be done reliably.

If not:

after login redirect user back to the selected career and preserve as much input as practical.

Do not introduce brittle state hacks.

==================================================
43. PROTECTED ROUTES
==================================================

Protect:

/my-plans

/my-plans/[id]

/profile

authenticated dashboard areas

Do not protect:

/

career explorer

career detail

public learning information

Route protection should show appropriate loading state while Firebase resolves authentication.

Avoid content flashing.

==================================================
44. LOGOUT
==================================================

Logout should:

sign out Firebase

clear frontend auth state

clear cached authenticated data

redirect to Home or Login

Do not delete saved plans.

==================================================
45. DESIGN — LOGIN PAGE
==================================================

Strictly follow DESIGN.md.

Design:

dark navy background

blue/cyan accent

Glass panel

Soft UI

Thai-first

technical/premium

Use subtle background movement.

Optional:

small Cursor Ring Field variant

but do NOT let cursor animation reduce login readability.

==================================================
46. DESIGN — MY PLANS
==================================================

My Plans should visually feel like a developer learning workspace.

Cards should use:

dark surface

soft border

subtle glass where appropriate

technology logos

progress visualization

Career Readiness

current step

Use motion:

small reveal

hover lift

progress transition

Avoid excessive glow.

==================================================
47. DESIGN — PROFILE
==================================================

Profile should be visually simple.

Header:

avatar
display name
Google email

Sections:

SkillPath Preferences

Default weekly study hours

Preferred roadmap strategy

Account

Avoid turning Profile into a large settings dashboard.

==================================================
48. LOGIN BUTTON NAV DESIGN
==================================================

Guest navbar:

[ เข้าสู่ระบบ ]

Authenticated:

[ Avatar ▼ ]

Maintain existing navbar spacing and responsive behavior.

On mobile:

place Login or profile action inside mobile menu if space is limited.

==================================================
49. LOADING STATES
==================================================

Authentication loading must not produce:

navbar jumping

login button flashing

protected route flashes

Use:

small skeleton

neutral placeholder

or delayed auth-sensitive rendering.

==================================================
50. ERROR HANDLING
==================================================

Create human-readable errors.

Examples:

ไม่สามารถเข้าสู่ระบบด้วย Google ได้

Session หมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง

ไม่พบแผนการเรียนรู้

คุณไม่มีสิทธิ์เข้าถึงแผนนี้

ไม่สามารถบันทึก Progress ได้

Do not expose Firebase/Admin/Python exception traces.

==================================================
51. TEST AUTHORIZATION
==================================================

Backend tests MUST verify ownership.

Example:

User A creates Plan A.

User B attempts:

GET Plan A

Expected:

403 or 404 depending on current API security convention.

User B must NEVER receive Plan A content.

Also test:

User A can update Plan A.

User B cannot update Plan A.

User B cannot archive/delete Plan A.

==================================================
52. TESTING FIREBASE AUTH
==================================================

Do NOT make unit tests depend on live Google/Firebase services.

Create a replaceable token-verification abstraction.

Example:

FirebaseTokenVerifier

Production:
Firebase Admin verifier

Tests:
Mock verifier

This keeps backend tests deterministic.

==================================================
53. OOP / ARCHITECTURE
==================================================

Preserve clean OOP architecture.

Possible new components/classes:

UserRepository

UserService

DevelopmentPlanRepository

DevelopmentPlanService

AuthIdentity

FirebaseTokenVerifier

Do not put all auth/database logic inside FastAPI route functions.

Example:

Router
 ↓
Auth Dependency
 ↓
Service
 ↓
Repository
 ↓
Database

==================================================
54. API AUTH DEPENDENCY
==================================================

Authenticated routes should use one central dependency.

Example concept:

current_user: User = Depends(get_current_user)

Avoid repeating token verification manually in every endpoint.

==================================================
55. FIREBASE CODE BOUNDARIES
==================================================

Firebase-specific code should be isolated.

Domain classes should NOT import Firebase.

Firebase is infrastructure/authentication.

The core SkillPath domain:

GapAnalyzer
RoadmapEngine
RoadmapStrategy

must remain provider-independent.

==================================================
56. FRONTEND CODE STRUCTURE
==================================================

Adapt to the project, but possible structure:

frontend/lib/firebase/
  client.ts

frontend/providers/
  AuthProvider.tsx

frontend/hooks/
  useAuth.ts

frontend/components/auth/
  GoogleSignInButton.tsx
  AuthGuard.tsx
  UserMenu.tsx

frontend/app/login/
  page.tsx

frontend/app/my-plans/
  page.tsx

frontend/app/my-plans/[id]/
  page.tsx

frontend/app/profile/
  page.tsx

Do not create unnecessary files if equivalent structures already exist.

==================================================
57. BACKEND STRUCTURE
==================================================

Possible additions:

backend/app/models/
  user.py
  development_plan.py

backend/app/repositories/
  user_repository.py
  development_plan_repository.py

backend/app/services/
  user_service.py
  development_plan_service.py

backend/app/auth/
  verifier.py
  dependencies.py

backend/app/routers/
  users.py
  plans.py

Adapt to existing conventions.

==================================================
58. ENVIRONMENT FILES
==================================================

Update:

frontend/.env.example

backend/.env.example

Document every required Firebase value.

Never commit:

real Firebase admin secret
private key
Google OAuth secret
production Firebase credentials

==================================================
59. GOOGLE / FIREBASE SETUP DOCUMENTATION
==================================================

Update README with clear setup steps.

Include:

1. Create Firebase project.
2. Enable Authentication.
3. Enable Google provider.
4. Add localhost authorized domain.
5. Add Vercel production domain later.
6. Configure Firebase Web environment variables.
7. Configure Firebase Admin credentials for FastAPI.
8. Start frontend.
9. Start backend.
10. Login using Google.

Do not assume the user knows Firebase console configuration.

==================================================
60. DEPLOYMENT
==================================================

Deployment target:

Frontend
→ Vercel

Backend
→ Render

Database
→ PostgreSQL

Firebase
→ Authentication only

For Vercel:

configure NEXT_PUBLIC_FIREBASE_* variables.

For Render:

configure Firebase Admin credentials.

Update Firebase Authorized Domains for deployed frontend.

Ensure CORS allows the actual frontend domain.

Authorization header must be allowed by CORS.

==================================================
61. PRIVACY / DATA MINIMIZATION
==================================================

Only store information needed by SkillPath.

From Google use approximately:

firebase UID
email
display name
avatar

Do not request unnecessary Google scopes.

Use basic sign-in identity scopes only.

Do not request:

Google Drive
Calendar
Contacts

unless the product actually needs them.

==================================================
62. DO NOT IMPLEMENT
==================================================

Do NOT add:

password login

password database

manual Google password handling

OpenAI

Gemini

AI-generated roadmap

Google Drive access

Google Calendar access

social networking

admin panel

payments

email marketing

This task is specifically:

Authentication
+
Saved Personal Development Plans
+
Progress Tracking

==================================================
63. FULL MANUAL FLOW
==================================================

After implementation test:

Guest
 ↓
Home
 ↓
Career Explorer
 ↓
Frontend Developer
 ↓
Assessment
 ↓
Skill Gap
 ↓
Roadmap
 ↓
Save Plan
 ↓
Login with Google
 ↓
Plan saved
 ↓
My Plans
 ↓
Open plan
 ↓
Update JavaScript
2 → 4
 ↓
Save
 ↓
Readiness recalculates
 ↓
Roadmap recalculates
 ↓
Continue progress
 ↓
Meet all requirements
 ↓
Plan automatically becomes COMPLETED

Verify all steps.

==================================================
64. SECOND FLOW
==================================================

Test another career:

AI Engineer
or
Cloud Engineer

Create a second plan.

Verify the user now has:

Plan 1
Frontend Developer

Plan 2
AI Engineer

Ensure progress remains separate.

==================================================
65. SECURITY MANUAL TEST
==================================================

Create two test users.

User A

User B

Verify:

A cannot access B's plans.

B cannot access A's plans.

Changing URL IDs must not bypass ownership.

Backend authorization must prevent access.

==================================================
66. BUILD / TEST
==================================================

Run:

backend tests

frontend typecheck

frontend lint if configured

frontend production build

Fix:

TypeScript errors

Python errors

database migration problems

Firebase initialization errors

hydration issues

auth flashing

broken protected routes

CORS issues

==================================================
67. DEFINITION OF DONE
==================================================

This task is complete only when:

- Google Login works
- Firebase identity is verified by FastAPI
- User row is created automatically
- Login page follows DESIGN.md
- Navbar shows Login for guests
- Navbar shows Avatar/User Menu when authenticated
- Logout works
- Profile page works
- User can update SkillPath profile/preferences
- User can save a Development Plan
- User can see My Plans
- User can open a saved plan
- User can update skill progress
- Career Readiness recalculates
- Roadmap recalculates
- Plan progress persists after logout/login
- Multiple user accounts are isolated
- Completed goal is detected
- Completed plan remains viewable
- responsive UI works
- TypeScript passes
- backend tests pass
- production frontend build passes
- README explains setup

==================================================
68. COMPLETION REPORT
==================================================

After implementation provide:

1. Authentication architecture used
2. Why that architecture was chosen
3. Packages installed
4. Database changes
5. Migration details
6. New models/classes
7. API endpoints
8. Protected endpoints
9. New frontend routes
10. Login page implementation
11. Navbar auth behavior
12. My Plans implementation
13. Progress update behavior
14. Goal completion logic
15. Security/ownership enforcement
16. Firebase setup required from the project owner
17. Environment variables required
18. Tests added
19. Test results
20. Typecheck/build results
21. Deployment notes
22. Remaining limitations

IMPORTANT FINAL RULE:

Do not report the feature as complete merely because the Google login button renders.

Authentication is only complete when:

Google Identity
→ Backend Verification
→ User Database
→ Resource Ownership
→ Saved Plans
→ Persistent Progress
→ Secure Authorization

all work together correctly.