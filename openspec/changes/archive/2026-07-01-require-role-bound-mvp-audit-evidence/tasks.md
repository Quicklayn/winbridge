## 1. Planning and Safety

- [x] 1.1 Validate the OpenSpec change strictly before implementation.
- [x] 1.2 Confirm the change stays read-only and metadata-only.

## 2. Role-Bound Strict Evidence

- [x] 2.1 Add private host/viewer required evidence maps to the audit summary helper.
- [x] 2.2 Make `--require-mvp-evidence` check role-scoped summaries rather than union coverage.
- [x] 2.3 Keep non-strict summary output and JSON shape unchanged.

## 3. Tests and Docs

- [x] 3.1 Add regression tests proving swapped-role evidence fails strict mode.
- [x] 3.2 Add tests proving non-strict partial/swapped summaries still report bounded metadata.
- [x] 3.3 Update README and OpenSpec specs for role-bound strict evidence.
- [x] 3.4 Run security review for audit/log output and role-bound gate semantics.

## 4. Verification

- [x] 4.1 Run targeted audit-summary tests.
- [x] 4.2 Run `npm run check`.
- [x] 4.3 Run `npm test`.
- [x] 4.4 Run `npm run build`.
- [x] 4.5 Run `npm run openspec:validate`.
