## 1. Readiness Validation

- [x] 1.1 Add `mvp:trial -- --json` to default readiness and parse the bounded full trial plan.
- [x] 1.2 Add role-scoped `mvp:trial -- --role <role> --json` readiness checks.
- [x] 1.3 Add fail-closed parser coverage for malformed, duplicate, cross-role, or evidence-mode trial metadata.

## 2. Doctor and Documentation

- [x] 2.1 Add `mvp:trial` root script alignment to `mvp:doctor`.
- [x] 2.2 Update README to mention trial-plan readiness validation.
- [x] 2.3 Perform a security review for non-executing trial readiness parsing and doctor alignment.

## 3. Verification

- [x] 3.1 Run focused ready, doctor, and trial tests.
- [x] 3.2 Run `npm run check`.
- [x] 3.3 Run `npm test`.
- [x] 3.4 Run `npm run build`.
- [x] 3.5 Run `npm run openspec:validate`.
