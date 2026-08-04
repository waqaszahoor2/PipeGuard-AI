# PipeGuard AI — Vercel Deployment Guide

PipeGuard AI is optimized for seamless zero-config deployment on [Vercel](https://vercel.com).

---

## ⚡ Deployment Instructions (Vercel)

### Option A: Deploying via Vercel GitHub Integration (Recommended)
1. Push your repository changes to GitHub.
2. Log into [Vercel Dashboard](https://vercel.com/dashboard).
3. Click **Add New** → **Project**.
4. Import the `PipeGuard-AI` repository.
5. Configure Project Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Next.js`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. Set Environment Variables:
   - `NEXT_PUBLIC_API_BASE_URL`: `https://pipe-guard-ai.vercel.app` (or your backend URL)
   - `NEXT_PUBLIC_APP_NAME`: `PipeGuard AI Research Prototype`
7. Click **Deploy**.

---

## 🔒 Post-Deployment Verification Checklist

- [x] **Root Route Redirect / Landing Page**: Navigating to `/` displays the Landing Page with quick stats and links to `/dashboard`.
- [x] **Page Titles & Metadata**: Each page shows proper HTML `<title>` tags (e.g. `Dashboard | PipeGuard AI`).
- [x] **Dynamic Leaflet Map**: Map renders without `window is not defined` SSR errors due to dynamic client-side loading.
- [x] **Offline Data Fallback**: Application functions cleanly even if external API endpoints are unreachable.
- [x] **SEO Files**: `sitemap.xml` and `robots.txt` are served at `/sitemap.xml` and `/robots.txt`.
- [x] **Mobile Responsiveness**: Responsive drawer works seamlessly on mobile viewports down to 320px width.
