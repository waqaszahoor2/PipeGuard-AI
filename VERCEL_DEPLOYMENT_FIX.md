# Vercel Monorepo Deployment & 404 Fix Guide for PipeGuard AI

## 1. Root Cause Analysis

### The `No Next.js version detected` Error
This error occurs when Vercel attempts to build a project from the repository root (`./`), but the Next.js application (`package.json`, `next.config.mjs`, `tsconfig.json`, `app/`) is located in the `frontend/` subdirectory.

### The `404: NOT_FOUND` Error
A `404: NOT_FOUND` error on Vercel can be either:
1. **Deployment-level 404**: Occurs when Vercel attempts to serve a build output from an unconfigured directory, an expired preview URL, an old deleted deployment alias, or an unsupported monorepo `vercel.json` schema.
2. **Next.js Route 404**: Occurs within Next.js when navigating to an unhandled client route.

In this project, the `404: NOT_FOUND` was a **Deployment-level 404** caused by configuring Vercel to build from root or using an invalid multi-service `vercel.json`.

---

## 2. Correct Repository Monorepo Structure

```text
pipeguard-ai/
├── frontend/                 # Next.js Application (Root Directory for Frontend Vercel Project)
│   ├── package.json          # Dependencies: next, react, react-dom, etc.
│   ├── package-lock.json     # Lockfile
│   ├── vercel.json           # Minimal frontend config ({ "framework": "nextjs" })
│   ├── next.config.mjs       # Next.js configuration & API rewrites
│   ├── tsconfig.json         # TypeScript configuration
│   ├── app/                  # App Router pages and layouts
│   │   ├── page.tsx          # Root route (redirects to /dashboard)
│   │   ├── layout.tsx        # Root layout
│   │   └── dashboard/        # Main Dashboard page
│   ├── components/           # UI Components
│   └── public/               # Static assets & demo fixtures
├── backend/                  # FastAPI Backend (Root Directory for Backend Vercel Project)
│   ├── main.py               # FastAPI entrypoint
│   └── requirements.txt      # Python dependencies
├── ml/                       # Machine Learning modules & notebooks
├── data/                     # Raw and demo datasets
├── docs/                     # Technical documentation & architecture
├── tests/                    # Tests
├── .gitignore                # Git ignore settings
├── .vercelignore             # Vercel deployment ignore rules
└── README.md                 # Project Overview & Deployment instructions
```

---

## 3. Recommended Two-Project Vercel Setup

Deploy PipeGuard AI as two distinct Vercel projects connected to the same GitHub repository:

### A. Frontend Vercel Project Setup
1. In Vercel, import the `PipeGuard-AI` GitHub repository.
2. Under **Project Settings** -> **Build & Development Settings**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`
   - **Output Directory**: *(Leave blank/default)*
   - **Node.js Version**: `20.x` or `22.x`
3. Under **Environment Variables**:
   - `NEXT_PUBLIC_API_BASE_URL` = `https://your-backend-project.vercel.app`
4. Click **Deploy**.

### B. Backend Vercel Project Setup
1. Import the same `PipeGuard-AI` repository as a new Vercel Project.
2. Under **Project Settings** -> **Build & Development Settings**:
   - **Root Directory**: `backend`
   - **Framework Preset**: `Other` / `FastAPI`
3. Under **Environment Variables**:
   - `DATABASE_URL` = `postgresql://...` (Neon Postgres)
   - `ALLOWED_ORIGINS` = `https://your-frontend-project.vercel.app`
   - `DEMO_TECHNICIAN_PASSWORD` = `YourSecurePassword`
4. Click **Deploy**.

---

## 4. How to Fix & Repair Broken Deployment URLs / Aliases

If you encounter `404: NOT_FOUND`:

1. **Verify Production URL**:
   - Go to Vercel Dashboard -> Select Project -> **Deployments**.
   - Open the URL listed under **Latest Production Deployment**.
   - Do NOT use stale browser bookmarks or expired preview URLs (`-git-...vercel.app`).
2. **Redeploy Without Cache**:
   - Go to **Deployments** -> Click the three dots `...` next to the latest commit -> Select **Redeploy** -> Uncheck *"Use existing build cache"* -> Click **Redeploy**.
3. **Repair Custom Domains / Aliases**:
   - Go to **Project Settings** -> **Domains**.
   - Verify your custom domain is assigned to the current `frontend` production deployment, not an old/deleted project.

---

## 5. Route Verification Checklist

The following routes are implemented and verified:
- `/` -> Redirects to `/dashboard`
- `/dashboard` -> Main PipeGuard AI Overview & metrics
- `/leak-detection` -> Early warning leak triage & demo fixtures
- `/pipeline-map` -> Interactive GIS water pipe network map
- `/pipe-information` -> Public pipe inventory details
- `/inspection-records` -> Technician inspection logs
- `/model-information` -> AI model card & performance metrics
- `/about` -> Project overview & boundaries
- `/login` -> Technician session login
