# PipeGuard AI — Pipeline Anomaly & Risk Detection Platform

> **Scientific Research Prototype & Hydro-Dynamic Telemetry Suite**  
> A Next.js, FastAPI, and Python ML monitoring application for municipal water distribution networks.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-emerald?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.8-orange?style=flat-square&logo=scikit-learn)](https://scikit-learn.org/)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel)](https://pipe-guard-ai.vercel.app/)

---

## 🌟 Overview

**PipeGuard AI** is a full-stack data science platform designed to aggregate municipal water pipeline telemetry, calculate hydro-dynamic pressure/flow risk anomalies, map infrastructure assets geospatially, and manage technician field inspection workflows.

It combines real-world public water main data (City of Calgary dataset) with chronological research sensor benchmarks (BattLeDIM 2019 dataset) to provide early-warning decision support for utility operators and field engineers.

---

## 🚀 Key Modules & Capabilities

- **📊 Telemetry & Risk Dashboard (`/dashboard`)**: Aggregates pressure/flow trends, risk severity distributions, high-risk pressure zones, and real-time alert priorities directly from 50+ monitored distribution mains.
- **💧 Anomaly & Risk Calculator (`/leak-detection`)**: Interactive hydro-dynamic simulation tool that evaluates operating pressure drops, flow variance, pipe age, and material degradation to compute vulnerability index (0-100) and recommended protocols.
- **🗺️ Interactive Geospatial Map (`/pipeline-map`)**: Dynamic Leaflet map rendering with risk-coded markers (Green = Low, Yellow = Med, Orange = High, Red = Critical), marker click inspector, and 2D tabular view toggle.
- **📂 Pipe Asset Directory (`/pipe-information`)**: Comprehensive searchable registry of 50+ pipeline assets with installation dates, materials, diameters, capacities, pressures, filtering, pagination, and CSV export.
- **📋 Field Inspection Workflows (`/inspection-records`)**: Multi-role workflow engine supporting **Public Visitor**, **Technician (Demo Auth)** observation logging, and **Administrator** review queues with downloadable field reports and print views.
- **🧠 ML Model Card & Benchmark (`/model-information`)**: Reproducible machine learning metrics, event-aware temporal splitting protocol, PR-AUC evaluations, and feature importance weighting.

---

## 🔬 Scientific Methodology & Disclaimer

> ⚠️ **RESPONSIBLE USE & SCIENTIFIC BOUNDARY DISCLAIMER**  
> PipeGuard AI is a research and educational prototype. It does **NOT** independently confirm physical pipeline leakage, wall corrosion depth, structural cracking, or remaining pipe lifespan. All output recommendations serve as decision support and require physical field verification by qualified technicians using acoustic, CCTV, or ultrasonic methods.

### Event-Aware Temporal Splitting
To eliminate temporal data leakage present in standard k-fold cross-validation, PipeGuard AI groups continuous leak windows into discrete event identifiers. A 24-hour chronological buffer gap is maintained between training and test holdouts.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Next.js 16 (App Router, Turbopack), React 19, TypeScript, TailwindCSS 3.4, Recharts 2.15, Leaflet 1.9, Lucide React, Vitest.
- **Backend (Optional API)**: FastAPI, Pydantic v2, SQLAlchemy 2, Alembic, SQLite / PostgreSQL, Pytest.
- **ML Pipeline**: Python 3.14, Scikit-Learn (Logistic Regression, Random Forest, HistGradientBoosting), Pandas, NumPy.
- **Deployment**: Vercel (Frontend & Static Assets), Render/Railway (Backend API optional).

---

## 💻 Quick Setup & Local Running

### Prerequisites
- Node.js >= 18.18.0 (Node 20+ recommended)
- Python >= 3.10

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/waqaszahoor2/PipeGuard-AI.git
cd PipeGuard-AI/frontend
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Test Suite & Build Verification
```bash
npm run test       # Runs Vitest component & utility unit tests
npm run typecheck  # Runs TypeScript strict compiler check
npm run lint       # Runs ESLint flat config check
npm run build      # Executes production Next.js build
```

---

## 📚 Documentation Directory

- [`SETUP.md`](./SETUP.md): Detailed local installation and environment instructions.
- [`DEPLOYMENT.md`](./DEPLOYMENT.md): Step-by-step Vercel deployment & production build setup.
- [`DATA_DICTIONARY.md`](./DATA_DICTIONARY.md): Full dataset schema, unit definitions, and risk index formulas.
- [`MODEL_CARD.md`](./MODEL_CARD.md): Complete ML Model Card, PR-AUC evaluation, and group-aware split logic.
- [`TESTING.md`](./TESTING.md): Overview of Vitest and Pytest automated testing suites.
- [`LIMITATIONS.md`](./LIMITATIONS.md): Transparent scientific boundaries and ethical guidelines.

---

## 📄 License
Released under the MIT License for research and academic portfolio demonstration.
