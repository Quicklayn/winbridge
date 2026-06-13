## Why

Terminal authorization state updates currently may omit reason text even though denial, revocation, termination, and expiration are fail-closed lifecycle outcomes that should remain explicit and auditable. Requiring a canonical reason on those state updates removes ambiguous lifecycle metadata before peers forward or process it.

## What Changes

- Require `session-authorization-state` messages with status `denied`, `revoked`, `terminated`, or `expired` to include a validated non-blank reason.
- Preserve existing optional reason behavior for `pending`, `approved`, `active`, and `paused` state updates.
- Add protocol tests for terminal state reason acceptance and rejection.
- Non-goals: no capture, input, relay behavior, installer, startup, service, token, log storage, privilege elevation, hidden session, or persistence changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-authorization-protocol`: terminal authorization state updates must include explicit reason text.

## Impact

- Affected code: `packages/protocol/src/messages.ts`.
- Affected tests: `packages/protocol/src/messages.test.ts`.
- Affected OpenSpec: `openspec/specs/session-authorization-protocol/spec.md`.
- Safety impact: auth/protocol validation becomes stricter for fail-closed authorization lifecycle events; no grant, visibility, capture, input, relay, installer, service, token, log storage, or privilege behavior is added.
