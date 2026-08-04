.PHONY: extract audit backend frontend test

extract:
	python scripts/extract_dataset.py

audit:
	python scripts/audit_dataset.py

backend:
	cd backend && uvicorn main:app --reload --port 8000

frontend:
	cd frontend && npm run dev

test:
	PYTHONPATH=backend:. pytest tests backend/tests
	cd frontend && npm run typecheck && npm test -- --run
