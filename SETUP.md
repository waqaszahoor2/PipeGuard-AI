# PipeGuard AI — Local Setup & Development Guide

This guide provides detailed instructions for setting up, running, testing, and developing the PipeGuard AI platform locally.

---

## 📋 System Requirements

| Tool | Version Requirement | Notes |
| :--- | :--- | :--- |
| **Node.js** | `>=18.18.0` (Recommended: Node 20/22 LTS) | Required for Next.js 16 frontend |
| **npm** | `>=9.0.0` | Node Package Manager |
| **Python** | `>=3.10` (Tested on 3.14) | Required for ML scripts & FastAPI backend |
| **Git** | `>=2.30` | Version control |

---

## 🚀 Frontend Setup & Local Execution

### 1. Navigate to Frontend Directory
```bash
cd PipeGuard-AI/frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Key variables:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME="PipeGuard AI Research Prototype"
```

### 4. Start Development Server
```bash
npm run dev
```
Access the application at [http://localhost:3000](http://localhost:3000).

---

## 🐍 Backend & ML Environment Setup

### 1. Install Backend Dependencies
From the repository root:
```bash
py -m pip install -r backend/requirements.txt -r backend/requirements-dev.txt
```

### 2. Run Backend Development Server
```bash
$env:PYTHONPATH="backend"
py -m uvicorn app.main:app --reload --port 8000
```
Swagger API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## 🧪 Running Automated Tests

### Frontend Vitest Suite
```bash
cd frontend
npm run test
```

### Frontend TypeScript & Linting Checks
```bash
npm run typecheck
npm run lint
```

### Python ML & Backend Pytest Suite
```bash
$env:PYTHONPATH="backend"
py -m pytest backend/tests tests/test_ml_pipeline.py
```

---

## 📦 Production Build Verification
To ensure your local changes will build cleanly on Vercel:
```bash
cd frontend
npm run build
```
The output should report zero TypeScript or Next.js build errors.
