# Security Review

## Scope

Reviewed the strict role-local audit action mapping used by the default MVP
smoke verifier, focused tests, the complete modified requirement, and bounded
human and JSON diagnostics.

## Findings

No blocking findings.

- The canonical `agent-shell.session.disconnected` action is added only to the
  viewer strict-role map; host and global summary maps are unchanged.
- Required evidence still counts only when `outcome` is exactly `accepted`.
- Denied, failed, missing, wrong-role, malformed, partial, and oversized audit
  input remains fail-closed.
- Existing viewer disconnect requested/sent actions remain supported and have
  positive viewer-local regression coverage.
- The complete modified requirement preserves the existing malformed-summary
  fail-closed scenario, so synchronization cannot drop that guarantee.
- Success and failure output remains limited to fixed checks, bounded counts,
  and booleans and does not expose paths, raw actions, records, identifiers,
  details, input contents, or secrets.

## Safety Invariants

The change affects only read-only smoke verification. It does not alter runtime
consent, host visibility, authorization, revocation, disconnect behavior,
capture, input, relay routing, protocol messages, native Windows APIs,
installation, services, startup, persistence, elevation, or unattended access.

## Residual Risks

The host and viewer may both legitimately emit the canonical local session
disconnect action. Existing strict scoping continues to rely on the separate
configured host-local and viewer-local audit files; this change introduces no
cross-file aggregation.

## Verification

- Focused smoke verifier tests: 57 passed.
- Exact default `npm run mvp:smoke -- --json`: all 11 checks passed.
- `npm run verify`: passed after one repository-runner retry of the known
  transient Vitest `ERR_IPC_CHANNEL_CLOSED` condition.
- Strict current-change validation: passed.
- Native Windows capture and input were not invoked by the review.

## OpenSpec Impact

The complete modified requirement matches the implementation and preserves all
pre-existing scenarios. No additional capability change is required.
