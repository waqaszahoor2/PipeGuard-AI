The prompt below is designed for **Antigravity, Cursor, Claude Code, Windsurf, or another coding agent**. It follows the current Vercel architecture for a Next.js frontend and FastAPI backend in one monorepo, routed through Vercel Services. Vercel currently supports FastAPI on it([Vercel][1])ostgres providers such as Neon. ([Vercel][1])mits CSV requests to 4 MB because Vercel Functions currently impose a 4.5 MB request/response payload limit. It requires CSP and other security headers supported by Next.js. ([Vercel][2])="document" id="58317"}

# MASTER DEVELOPMENT PROMPT — PIPEGUARD AI

Act as a Senior Data Scientist, Machine-Learning Engineer, Data Engineer, FastAPI Developer, Next.js Developer, Database Engineer, UI/UX Designer, Cybersecurity Engineer, QA Engineer and Vercel Deployment Engineer.

Build a complete, production-quality portfolio project named:

# PipeGuard AI — Water Leak Detection and Pipeline Inspection Support

Do not rename the project.

Create the complete working codebase, including:

* Data inspection and preprocessing
* Exploratory data analysis
* Feature engineering
* Chronological machine-learning training
* Model evaluation
* Approved model artifacts
* FastAPI prediction backend
* Next.js frontend
* Responsive desktop and mobile layouts
* Pipeline map
* Pipe information
* Inspection records
* Authentication for technician-only actions
* Database integration
* Security protections
* Automated testing
* GitHub Actions
* Vercel deployment configuration
* Complete documentation

Do not create only a plan. Inspect the repository, create the files, implement the application, run the available checks and fix errors.

---

# 1. Critical project truth

PipeGuard AI is a dataset-powered water-utility decision-support prototype.

It is not a proven live city monitoring system.

Every leak result must state:

> This is an AI-generated early warning, not a confirmed leak. Technician verification is required.

Never claim that the model directly determines:

* Exact pipe age
* Internal corrosion
* Wall thickness
* Maximum hydraulic capacity
* Remaining lifespan
* Confirmed cracks
* Confirmed physical damage

Use these scientific distinctions:

* Pipe age comes from the recorded installation year.
* Pressure comes from pressure sensors.
* Flow comes from flow meters.
* Tank level comes from tank-level sensors.
* Possible leaks are inferred from hydraulic sensor patterns.
* Cameras can record visible cracks, deformation, roots, joint displacement and blockage.
* Acoustic inspection can support leak-location investigation.
* Ultrasonic or electromagnetic inspection is required for corrosion and wall-thickness assessment.
* Hydraulic capacity requires diameter, length, roughness, pressure, flow, elevation and hydraulic modelling.
* Inspection findings and AI predictions must always be stored and displayed separately.

Do not implement camera-based AI damage detection unless a validated labelled image dataset is supplied. Camera images may be attached to inspection records, but they must not be automatically diagnosed.

---

# 2. Dataset rules

The dataset package is:

```text
PipeGuard_AI_Research_Dataset_Pack.zip
```

Inspect the ZIP before writing dataset-specific processing code.

Verify:

* Actual filenames
* Folder structure
* Documentation files
* Column names
* Data types
* Timestamp formats
* Sensor IDs
* Units
* Missing values
* Duplicate timestamps
* Label definitions
* Leak-event identifiers
* Leak locations or zones
* Coordinate-reference systems
* Calgary asset and break-record relationships

The ZIP contains two independent modules.

## Module A — BattLeDIM L-Town

Use it for:

* Sensor-based leak detection
* Leak probability
* Abnormal-sensor identification
* Suspected leak-zone localization
* Chronological replay
* Event-based model evaluation

Expected research data may include approximately:

* 33 pressure sensors
* 3 flow sensors
* 1 tank-level sensor
* 82 automated meter readings
* Five-minute measurements
* Labelled leak events and locations
* 2018–2019 sensor records

## Module B — Calgary Water Network

Use it for:

* Pipe inventory
* Installation year
* Calculated pipe age
* Material
* Diameter
* Length
* Geometry
* Historical break analysis
* Geographic visualization
* Historical inspection-priority demonstrations

## Critical rule

Never merge BattLeDIM and Calgary records row by row.

They represent different water systems.

Keep them in separate database tables, processing pipelines, notebooks and application modules.

Clearly label research and demonstration data.

---

# 3. Required architecture

Use a monorepo:

```text
pipeguard-ai/
├── frontend/
├── backend/
├── ml/
├── data/
│   ├── raw/
│   ├── interim/
│   ├── processed/
│   └── demo/
├── model_artifacts/
├── reports/
├── docs/
├── tests/
├── scripts/
├── .github/
│   ├── workflows/
│   └── dependabot.yml
├── vercel.json
├── .gitignore
├── .env.example
├── README.md
├── SECURITY.md
├── CONTRIBUTING.md
└── LICENSE
```

## Frontend

Use:

* Next.js App Router
* React
* TypeScript with strict mode
* Tailwind CSS
* Accessible reusable component library
* Lucide icons
* React Hook Form
* Zod validation
* Recharts for lightweight charts
* Leaflet or MapLibre for maps
* next-themes for dark, light and system mode

## Backend

Use:

* Python 3.12
* FastAPI
* Pydantic
* NumPy
* Pandas
* scikit-learn
* Joblib
* SQLAlchemy
* Alembic
* GeoPandas only for offline geospatial processing
* Structured logging
* Pytest

Do not perform model training inside a deployed API request.

Train offline and deploy only a locked approved artifact.

## Database

Use serverless Postgres through a Vercel Marketplace integration, preferably Neon.

Create migrations for:

* users
* pipe_assets
* historical_breaks
* inspection_records
* inspection_attachments
* prediction_audit
* model_registry
* application_events

Do not store full BattLeDIM time-series data in Postgres unless necessary. Store curated demo replay samples and metadata. Large research files should remain offline or as optimized static demonstration files.

---

# 4. Vercel Services configuration

Deploy the Next.js frontend and FastAPI backend from one repository under one public domain.

Create a valid root `vercel.json` based on this structure:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "services": {
    "frontend": {
      "root": "frontend/",
      "framework": "nextjs"
    },
    "backend": {
      "root": "backend/",
      "entrypoint": "main:app"
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": {
        "service": "backend"
      }
    },
    {
      "source": "/(.*)",
      "destination": {
        "service": "frontend"
      }
    }
  ]
}
```

Adjust syntax only when required by the currently installed Vercel schema.

Use:

```text
/api/*
```

for FastAPI.

Do not create conflicting Next.js API routes.

Also document a fallback deployment method using two Vercel projects from the same monorepo:

* Frontend root: `frontend`
* Backend root: `backend`
* Frontend environment variable: `NEXT_PUBLIC_API_BASE_URL`
* Backend restricted CORS origin: production frontend URL

Make sure `vercel dev` can run the project locally.

Keep the deployed Python function small:

* Do not deploy notebooks
* Do not deploy raw datasets
* Do not deploy training-only libraries when unnecessary
* Do not deploy SHAP unless it is required at prediction time
* Store explainability summaries as generated JSON
* Keep model artifacts reasonably small
* Exclude temporary files and caches

---

# 5. Machine-learning workflow

Create the following notebooks:

```text
ml/notebooks/
├── 01_data_understanding_and_eda.ipynb
├── 02_cleaning_target_and_features.ipynb
├── 03_model_training_and_selection.ipynb
└── 04_final_evaluation_and_replay.ipynb
```

Also move reusable logic into Python modules:

```text
ml/src/
├── config.py
├── data_loading.py
├── validation.py
├── preprocessing.py
├── target_construction.py
├── feature_engineering.py
├── temporal_splitting.py
├── event_metrics.py
├── model_training.py
├── localization.py
├── calibration.py
├── artifact_export.py
└── replay.py
```

## Target construction

Inspect the supplied leak documentation and create the target from actual leak-event definitions.

Do not invent labels.

Expected output:

* `0 = Normal`
* `1 = Possible Leak`

Preserve:

* Leak-event ID
* Event start
* Event end
* Leak location
* Zone, when supported
* Development period, when supported

## Chronological splitting

Use:

* Oldest 70% for training
* Next 15% for validation
* Latest 15% for final testing

Prevent records from the same leak event from appearing in multiple splits.

Add a configurable time gap around split boundaries when necessary to prevent temporal leakage.

Never use a random split as the final evaluation method.

## Feature engineering

Create features only from current and past information.

Potential features should be generated only when supported by the actual columns:

* Pressure rolling mean
* Pressure rolling standard deviation
* Pressure change
* Pressure slope
* Pressure residual
* Flow rolling mean
* Flow change
* Flow imbalance
* Flow-to-pressure relationship
* Tank-level change
* Tank-level slope
* Demand pattern
* Time of day
* Day of week
* Cyclical hour features
* Sensor missingness count
* Sensor availability ratio
* Cross-sensor deviation
* Rolling z-scores
* Lagged values
* Baseline-normal residuals

Do not use future data in rolling windows, scaling or imputation.

Fit preprocessing only on training data.

## Model candidates

Train and compare:

* Dummy classifier
* Logistic regression
* Random forest
* HistGradientBoostingClassifier
* One additional justified scikit-learn model

Use class weights or another training-only imbalance strategy.

Do not oversample before chronological splitting.

## Required evaluation metrics

Do not select the model using ordinary accuracy.

Report:

* PR-AUC
* Leak-event recall
* Point-level precision
* Point-level recall
* False alarms per day
* Detection delay
* Confusion matrix
* Brier score
* Calibration curve
* Zone-localization performance
* Dummy baseline comparison

Select probability and severity thresholds using validation data only.

Evaluate the final approved configuration once on the latest test period.

## Replay validation

Chronologically replay unseen sensor readings as simulated live data.

Test:

1. Normal periods
2. Known leak events
3. Gradually developing leaks
4. Missing readings
5. Extreme numeric values
6. Corrupted values
7. Incorrect feature order
8. Incorrect units
9. Duplicate timestamps
10. API and notebook prediction consistency

The API must return the same prediction as the notebook for identical input.

## Model artifacts

Export:

```text
model_artifacts/
├── approved_model.joblib
├── feature_schema.json
├── feature_ranges.json
├── thresholds.json
├── sensor_inventory.json
├── zone_mapping.json
├── model_metadata.json
├── evaluation_metrics.json
├── calibration_summary.json
├── feature_importance.json
├── demo_normal_sample.json
├── demo_leak_sample.json
└── artifact_manifest.json
```

`artifact_manifest.json` must include:

* Model version
* Training date
* Dataset version
* Git commit
* Feature-schema hash
* Model-file SHA-256 hash
* Python version
* scikit-learn version
* Validation metrics
* Test metrics
* Approval status

The backend must reject an artifact when:

* The hash is invalid
* The schema does not match
* Approval status is false
* Required files are missing
* Model version is incompatible

Never load a model uploaded by an application user. Load only the trusted local approved artifact.

If the dataset or approved artifact is unavailable, do not fabricate a trained model or metrics. Build the complete training pipeline and application, use clearly labelled static demo fixtures, and return a controlled `MODEL_NOT_AVAILABLE` response for real prediction requests.

---

# 6. FastAPI requirements

Create versioned endpoints.

## System endpoints

```text
GET /api/v1/health
GET /api/v1/readiness
GET /api/v1/version
GET /api/v1/model/info
GET /api/v1/model/metrics
GET /api/v1/sensors
GET /api/v1/sensors/health
```

## Prediction endpoints

```text
POST /api/v1/predict/manual
POST /api/v1/predict/csv
POST /api/v1/predict/demo/normal
POST /api/v1/predict/demo/leak
POST /api/v1/replay
```

## Pipe endpoints

```text
GET /api/v1/pipes
GET /api/v1/pipes/{pipe_id}
GET /api/v1/pipes/{pipe_id}/history
GET /api/v1/map/pipes
GET /api/v1/map/communities
GET /api/v1/inspection-priorities
```

## Inspection endpoints

```text
GET    /api/v1/inspections
GET    /api/v1/inspections/{inspection_id}
POST   /api/v1/inspections
PATCH  /api/v1/inspections/{inspection_id}
DELETE /api/v1/inspections/{inspection_id}
```

Only authenticated technician or administrator users may create, edit or delete inspection records.

## Prediction response

Return a typed response such as:

```json
{
  "status": "Possible Leak",
  "leak_probability": 0.87,
  "severity": "High",
  "suspected_zone": "Zone 4",
  "abnormal_sensors": [
    {
      "sensor_id": "P-17",
      "sensor_type": "pressure",
      "status": "low",
      "deviation": -0.28
    }
  ],
  "main_reason": "Pressure decreased while incoming flow increased.",
  "recommended_action": "A technician should inspect the suspected zone.",
  "warning": "This is an AI-generated early warning, not a confirmed leak.",
  "data_mode": "demo",
  "data_timestamp": "2019-06-14T10:35:00Z",
  "prediction_timestamp": "2026-08-03T07:30:00Z",
  "model_version": "1.0.0",
  "schema_version": "1.0.0"
}
```

Do not return unsupported information.

## Validation

Validate:

* Exact expected feature names
* Feature order
* Numeric type
* Finite values
* Units
* Minimum and maximum reasonable ranges
* Timestamp format
* Duplicate rows
* Maximum row count
* Missing values
* File type
* File size

Limit CSV uploads to 4 MB.

Accept only CSV MIME types and validate content instead of trusting the extension.

Reject:

* Executable content
* Path traversal attempts
* Invalid delimiters
* Empty files
* Extremely wide files
* Unexpected columns
* Duplicate columns
* Formula-like unsafe values when exporting data

Return simple, safe error messages without stack traces.

---

# 7. Authentication and authorization

Keep public access simple.

Public users may:

* View the dashboard
* Use demo mode
* Use manual prediction
* Upload a valid sensor CSV
* View maps
* View pipe information
* View model information
* View read-only inspection demonstrations

Authentication is required only for technician actions.

Implement:

* Secure login
* No public administrator registration
* Argon2 password hashing
* Signed short-lived access sessions
* Rotating refresh sessions when implemented
* `HttpOnly` cookies
* `Secure` cookies in production
* `SameSite=Lax`
* CSRF protection for state-changing requests
* Role-based permissions
* Session invalidation
* Login rate limiting
* Generic login error messages

Roles:

* Public
* Technician
* Administrator

Never expose passwords, session secrets, database credentials or private tokens to the browser.

---

# 8. Security requirements

Implement security from the beginning.

## Application security

Add:

* Content Security Policy
* Strict-Transport-Security
* X-Content-Type-Options
* Referrer-Policy
* Permissions-Policy
* Frame protection using CSP `frame-ancestors`
* Secure cookie settings
* Restricted CORS
* Request body limits
* Rate limiting
* Input validation
* Parameterized database queries
* Output encoding
* Sanitized logs
* Centralized error handling
* Request IDs
* Audit records for sensitive actions
* Safe attachment filenames
* Attachment size and type validation
* Secrets only through environment variables

Do not use `Access-Control-Allow-Origin: *` with authenticated endpoints.

Do not log:

* Passwords
* Session cookies
* Authorization headers
* Database credentials
* Uploaded sensor rows
* Full personal technician notes

## Dependency security

Create:

```text
.github/dependabot.yml
.github/workflows/ci.yml
.github/workflows/codeql.yml
.github/workflows/security.yml
```

CI must run:

### Frontend

* Install from lockfile
* ESLint
* TypeScript checking
* Unit tests
* Production build
* Dependency audit

### Backend

* Install pinned dependencies
* Ruff
* Black check
* Mypy
* Pytest
* Bandit
* pip-audit

### Repository

* CodeQL
* Secret scanning guidance
* No committed `.env`
* No committed credentials
* No raw private datasets
* No generated database dumps

Pin dependencies and commit lockfiles.

Create `SECURITY.md` containing:

* Supported versions
* Reporting process
* Secret-handling rules
* Dependency-update process
* Incident-response checklist

---

# 9. Frontend navigation

Create these pages:

```text
/
├── dashboard
├── leak-detection
├── pipeline-map
├── pipe-information
├── inspection-records
├── model-information
├── about
└── login
```

Use the name **PipeGuard AI** consistently.

## Main navigation

1. Dashboard
2. Leak Detection
3. Pipeline Map
4. Pipe Information
5. Inspection Records
6. Model Information
7. About Project

Desktop:

* Fixed or collapsible left sidebar
* Top header
* Main content area

Tablet:

* Compact sidebar or drawer

Mobile:

* Hamburger navigation
* Bottom navigation for Home, Detect, Map, Pipes and Inspections
* No horizontal page scrolling
* Touch targets at least 44 pixels
* Tables converted into cards or scrollable containers
* Forms displayed in one column

Support widths from approximately 320 pixels to large desktop screens.

---

# 10. Design system

Use:

* White and light-grey surfaces in light mode
* Deep navy sidebar
* Blue and cyan accents
* Green for normal
* Orange for warnings
* Red for critical alerts
* Grey for unavailable data
* Rounded professional cards
* Clear typography
* Consistent spacing
* Icons with visible labels
* Accessible focus indicators
* Skeleton loading states
* Empty states
* Error states
* Offline/API unavailable state
* No excessive animation

Do not use real water-company logos.

Do not display fabricated production statistics.

All research values must display a visible:

**Demo Data**

or:

**Research Data**

badge.

---

# 11. Dark and light modes

Implement:

* Light mode
* Dark mode
* System mode
* Persistent user preference
* Theme toggle in the header
* No unreadable text in either theme
* Appropriate chart colours in both themes
* Accessible contrast
* No flash of incorrect theme during loading

Test every page in light and dark modes.

---

# 12. Dashboard requirements

Display:

* Application status
* Total available pipeline records
* Normal status count
* Possible leak alerts
* Critical inspection cases
* Sensor availability
* Abnormal sensors
* Latest dataset timestamp
* Prediction timestamp
* Current browser-local time
* Time-zone label
* Last API refresh time
* Recent alerts
* Small pipeline-status map
* Inspection-priority table
* Demo Data badge
* Clear early-warning notice

Important timestamp distinction:

* `Current time` means the user’s current browser time.
* `Latest sensor timestamp` means the newest record in the loaded dataset.
* `Prediction generated` means when the API produced the prediction.

Never label historical research data as live.

Use wording such as:

> Replaying historical research readings as simulated live data.

---

# 13. Leak Detection page

Create four modes.

## Demo Mode

* Try Normal Example
* Try Leak Example
* Replay historical unseen sample
* Visible Demo Data badge

## Manual Mode

Generate the form dynamically from `feature_schema.json`.

Group inputs into:

* Pressure
* Flow
* Tank level
* Meter readings
* Time information

Show:

* Unit
* Description
* Expected range
* Missing-data status
* Sensor ID

## CSV Mode

Include:

* Download CSV template
* Drag-and-drop upload
* Column preview
* Validation result
* Invalid-row report
* Maximum-size notice
* Analyse button

## Future Live Mode

Show a disabled architecture preview:

```text
Physical sensors → secure gateway → sensor API → validation → PipeGuard AI
```

State clearly:

> No physical sensors are currently connected.

## Result panel

Show:

* Normal or Possible Leak
* Probability
* Severity
* Suspected zone
* Abnormal sensors
* Plain-language reason
* Recommended action
* Dataset timestamp
* Model version
* Technician-verification warning

Do not rely on colour alone. Use icons and text.

---

# 14. Pipeline Map page

Use Leaflet or MapLibre.

Include:

* Pipeline geometry
* Community boundaries
* Sensor markers
* Suspected zones
* Search
* Filters
* Status legend
* Selected-pipeline panel
* Latest reading
* Historical breaks
* Last inspection
* Current alert
* Inspection priority

Status colours:

* Green: Normal
* Orange: Warning
* Red: Critical
* Grey: No recent data

Display map attribution.

Reduce or simplify GeoJSON offline for web performance.

Do not send the complete heavy research dataset to the browser.

---

# 15. Pipe Information page

Allow search by:

* Pipeline ID
* Community
* Material
* Installation-year range
* Diameter range
* Historical-break count

Display:

* Pipeline ID
* Installation year
* Calculated age
* Material
* Diameter
* Length
* Geometry/location
* Latest available pressure
* Latest available flow
* Maintenance history
* Break history
* Last inspection
* Current alert
* Data source

Always show:

> Pipe age is calculated from the recorded installation year. It is not predicted by AI.

Do not display pressure or flow for Calgary pipes unless a valid mapping or actual reading exists. Display “Not available” instead.

---

# 16. Inspection Records page

Create inspection forms for:

* Camera inspection
* Acoustic test
* Ultrasonic inspection
* Electromagnetic inspection
* General visual inspection

Fields:

* Pipeline ID
* Technician
* Inspection date
* Inspection type
* Camera result
* Acoustic result
* Ultrasonic result
* Visible damage
* Confirmed leak: Yes/No/Not determined
* Repair required
* Repair status
* Notes
* Attachment metadata
* Follow-up date

Possible repair statuses:

* Not reviewed
* Inspection required
* Repair scheduled
* Repair in progress
* Repaired
* Monitoring
* Closed

Clearly distinguish:

* AI warning
* Technician observation
* Confirmed finding
* Repair decision

Do not automatically convert an AI warning into a confirmed leak.

---

# 17. Model Information page

Display:

* Model name
* Version
* Training period
* Validation period
* Test period
* Dataset modules
* Feature count
* Selected threshold
* PR-AUC
* Leak-event recall
* Precision
* False alarms per day
* Detection delay
* Brier score
* Zone-localization result
* Dummy baseline
* Confusion matrix
* Calibration chart
* Top feature groups
* Model limitations
* Data limitations
* Artifact hash
* Last approved date

Do not display a metric unless it was actually calculated.

If no approved model exists, show:

> Model training has not been completed. Demonstration results are static research examples.

---

# 18. About page

Explain in simple language:

* What PipeGuard AI does
* Who could use it
* How sensor leak detection works
* What the model cannot detect
* Why technician verification is required
* Difference between sensor data and asset data
* Difference between AI warnings and inspection findings
* Data-source acknowledgements
* Portfolio-prototype notice

Include this portfolio statement:

> The model detects hydraulic leak patterns in unseen research sensor data using chronological replay.

---

# 19. Performance requirements

Implement:

* Server Components where appropriate
* Client Components only when interaction is needed
* Lazy-loaded maps and heavy charts
* Paginated asset tables
* Optimized GeoJSON
* Loading boundaries
* Error boundaries
* Cached static metadata
* No raw dataset bundled into frontend JavaScript
* No retraining during deployment
* No unnecessary API polling
* AbortController for cancelled frontend requests
* Debounced search
* Accessible reduced-motion support

Target good Lighthouse results without falsifying scores.

---

# 20. Testing requirements

## Machine-learning tests

Test:

* Chronological split order
* Event separation
* No future leakage
* Feature-schema consistency
* Deterministic preprocessing
* Threshold application
* Metric calculations
* Model serialization
* Artifact hash validation
* Notebook/API prediction consistency

## Backend tests

Test:

* Health endpoint
* Readiness endpoint
* Valid prediction
* Missing fields
* Wrong feature order
* NaN
* Infinity
* Extreme values
* Invalid timestamps
* Invalid CSV
* Oversized upload
* Wrong MIME type
* Unauthorized inspection creation
* Role permissions
* CSRF rejection
* Database rollback
* Safe error responses

## Frontend tests

Use:

* Vitest
* React Testing Library
* Playwright

Test:

* Navigation
* Theme switching
* Mobile menu
* Dashboard rendering
* Demo normal example
* Demo leak example
* Manual validation
* CSV validation
* Error state
* API unavailable state
* Map loading
* Pipeline search
* Inspection authorization
* Responsive layout
* Keyboard navigation

Test these viewport sizes:

* 360 × 800
* 390 × 844
* 768 × 1024
* 1024 × 768
* 1366 × 768
* 1440 × 900

Run an end-to-end smoke test against a Vercel preview deployment when deployment credentials are available.

---

# 21. Environment variables

Create `.env.example`.

Potential variables:

```text
APP_ENV=
APP_VERSION=
DATABASE_URL=
SESSION_SECRET=
CSRF_SECRET=
ALLOWED_ORIGINS=
MODEL_PATH=
MODEL_MANIFEST_PATH=
ENABLE_DEMO_MODE=
ENABLE_TECHNICIAN_LOGIN=
MAX_CSV_BYTES=
LOG_LEVEL=
NEXT_PUBLIC_APP_NAME=
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_DEFAULT_THEME=
NEXT_PUBLIC_MAP_TILE_URL=
NEXT_PUBLIC_MAP_ATTRIBUTION=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Rules:

* Never commit `.env`
* Never expose secrets through `NEXT_PUBLIC_*`
* Validate required environment variables at startup
* Fail safely when a production secret is missing
* Provide development-safe defaults only where appropriate

---

# 22. Required documentation

Create a complete `README.md` containing:

1. Project overview
2. Real-world problem
3. Scientific boundaries
4. Architecture
5. Dataset modules
6. Repository structure
7. Local setup
8. Dataset setup
9. Model training
10. Backend setup
11. Frontend setup
12. Database migrations
13. Testing
14. Security
15. Vercel deployment
16. Environment variables
17. Demo usage
18. API documentation
19. Screenshots
20. Known limitations
21. Future live-sensor architecture
22. Portfolio explanation
23. Interview talking points

Also create:

```text
docs/
├── architecture.md
├── data_dictionary.md
├── model_card.md
├── api_contract.md
├── security_architecture.md
├── deployment.md
├── testing.md
├── user_guide.md
└── scientific_boundaries.md
```

Create a Mermaid architecture diagram.

---

# 23. Vercel deployment guide

Document exact steps:

1. Push repository to GitHub.
2. Import repository into Vercel.
3. Confirm Vercel Services configuration.
4. Provision Neon Postgres from Vercel Marketplace.
5. Add production, preview and development environment variables.
6. Run Alembic migrations.
7. Load safe demonstration seed data.
8. Verify model-artifact manifest.
9. Deploy preview.
10. Run smoke tests.
11. Inspect build logs.
12. Confirm API health.
13. Confirm frontend-to-backend routing.
14. Confirm security headers.
15. Confirm mobile layouts.
16. Promote to production.
17. Add custom domain when available.

Also provide the two-project fallback instructions.

Do not require Docker for Vercel deployment, but optional Dockerfiles may be provided for local development.

---

# 24. Required quality gates

Do not mark the project complete until:

* Frontend production build passes
* Backend tests pass
* TypeScript check passes
* Python type checks pass
* Linting passes
* Security scans complete
* Database migrations work
* No secrets are committed
* API returns safe validation errors
* Demo mode works
* Manual mode works
* CSV mode works
* Theme switching works
* Mobile navigation works
* Dashboard timestamps are correctly labelled
* Map is responsive
* Model metrics are not fabricated
* API and notebook predictions match
* Model artifact is approved
* Vercel configuration validates
* README contains deployment instructions

---

# 25. Execution behaviour

Follow this sequence:

1. Inspect the existing repository.
2. Inspect the uploaded dataset ZIP.
3. Produce a concise implementation plan.
4. Create the repository structure.
5. Implement data inspection and ML modules.
6. Run dataset validation.
7. Train and evaluate models only when data is available.
8. Export approved artifacts only when evaluation is complete.
9. Implement the FastAPI backend.
10. Implement the database and migrations.
11. Implement the Next.js frontend.
12. Implement authentication and security.
13. Add automated tests.
14. Add GitHub Actions.
15. Add Vercel Services configuration.
16. Run all available checks.
17. Fix errors.
18. Provide a final implementation report.

Do not stop after generating empty files.

Do not leave essential buttons non-functional.

Do not use fake API responses when a real endpoint has been implemented.

Static demonstration fixtures are allowed only when visibly labelled as Demo Data.

When something cannot be completed because the dataset, credentials or deployment account is unavailable:

* Complete all code that can be completed.
* Add a clear configuration placeholder.
* Do not fabricate results.
* State exactly what remains manual.

At the end, report:

* Files created
* Files modified
* Tests executed
* Test results
* Build results
* Security checks
* Model status
* Database status
* Vercel deployment status
* Remaining manual steps
* Exact commands required for the next action
  :::

Upload `PipeGuard_AI_Research_Dataset_Pack.zip` into the coding workspace before using the prompt. That allows the coding agent to build the feature schema and training pipeline from real columns instead of inventing sensor fields.

[1]: https://vercel.com/docs/functions/runtimes/python?utm_source=chatgpt.com "Using the Python Runtime with Vercel Functions"
[2]: https://vercel.com/docs/functions/limitations?utm_source=chatgpt.com "Vercel Functions Limits"
