# Deployment

## Vercel services

The root configuration routes `/api/*` to FastAPI and all other paths to Next.js.
Confirm the installed Vercel schema before production and adjust only if the platform
reports a schema change.

## Neon

1. Provision Postgres in the Vercel marketplace.
2. Add `DATABASE_URL` to all required environments.
3. Run `alembic upgrade head`.
4. Seed only safe demo records.
5. Restrict production CORS to the frontend domain.

## Verification

- `/api/v1/health` is 200.
- `/api/v1/readiness` honestly reports model status.
- security headers are present.
- no `.env`, dataset extraction or notebook is deployed.
- demo badges and historical timestamps remain visible.
- mobile navigation works at 360 px.
