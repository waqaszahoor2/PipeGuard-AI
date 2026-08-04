# PipeGuard AI — Vercel Deployment Guide

This guide provides step-by-step instructions to deploy **PipeGuard AI** to Vercel using the recommended two-project architecture.

---

## Deployment Architecture

For maximum reliability and clean runtime isolation, deploy as two separate Vercel projects linked by environment variables:

1. **Frontend Project**: Next.js App Router (`frontend/`)
2. **Backend Project**: FastAPI Python ASGI (`backend/`)

---

## 1. Deploying the Frontend Project

1. Log into your **Vercel Dashboard**.
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository (`PipeGuard-AI`).
4. Configure Project Settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: *(Leave empty — standard `.next`)*
   - **Install Command**: `npm ci`
   - **Node.js Version**: `22.x`
5. Configure Environment Variables:
   - `NEXT_PUBLIC_API_BASE_URL`: `https://<YOUR-BACKEND-PROJECT>.vercel.app`
   - `NEXT_PUBLIC_APP_NAME`: `PipeGuard AI`
   - `NEXT_PUBLIC_DEFAULT_THEME`: `system`
   - `NEXT_PUBLIC_MAP_TILE_URL`: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
   - `NEXT_PUBLIC_MAP_ATTRIBUTION`: `&copy; OpenStreetMap contributors`
6. Click **Deploy**.

---

## 2. Deploying the Backend Project

1. Click **Add New...** -> **Project**.
2. Import your GitHub repository (`PipeGuard-AI`).
3. Configure Project Settings:
   - **Framework Preset**: `Other` or `FastAPI`
   - **Root Directory**: `backend`
   - **Build Command**: *(Leave empty)*
   - **Output Directory**: *(Leave empty)*
4. Configure Environment Variables:
   - `APP_ENV`: `production`
   - `APP_VERSION`: `1.0.0`
   - `DATABASE_URL`: `postgresql://user:password@host/dbname?sslmode=require`
   - `SESSION_SECRET`: `<generate-32-byte-hex-secret>`
   - `CSRF_SECRET`: `<generate-32-byte-hex-secret>`
   - `ALLOWED_ORIGINS`: `https://<YOUR-FRONTEND-PROJECT>.vercel.app`
   - `MODEL_PATH`: `../model_artifacts`
   - `ENABLE_DEMO_MODE`: `true`
   - `LOG_LEVEL`: `INFO`
5. Click **Deploy**.

---

## Verification & Health Check

Once both projects are deployed:
- Frontend Health: Open `https://<YOUR-FRONTEND-PROJECT>.vercel.app/dashboard`
- Backend Health: `GET https://<YOUR-BACKEND-PROJECT>.vercel.app/api/v1/health`
- API Proxy: Verify that leak predictions and map data resolve cleanly from the frontend interface.
