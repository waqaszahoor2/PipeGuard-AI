# Testing

## Backend

`pytest` covers health, readiness, demo prediction, safe model-unavailable behaviour,
schema validation and authorization.

## ML

Tests cover timestamp order, event separation, past-only rolling operations, schema
consistency, deterministic transforms, metric functions and manifest validation.

## Frontend

Vitest and React Testing Library cover dashboard rendering, navigation, badges and
theme controls. Playwright smoke tests cover desktop and mobile routes.

## Manual QA

Test 360×800, 390×844, 768×1024, 1024×768, 1366×768 and 1440×900 in light/dark mode.
