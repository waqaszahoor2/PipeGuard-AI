# PipeGuard AI — Security Audit & Hardening Report

---

## Executive Summary

A full security audit was conducted across all frontend components, FastAPI backend endpoints, environment variables, authentication logic, CORS settings, security headers, and third-party dependencies.

---

## Audit Findings & Hardening Measures

### 1. Next.js Version Upgrade
- **Vulnerability**: Vulnerable versions of Next.js are subject to CVE-2025-66478.
- **Action**: Upgraded Next.js to secure release **16.2.11**. Removed all vulnerable lockfile entries.

### 2. HTTP Security Headers
- Added mandatory HTTP security headers in `frontend/next.config.mjs`:
  - `Content-Security-Policy`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), payment=()`
  - `X-Frame-Options: DENY`

### 3. Secrets & Credentials Protection
- Verified no private keys, passwords, database URLs, or API tokens are hardcoded in source files.
- Provided `.env.example` with safe placeholder variable names.

### 4. Restricted CORS Policy
- Configured FastAPI `CORSMiddleware` in `backend/app/main.py` using `ALLOWED_ORIGINS` environment variable instead of wildcard (`*`) for authenticated endpoints.

### 5. Input Validation & File Upload Safeguards
- Pydantic schemas enforce type validation for all prediction requests.
- CSV upload endpoint validates file size limit (`MAX_CSV_BYTES`) and column schemas before processing.
