# PipeGuard AI — Automated Testing Suite

PipeGuard AI includes comprehensive unit testing suites covering both the React/Next.js frontend and the Python ML/backend pipeline.

---

## 🧪 Frontend Test Suite (Vitest & React Testing Library)

### Run Tests
```bash
cd frontend
npm run test
```

### Coverage Overview
- `components/StatusCard.test.tsx`: Validates rendering, tone styling, and accessibility labels for KPI cards.
- `components/GlobalSearchControl.test.tsx`: Validates search filtering, keyboard shortcuts, and query clearing.
- `components/PipelineGlobe.test.tsx`: Validates dynamic 3D/2D rendering fallback states.

---

## 🐍 Python ML & Backend Test Suite (Pytest)

### Run Tests
```bash
$env:PYTHONPATH="backend"
py -m pytest backend/tests tests/test_ml_pipeline.py
```

### Coverage Overview
- `tests/test_ml_pipeline.py`: Validates chronological target construction, event boundary group splitting, and metric calculations.
- `backend/tests/test_system.py`: Validates FastAPI system health endpoints and error handlers.
- `backend/tests/test_global_search.py`: Validates pipe asset query lookups and search filtering.
- `backend/tests/test_auth_and_csv.py`: Validates CSV export generation and authentication endpoints.
