# Security Policy

## Supported version

Security fixes are applied to the current main branch and latest tagged release.

## Reporting

Do not open a public issue for a suspected vulnerability. Send a private report
to the repository owner with the affected version, reproduction steps, impact,
and any safe proof of concept. Do not include real credentials or personal data.

## Secret handling

- Never commit `.env`, access tokens, database credentials or session secrets.
- Use separate production, preview and development variables.
- Rotate credentials immediately after suspected exposure.
- Browser-visible variables must be limited to non-secret `NEXT_PUBLIC_*` values.
- The application never accepts uploaded model files.

## Dependency updates

Dependabot checks npm, pip and GitHub Actions dependencies. CI runs dependency
audits, static analysis and tests before merging.

## Incident checklist

1. Contain the affected environment.
2. Revoke and rotate secrets.
3. Preserve sanitized logs and request IDs.
4. Patch the cause and add a regression test.
5. Review database access and audit events.
6. Redeploy from a trusted commit.
7. Document impact and follow-up work.
