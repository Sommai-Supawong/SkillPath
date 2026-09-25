# SkillPath deployment

## Architecture and prerequisites

Deploy `frontend/` as a Next.js project on Vercel, `backend/` as a Python web service on Render, and use Neon PostgreSQL for persistent data. Firebase Authentication provides Google sign-in; the browser sends a Firebase ID token to FastAPI, which verifies it with Firebase Admin. Push the repository to GitHub before connecting the two services.

Create accounts/projects in Firebase, Neon, Render, and Vercel. The backend targets Python 3.13 (`backend/.python-version`); the frontend uses the Node version supported by Next.js 15. The Render service must use its Python runtime.

## 1. Firebase configuration

In Firebase Console, create a web app and enable **Authentication → Sign-in method → Google**. Copy the web app configuration into Vercel's `NEXT_PUBLIC_FIREBASE_*` variables listed below. These are web client identifiers, never Firebase Admin credentials.

Create a Firebase Admin service account key for the same project. Store the JSON securely and upload it to Render as a **Secret File** named `firebase-service-account.json`. Set `GOOGLE_APPLICATION_CREDENTIALS=/etc/secrets/firebase-service-account.json` and `FIREBASE_PROJECT_ID` to the matching project ID. Never commit the JSON or paste it into a `NEXT_PUBLIC_*` variable. A production backend without these settings fails startup.

## 2. Neon PostgreSQL

Create a Neon project and database. Copy its connection string into Render's `DATABASE_URL`. Use a URL such as `postgresql+psycopg://USER:PASSWORD@HOST/DATABASE?sslmode=require`. Plain `postgresql://` and `postgres://` URLs are normalized to the installed psycopg driver. Keep Neon's TLS parameters, including `sslmode=require`; do not place the URL in Git. Production mode rejects missing or SQLite database URLs. Local development still defaults to `backend/skillpath.db` when `DATABASE_URL` is unset.

## 3. Render backend

Create a Render **Web Service** from the GitHub repository with:

| Setting | Value |
| --- | --- |
| Root Directory | `backend` |
| Runtime | Python 3 |
| Python version | `3.13` via `backend/.python-version`; set `PYTHON_VERSION=3.13.14` in Render if it does not detect the file |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Health Check Path | `/health` |

Set these environment variables in Render:

| Variable | Value |
| --- | --- |
| `ENVIRONMENT` | `production` |
| `DATABASE_URL` | Neon PostgreSQL URL with TLS parameters |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `GOOGLE_APPLICATION_CREDENTIALS` | `/etc/secrets/firebase-service-account.json` |
| `CORS_ORIGINS` | Exact Vercel frontend origin, for example `https://your-app.vercel.app` (no path) |

If using several frontend domains, separate exact origins with commas. Add only trusted production origins. Render supplies `$PORT`. The backend creates missing tables on startup and applies a small additive `skills` column update; it does not drop tables. There is no general migration framework, so future schema changes require a reviewed migration plan and a database backup.

After deployment, check `https://YOUR-RENDER-HOST/health` for `{"status":"ok"}`, `https://YOUR-RENDER-HOST/docs` for the API documentation, and `https://YOUR-RENDER-HOST/api/careers` after seeding. A free service may take time to respond after sleeping.

## 4. Seed the database

After `DATABASE_URL` is set, run `python -m app.seed` from `backend/` in a Render shell or another secure environment with access to the same Neon database. Run it once before checking careers. The seed upserts careers, skills, requirements, prerequisites, and resources by their existing keys; rerunning it does not duplicate those records or delete users, plans, assessments, or progress. It is intentionally not run at every web service restart.

## 5. Vercel frontend

Create a Vercel project from the same GitHub repository. Select **Root Directory: `frontend`** and **Framework: Next.js**. Use the default install and build commands. Configure these environment variables for Production (and Preview if needed):

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Render backend origin, for example `https://your-api.onrender.com` (no `/api`) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web app API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase web auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase web storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase web sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase web app ID |

The API client adds `/api` and handles a trailing slash on the configured origin. Changing any `NEXT_PUBLIC_*` value requires a new Vercel build/deployment.

Once Vercel assigns the actual frontend hostname, add that **hostname only** in **Firebase Console → Authentication → Settings → Authorized Domains**. Keep `localhost` authorized for local development if needed. If Vercel's hostname changes, update both Firebase Authorized Domains and Render `CORS_ORIGINS`.

## 6. Production verification

1. Open the Vercel site and browse careers. Confirm the request reaches the Render `/api/careers` endpoint.
2. Sign in with Google. Confirm the navbar shows the user and `/api/users/me` returns their account.
3. Choose a career, complete an assessment, generate a roadmap, and save a plan.
4. Open My Plans, update a skill, recalculate progress, and verify the updated roadmap.
5. Sign out, sign in again, and confirm the saved plan and progress remain in Neon.
6. Check that a missing token cannot read `/api/users/me` and that a second user cannot read or edit the first user's plan, linked profile, or roadmap.
7. If browser calls fail, inspect the browser Network tab for the exact API origin, CORS preflight, HTTP status, and whether an `Authorization: Bearer` header is sent. Do not copy tokens into support tickets or logs.

Live Google, Render, Vercel, and Neon checks require the deployed services and credentials; local checks cannot prove those external steps.

## Troubleshooting and redeployment

- Backend startup rejects configuration: verify `ENVIRONMENT`, Neon `DATABASE_URL`, `FIREBASE_PROJECT_ID`, and the Render Secret File path. Keep secret values out of logs.
- Browser CORS error: set `CORS_ORIGINS` to the exact Vercel origin, including `https://`, with no path or wildcard. Redeploy Render after changes.
- Google sign-in fails: verify the Google provider is enabled, the Vercel hostname is authorized in Firebase, and all six web config values match the Firebase project.
- API appears unavailable after inactivity: wait for the Render service to wake and retry. Check `/health` and Render logs if it remains unavailable.
- Empty career list: run `python -m app.seed` against the production Neon database.
- Database connection fails: verify the Neon URL, driver prefix, password, and TLS query parameters.

Push reviewed changes to GitHub. Render and Vercel redeploy their connected branches; check both build logs, `/health`, careers, login, and a saved plan after each deployment. Rotate a compromised Neon password or Firebase Admin key in the provider console, update Render's secret or environment variable, and redeploy. Removing a committed secret from the latest Git revision alone does not revoke it; rotate it and review repository history.

## Deployment checklist

- [ ] Firebase Google provider enabled and Admin Secret File created
- [ ] Neon database created and Render `DATABASE_URL` configured
- [ ] Render `ENVIRONMENT`, `FIREBASE_PROJECT_ID`, `GOOGLE_APPLICATION_CREDENTIALS`, and `CORS_ORIGINS` configured
- [ ] Backend deployed; `/health` and `/docs` respond
- [ ] Database seeded; `/api/careers` returns data
- [ ] Vercel frontend deployed with `NEXT_PUBLIC_API_URL` and all six Firebase web variables
- [ ] Vercel hostname added to Firebase Authorized Domains
- [ ] Google login and `/api/users/me` work
- [ ] Save Plan and My Plans work
- [ ] Logout/login preserves the saved plan
- [ ] Progress update and recalculation persist
- [ ] Cross-user ownership checks pass
