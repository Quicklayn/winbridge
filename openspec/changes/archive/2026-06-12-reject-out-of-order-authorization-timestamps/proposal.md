## Why

Authorization lifecycle records are audit evidence for consent, activation, pause, resume, revocation, termination, and expiration. The schema currently validates timestamp shape and some required fields, but it can still accept records whose `updatedAt`, `expiresAt`, or lifecycle timestamps are out of chronological order.

## What Changes

- Reject authorization records whose `updatedAt` is earlier than `createdAt`.
- Reject authorization records whose `expiresAt` is not after `createdAt`.
- Reject lifecycle timestamps that occur before `createdAt` or after `updatedAt`.
- Preserve current state machine transitions, permission checks, and terminal-state preservation.
- Add focused schema tests for out-of-order authorization timestamps.
- Document that lifecycle timestamp ordering is part of authorization audit integrity.
- Safety impact: this touches authorization record validation and audit integrity only. It does not add capture, input, clipboard, file transfer, installer, startup, service, credential access, token disclosure, privilege elevation, or hidden access.

## Capabilities

### New Capabilities

### Modified Capabilities
- `session-authorization`: Authorization records reject out-of-order lifecycle timestamps before action authorization.

## Impact

- `packages/protocol`: authorization schema validation and tests.
- `docs`: security model clarification for timestamp ordering.
- OpenSpec: modified schema-level authorization record invariants.
