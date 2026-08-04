# PipeGuard AI — Vercel Deployment Fix Documentation

This document records the exact root causes and resolution procedures for all historical Vercel deployment errors.

---

## Resolved Errors & Fixes

### 1. Error: "No Next.js version detected"
- **Root Cause**: `frontend/package.json` had an invalid version string (`"next": "15.5.21"`). Vercel's build scanner failed to match the version against official npm registry releases, causing framework auto-detection to fail. Additionally, root repository directory was missing a framework marker.
- **Resolution**:
  - Upgraded Next.js to secure stable **`16.2.11`** in `frontend/package.json`.
  - Configured `frontend/vercel.json` with `$schema` and `"framework": "nextjs"`.
  - Specified Vercel **Root Directory**: `frontend`.

### 2. Error: "404: NOT_FOUND"
- **Root Cause**: Missing root route page in App Router, improper Vercel root directory configuration, or broken rewrite definitions.
- **Resolution**:
  - Verified `frontend/app/page.tsx` exists and performs a clean server-side redirect to `/dashboard`.
  - Configured `NEXT_PUBLIC_API_BASE_URL` rewrites in `frontend/next.config.mjs`.

### 3. Error: "Vulnerable version of Next.js detected"
- **Root Cause**: Older Next.js releases (e.g. Next.js 15.1.7 and earlier 15.x releases) triggered Vercel security warnings regarding CVE-2025-66478.
- **Resolution**:
  - Upgraded to secure release **Next.js 16.2.11**.
  - Updated matching `eslint-config-next: 16.2.11`.
  - Ensured no security bypass variables (`DANGEROUSLY_DEPLOY_VULNERABLE_CVE_2025_66478`) are present.

### 4. Error: "Build Failed"
- **Root Cause**: Leaflet map library executed browser globals (`window`, `document`) during server-side rendering (SSR), crashing static page generation.
- **Resolution**:
  - Refactored `LeafletMap.tsx` with `"use client"` directive.
  - Wrapped Leaflet initialization inside `useEffect` and dynamic client-side imports (`ssr: false`).
  - Successfully ran `npm run build` with 100% static prerendering pass across all 10 App Router pages.
