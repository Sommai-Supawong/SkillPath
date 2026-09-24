# Completion Report: SkillPath Authentication & Personal Learning Plans

## 1. Architecture Changes
- Implemented **Firebase Authentication (Google Sign-In)** on the frontend.
- Added **Firebase Admin SDK** on the backend to securely verify the `Authorization: Bearer <token>` header.
- Established a `User` identity in the local relational database mapped 1:1 with `firebase_uid`.
- Integrated a new `DevelopmentPlan` entity that connects a user to a specific career goal, strategy, and their `LearnerProfile` (which tracks skill assessments and roadmaps).

## 2. Database Changes
- **New `User` model**: Stores `firebase_uid`, `email`, `display_name`, `avatar_url`, and `last_login_at`.
- **New `DevelopmentPlan` model**: Links `user_id`, `career_id`, and `learner_profile_id`, tracking plan `name`, `status`, `strategy`, `initial_readiness`, `current_readiness`, and `completed_at`.
- Relied on existing `Base.metadata.create_all()` in the local SQLite/PostgreSQL setup, safely adding tables without destructive migrations.

## 3. Files Created/Modified
- **Backend:**
  - Added `firebase-admin` to `requirements.txt`.
  - Created `app/models/user.py`, `app/models/development_plan.py` and exported them in `__init__.py`.
  - Created `app/auth/verifier.py` (Mockable Token Verifier) and `app/auth/dependencies.py` (FastAPI `get_current_user` dependency).
  - Created schemas in `app/schemas/user.py` and `app/schemas/development_plan.py`.
  - Created repositories and services in `app/repositories/plan_repository.py` and `app/services/plan_service.py`.
  - Created routers `app/routers/users.py` and `app/routers/plans.py` and attached them in `app/main.py`.
  - Created tests in `tests/test_auth_and_plans.py`.
- **Frontend:**
  - Added `firebase` to `package.json`.
  - Created `lib/firebase/client.ts` to manage the Firebase app.
  - Created `providers/AuthProvider.tsx` and wrapped `app/layout.tsx`.
  - Created `components/auth/UserMenu.tsx` and added it to `components/Shell.tsx`.
  - Created `/login/page.tsx`, `/profile/page.tsx`, `/my-plans/page.tsx`, `/my-plans/[id]/page.tsx`, and `/my-plans/save/page.tsx`.
  - Updated `lib/api.ts` to automatically attach the `Authorization` header.
  - Updated `components/roadmap/RoadmapPageClient.tsx` to add the "Save Plan" action.

## 4. Firebase Setup Required from Project Owner
You must configure Firebase in your environments:
1.  **Frontend (`frontend/.env.local`)**:
    - `NEXT_PUBLIC_FIREBASE_API_KEY`
    - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
    - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
    - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
    - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
    - `NEXT_PUBLIC_FIREBASE_APP_ID`
2.  **Backend (`backend/.env`)**:
    - `FIREBASE_PROJECT_ID`
    - Ensure `GOOGLE_APPLICATION_CREDENTIALS` points to the Firebase service account key JSON file in your production environment.

## 5. API Endpoints Added
- **`GET /api/users/me`**: Returns the current authenticated user.
- **`PUT /api/users/me`**: Updates basic profile fields (name, avatar).
- **`POST /api/plans`**: Creates a new Development Plan mapped to the authenticated user.
- **`GET /api/plans`**: Lists all plans owned by the authenticated user.
- **`GET /api/plans/{id}`**: Retrieves a specific plan (with strict ownership check).
- **`PUT /api/plans/{id}`**: Updates plan settings.
- **`DELETE /api/plans/{id}`**: Deletes a plan.
- **`POST /api/plans/{id}/progress`**: Forces a readiness and status recalculation (e.g., when skill assessments change).

## 6. Frontend Routes Added
- **`/login`**: The beautiful glass-morphism login page.
- **`/profile`**: Displays account settings and read-only preferences.
- **`/my-plans`**: The dashboard listing all saved development plans.
- **`/my-plans/save`**: A processing page to transfer guest roadmap context into an authenticated plan.
- **`/my-plans/[id]`**: The main persistent workspace where a user tracks progress, updates skill levels, and views their roadmap diagram.

## 7. Security Measures
- Token Verification: The backend explicitly verifies the Google-issued JWT using the Firebase Admin SDK.
- The `get_current_user` dependency automatically handles Identity sync/creation securely on the server side.
- No `user_id` payload is trusted from the frontend.
- `PlanService` explicitly filters and restricts data lookups by the authenticated `user_id`, preventing Insecure Direct Object References (IDOR).

## 8. Tests
- Added `test_auth_and_plans.py` using a `MockTokenVerifier`.
- **Tests Added**:
  - `test_auth_no_token`
  - `test_auth_invalid_token`
  - `test_auth_valid_token_auto_creates_user`
  - `test_plan_creation_and_ownership` (verifies User B cannot access User A's plan)
  - `test_progress_update_and_completion` (verifies reaching requirement triggers `COMPLETED` status)
- **Test Results**: All backend tests passing successfully (`5 passed`).
- **Typecheck/Build Results**: Production frontend build (`npm run build`) compiles successfully without errors.

## 9. Deployment Changes
- **Vercel**: Expose the `NEXT_PUBLIC_FIREBASE_*` environment variables. Ensure the deployed domain is added to Firebase Console Authentication Authorized Domains.
- **Render (Backend)**: Add `FIREBASE_PROJECT_ID` and the corresponding service account credentials (`GOOGLE_APPLICATION_CREDENTIALS`).

## 10. Remaining Limitations
- Guest State Handoff: The current flow converts a user's recent assessment into a plan cleanly, but if a guest leaves the app and returns, unauthenticated assessments are lost if not saved to a plan.
- The default weekly hours and learning strategies in the Profile settings are currently read-only on the frontend UI, as dynamic modification requires additional backend sync mapping to individual plans.
