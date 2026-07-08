## 1. Ready Integration

- [x] 1.1 Add `--include-evidence-fixture` parsing and usage text to `mvp:ready`.
- [x] 1.2 Add an explicit `evidence-fixture` ready-plan step that runs `mvp:evidence-fixture -- --verify --json`.
- [x] 1.3 Validate bounded evidence fixture JSON output and fail closed on malformed or unverified results.
- [x] 1.4 Reject `--include-evidence-fixture` with role-scoped readiness.

## 2. Docs, Specs, and Review

- [x] 2.1 Update README and main `mvp-session-command-kit` OpenSpec spec.
- [x] 2.2 Perform a security review covering local fixture writes, bounded readiness diagnostics, and non-runtime behavior.

## 3. Tests and Verification

- [x] 3.1 Add focused ready tests for parsing, plan shape, success, malformed fixture output, default skip, role rejection, and bounded diagnostics.
- [x] 3.2 Run focused ready tests.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm test`.
- [x] 3.5 Run `npm run build`.
- [x] 3.6 Run `npm run openspec:validate`.
