# Security Architecture

- Restricted production CORS
- CSP, HSTS, content-type, referrer and permissions headers
- Frame denial through `frame-ancestors`
- Signed short-lived HttpOnly cookies
- CSRF header/cookie comparison for state-changing requests
- Argon2 password hashes
- Technician/administrator role checks
- Request body and CSV limits
- CSV content, delimiter, width, columns and finite-number validation
- Parameterized SQLAlchemy queries
- Request IDs and sanitized structured logs
- Trusted local model only; no user model uploads
- Safe attachment metadata and type/size checks
- Environment-only secrets
