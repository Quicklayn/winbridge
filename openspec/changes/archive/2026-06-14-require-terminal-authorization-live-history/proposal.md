## Why

Parsed terminal authorization records can currently describe post-activation outcomes such as `revoked`, `terminated`, or visible `expired` sessions without carrying the prior approval and activation timestamps that prove the session first passed through explicit consent and visible host activation. Post-activation terminal records should preserve auditable consent-first history before any remote action check or adapter treats them as trusted lifecycle evidence.

## What Changes

- Require parsed `revoked`, `terminated`, and visible post-activation `expired` authorization records to carry prior `approvedAt` and `activatedAt` timestamps.
- Preserve pre-access `expired` records without activation history, such as pending or approved requests that timed out before visible activation.
- Preserve valid terminal records created by the state machine from visible active or paused sessions.
- Add focused protocol authorization schema tests for terminal records missing approval or activation history.
- No capture, input, relay routing, installer, startup, service, token, log persistence, or privilege behavior changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-authorization`: Schema-level authorization record invariants will reject post-activation terminal records that lack auditable live-session history.

## Impact

- Affected code: `packages/protocol/src/authorization.ts` and `packages/protocol/src/authorization.test.ts`.
- Affected systems: protocol authorization parsing used before local action authorization and by future adapters that consume authorization records.
- Safety impact: post-activation terminal records cannot imply lifecycle completion unless they preserve explicit approval and visible activation history.
- Touch areas: auth/protocol validation. Security review is required before completion.
