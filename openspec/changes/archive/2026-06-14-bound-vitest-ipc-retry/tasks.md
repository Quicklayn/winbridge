## 1. Runner Policy

- [x] 1.1 Extract test runner policy helpers for discovery, prioritization, Vitest arguments, output replay, and transient IPC classification.
- [x] 1.2 Update `scripts/run-tests.mjs` to retry at most once only for recognized transient Vitest IPC worker failures.
- [x] 1.3 Preserve serial per-file forks execution, single-worker flags, file prioritization, and default isolation.

## 2. Tests And Docs

- [x] 2.1 Add focused unit coverage for transient retry classification and non-transient failure classification.
- [x] 2.2 Add focused unit coverage proving Vitest command arguments include the required serial forks flags and omit `--no-isolate`.
- [x] 2.3 Update any relevant local workflow documentation if user-facing `npm test` behavior changes.

## 3. Verification

- [x] 3.1 Run focused test-runner policy tests.
- [x] 3.2 Run strict OpenSpec validation for `bound-vitest-ipc-retry`.
- [x] 3.3 Run workflow/security review for the runner change.
- [x] 3.4 Run `npm run check`.
- [x] 3.5 Run `npm test`.
- [x] 3.6 Run `npm run build`.
- [x] 3.7 Run `npm run openspec:validate`.
