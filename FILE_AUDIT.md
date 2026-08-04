# PipeGuard AI — File Audit & Inventory Report

---

## Complete File Inventory

### 1. Root Repository Files
- `.env.example` — Environment variable placeholders for frontend & backend.
- `.gitignore` — Specifies ignored files (`node_modules`, `.next`, `.venv`, `.env.local`, `.env`).
- `.vercelignore` — Excludes non-essential directories from Vercel deployment bundle.
- `README.md` — Project documentation.
- `VERCEL_DEPLOYMENT_GUIDE.md` — Step-by-step Vercel setup instructions.
- `VERCEL_DEPLOYMENT_FIX.md` — Details of Vercel build fix procedures.
- `IMPLEMENTATION_REPORT.md` — System audit and implementation overview.
- `BUILD_REPORT.md` — Verification test & compilation results.
- `SECURITY_AUDIT.md` — Security audit findings and hardening measures.
- `FILE_AUDIT.md` — Complete directory and file index.

### 2. Frontend (`frontend/`)
- `package.json` / `package-lock.json` — Frontend dependencies (Next 16.2.11, React 19, Lucide, Recharts, Leaflet, Tailwind).
- `next.config.mjs` — Next.js configuration with security headers & API proxy rewrites.
- `tsconfig.json` — Strict TypeScript compiler configuration.
- `vercel.json` — Vercel project preset definition.
- `app/` — App Router routes (`page.tsx`, `layout.tsx`, `globals.css`, `dashboard`, `leak-detection`, `pipeline-map`, `pipe-information`, `inspection-records`, `model-information`, `about`, `login`).
- `components/` — UI components (`LeafletMap.tsx`, `Logo.tsx`, `NetworkDiagram.tsx`, `PressureChart.tsx`, `ResultPanel.tsx`, `Shell.tsx`, `StatusCard.tsx`, `ThemeProvider.tsx`, `TimeStatus.tsx`).
- `lib/` — API fetch client (`api.ts`).
- `public/` — Public assets and GeoJSON maps.

### 3. Backend (`backend/`)
- `main.py` — ASGI entry point exporting `app`.
- `requirements.txt` — Backend runtime Python dependencies.
- `pyproject.toml` — Python tool configurations (`pytest`, `ruff`, `mypy`).
- `app/` — Core FastAPI modules (`main.py`, `schemas.py`, `api/router.py`, `core/`, `db/`, `services/`).
- `alembic/` — Database migrations setup.
- `tests/` — Backend unit and integration tests.

### 4. ML, Models & Data (`ml/`, `model_artifacts/`, `data/`)
- `ml/src/` — Preprocessing, target construction, chronological splitting, localization.
- `model_artifacts/` — Manifests, feature schemas, thresholds, sensor inventory, demo prediction samples.
- `data/` — `raw`, `interim`, `processed`, `demo` dataset directories.
- `tests/test_ml_pipeline.py` — Machine learning pipeline unit tests.
