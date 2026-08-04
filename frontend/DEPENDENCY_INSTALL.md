# Frontend Dependency Installation

All dependencies are pinned in `package.json`.

Run:

```bash
npm install
npm run typecheck
npm test -- --run
npm run build
```

The current generation environment could not reach the public npm registry, so a
resolved `package-lock.json` could not be generated here. Generate and commit it in a
normal network-enabled development environment, then change CI from `npm install`
to `npm ci`.
