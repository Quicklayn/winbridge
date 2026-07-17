## 1. Agent Shell Audit Semantics

- [x] 1.1 Add bounded authorization correlation metadata to host approval, activation, revocation, native capture/input, and disconnect audit records, including post-adapter capture completion.
- [x] 1.2 Split native input audit into fail-closed pre-adapter application-requested and post-adapter input-applied success records.
- [x] 1.3 Update agent-shell integration tests for audit ordering, adapter rejection, and post-success audit failure.
- [x] 1.4 Persist and test bounded viewer local-leave disconnect evidence after closure without blocking immediate leave on slow or failed audit I/O.
- [x] 1.5 Split viewer frame-output audit into fail-closed pre-write request and post-sink success evidence with failure-path tests.

## 2. Session-Bound Strict Evidence

- [x] 2.1 Require and validate an explicit expected session for strict audit evidence while preserving non-strict summaries.
- [x] 2.2 Validate one ordered authorization lifecycle with correlated capture request/completion/frame, viewer output request/success, input send/applied evidence, and terminal barriers without rendering identifiers.
- [x] 2.3 Add audit-summary tests for valid correlation, mixed sessions/authorizations, wrong order, missing native provenance, legacy output, terminal barriers, and bounded diagnostics.

## 3. Trial And Fixture Workflows

- [x] 3.1 Generate one deterministic correlated fixture lifecycle with capture completion and output request/success, and require an explicit session for fixture verification.
- [x] 3.2 Carry the expected session through trial plan and evidence-mode commands with focused tests.
- [x] 3.3 Carry the expected session through command-kit and readiness validation, including the explicit fixture session and revised fixture counts, with focused tests.
- [x] 3.4 Update operator documentation and command examples for the hardened session-bound evidence gate.

## 4. Security And Verification

- [x] 4.1 Review capture, input, authorization correlation, audit redaction, and failure paths against WinBridge safety invariants.
- [x] 4.2 Run focused script and agent-shell tests for the changed workflows.
- [x] 4.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 4.4 Run strict OpenSpec validation and archive the completed change.
