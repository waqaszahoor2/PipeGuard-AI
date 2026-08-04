#!/usr/bin/env bash
set -euo pipefail

python -m pytest tests backend/tests
(
  cd backend
  python -m compileall app main.py
)
(
  cd frontend
  npm run lint
  npm run typecheck
  npm test -- --run
  npm run build
)
echo "All available checks completed."
