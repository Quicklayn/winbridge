## 1. Runtime Implementation

- [x] 1.1 Add host-only managed runtime `terminate()` with visible active/paused authorization gating.
- [x] 1.2 Refactor delayed and direct termination to share host workflow state and protocol/audit behavior.
- [x] 1.3 Preserve audit fail-closed behavior and sanitized diagnostics for direct termination audit failures.

## 2. Tests And Documentation

- [x] 2.1 Add integration tests for direct termination success from active, success from paused, host-only rejection, precondition rejection, audit failure, and timer coherence.
- [x] 2.2 Update architecture and security docs for direct local termination control.

## 3. Verification

- [x] 3.1 Run targeted agent-shell runtime integration tests.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Complete security review for authorization lifecycle, visible-session, termination, and audit/logging surfaces.
