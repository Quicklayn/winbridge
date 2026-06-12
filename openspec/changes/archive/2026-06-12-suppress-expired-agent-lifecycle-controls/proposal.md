## Why

The development agent shell already suppresses delayed pause and resume controls when an authorization has expired, but delayed revoke and terminate simulations can still emit lifecycle messages if their timers fire after the authorization TTL. The shell should mirror the shared authorization state machine and never send live-session revoke or terminate controls after expiration.

## What Changes

- Suppress delayed permission revocation when the authorization has reached `expiresAt`.
- Suppress delayed session termination when the authorization has reached `expiresAt`.
- Add integration tests proving expired authorizations emit expiration state/audit but no later revoke, terminate, revoked state, terminated state, or matching audit events.
- Update docs/spec language for the agent-shell workflow.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: delayed host workflow simulations for revocation and termination must fail closed when authorization expiration wins the timer race.

## Impact

- Affected area: non-native development agent shell workflow in `apps/agent-shell`.
- API surface: no new CLI flags or exported protocol contracts.
- Dependencies: none.
- Safety impact: prevents development workflow messages from implying live host control after the authorization TTL has already closed the session.
- Non-goals: no relay state tracking, production auth design, capture, input, native Windows APIs, installer, startup, service, token, credential, privilege elevation, stealth, persistence, keylogging, evasion, reconnect policy, or Windows prompt behavior changes.
