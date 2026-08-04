# Architecture

PipeGuard AI is a monorepo with an interactive Next.js client, a versioned FastAPI
service, an offline ML workflow and a relational inspection/audit database.

## Data separation

BattLeDIM supports hydraulic anomaly research. Calgary supports public asset display
and historical spatial analysis. No row-wise merge is permitted because the modules
represent different systems.

## Runtime boundary

Training, GeoPandas processing and raw datasets remain offline. The deployed backend
loads only small metadata, curated demo records and a locally packaged approved model.
The frontend receives paginated JSON or simplified GeoJSON, never the raw research files.

## Request flow

1. Browser sends a typed request.
2. Security middleware assigns a request ID and headers.
3. Pydantic validates body, ranges, schema and timestamps.
4. Prediction service verifies the trusted artifact manifest.
5. If approved, it predicts and records a sanitized audit event.
6. If unavailable, the API returns a safe `MODEL_NOT_AVAILABLE` response.
7. Demo endpoints return labelled static fixtures.
