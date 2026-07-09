## 1. Command Bootstrap

- [x] 1.1 Add bounded `--generate-session` parsing and generation to full `mvp:commands` plans.
- [x] 1.2 Reject generated session metadata in role-filtered and preflight-only command output before generation.
- [x] 1.3 Add the fixed session bootstrap reference to the full `mvp:trial` plan while keeping scoped plans focused.

## 2. Readiness, Docs, and Review

- [x] 2.1 Update `mvp:ready` drift checks for the new trial bootstrap metadata.
- [x] 2.2 Update README and main `mvp-session-command-kit` OpenSpec spec.
- [x] 2.3 Perform a security review covering session/pairing bootstrap diagnostics.

## 3. Tests and Verification

- [x] 3.1 Add focused command-kit, trial, and ready tests for generated session metadata and scoped rejection.
- [x] 3.2 Run focused command-kit, trial, and ready tests.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm test`.
- [x] 3.5 Run `npm run build`.
- [x] 3.6 Run `npm run openspec:validate`.
