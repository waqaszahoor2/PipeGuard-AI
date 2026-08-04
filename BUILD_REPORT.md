# PipeGuard AI — Build Report

---

## 1. Frontend Build Summary

- **Framework**: Next.js 16.2.11 (Turbopack)
- **Node Engine**: `>=18.18.0 || ^20.0.0 || >=22.0.0`
- **Compiler Result**: 0 errors
- **TypeScript Typecheck**: 0 errors (`tsc --noEmit`)
- **Vitest Unit Tests**: 100% pass (`components/StatusCard.test.tsx`)
- **Route Compilation**:
  - `GET /` -> Redirect 307 to `/dashboard`
  - `GET /_not-found` -> Static
  - `GET /about` -> Static
  - `GET /dashboard` -> Static
  - `GET /inspection-records` -> Static
  - `GET /leak-detection` -> Static
  - `GET /login` -> Static
  - `GET /model-information` -> Static
  - `GET /pipe-information` -> Static
  - `GET /pipeline-map` -> Static

---

## 2. Backend Build Summary

- **ASGI App**: `FastAPI` (in `main.py` -> `app/main.py`)
- **Python Version**: 3.12+ / 3.14 compatible
- **Compilation Check**: `py -m compileall .` -> 100% clean
- **Pytest Suite**: 10 passed in `backend/tests`
- **ML Pipeline Suite**: 5 passed in `tests/test_ml_pipeline.py`
