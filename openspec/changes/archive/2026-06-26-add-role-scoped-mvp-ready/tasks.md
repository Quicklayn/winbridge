## 1. CLI and Plan

- [x] 1.1 Add bounded `--role relay|host|viewer` parsing with duplicate, missing, unknown, and `--include-smoke` rejection.
- [x] 1.2 Add role-scoped readiness plans without changing the default plan.
- [x] 1.3 Ensure CLI execution passes the parsed role into readiness checks.

## 2. Tests and Docs

- [x] 2.1 Add focused tests for role parsing, plan shape, success/failure output, JSON output, and bounded diagnostics.
- [x] 2.2 Update README and OpenSpec to document role-scoped ready behavior and safety boundaries.

## 3. Verification

- [x] 3.1 Run focused ready helper tests.
- [x] 3.2 Run repository verification (`npm run check`, `npm test`, `npm run build`, `npm run openspec:validate`, and `git diff --check`).
