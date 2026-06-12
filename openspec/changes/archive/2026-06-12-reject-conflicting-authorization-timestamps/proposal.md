## Why

Authorization records require lifecycle timestamps for their current state, but pre-active and denied records can still carry later lifecycle timestamps such as `activatedAt`, `pausedAt`, or `terminatedAt`. That creates contradictory audit metadata that future adapters could misread as a visible or previously active remote session.

## What Changes

- Reject `pending` authorization records that carry decision, activation, pause/resume, revocation, termination, or expiration timestamps.
- Reject `approved` authorization records that carry denial, activation, pause/resume, revocation, termination, or expiration timestamps.
- Reject `denied` authorization records that carry approval, activation, pause/resume, revocation, termination, or expiration timestamps.
- Preserve existing timestamp requirements for approved, denied, active, paused, revoked, terminated, and expired records.
- Add focused authorization schema tests for conflicting timestamps.
- Safety impact: this touches authorization record validation and audit integrity only. It does not add capture, input, clipboard, file transfer, installer, startup, service, credential access, token disclosure, privilege elevation, or hidden access.

## Capabilities

### New Capabilities

### Modified Capabilities
- `session-authorization`: Pre-active and denied authorization records reject conflicting lifecycle timestamps before action authorization.

## Impact

- `packages/protocol`: session authorization schema validation and tests.
- `docs`: security model clarification for lifecycle timestamp consistency.
- OpenSpec: modified schema-level authorization record invariants.
