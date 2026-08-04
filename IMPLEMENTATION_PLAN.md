# PipeGuard AI Implementation Plan

## Delivery stages

1. **Dataset audit**
   - Keep BattLeDIM L-Town and Calgary data in separate modules.
   - Validate files, separators, decimal formats, timestamps, sensors, labels, missing values and duplicate timestamps.
   - Preserve the original uploaded ZIP under `data/raw/`.

2. **Machine-learning pipeline**
   - Build reusable loaders, validation, past-only feature engineering, event-aware chronological splitting and event metrics.
   - Use the supplied leakage-flow columns as the target source.
   - Block artifact approval when a defensible two-class final evaluation is impossible.
   - Export static, visibly labelled demo fixtures separately from any approved model.

3. **FastAPI backend**
   - Add versioned system, demo prediction, validated manual/CSV prediction, replay, pipe, map, inspection and authentication endpoints.
   - Load only a trusted local artifact whose manifest hash, schema and approval status pass.
   - Return `MODEL_NOT_AVAILABLE` for real prediction when approval is false.

4. **Responsive Next.js frontend**
   - Reproduce the supplied desktop and mobile dashboard direction.
   - Add sidebar, mobile drawer and bottom navigation.
   - Implement Dashboard, Leak Detection, Pipeline Map, Pipe Information, Inspection Records, Model Information, About and Login pages.
   - Clearly distinguish Demo Data, Research Data, AI warnings and technician findings.

5. **Database and security**
   - Create SQLAlchemy models and Alembic migration for users, assets, breaks, inspections, attachments, prediction audit, model registry and events.
   - Add role checks, Argon2 password hashing, signed session cookies, CSRF, restricted CORS, security headers, safe logs and request IDs.

6. **Testing and deployment**
   - Add backend tests, frontend unit tests, Playwright smoke tests, ML tests and GitHub Actions.
   - Add Vercel monorepo configuration plus a two-project fallback.
   - Run available local checks and record results in `IMPLEMENTATION_REPORT.md`.
