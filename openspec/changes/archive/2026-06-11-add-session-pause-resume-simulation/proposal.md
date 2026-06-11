## Why

WinBridge safety rules require the host to be able to pause a session immediately, but the current authorization state machine only models active, revoked, terminated, and expired terminal paths. Before any screen transport or remote input exists, the protocol and agent shell need a testable pause/resume lifecycle that future Windows adapters can enforce fail-closed.

## What Changes

- Add a `paused` authorization status to the shared session authorization contract.
- Add protocol and authorization-state expectations for host-driven pause and resume events.
- Extend the development agent shell with explicit host pause/resume timers that only run after explicit approval and visible active state.
- Emit secret-safe development audit events for pause and resume simulation.
- Ensure paused grants do not authorize sensitive actions until the host resumes the visible session.
- Keep terminal states (`revoked`, `terminated`, `expired`) final for scheduled pause/resume work.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-authorization`: Adds paused authorization semantics and fail-closed action checks.
- `session-authorization-protocol`: Adds requirements for pause/resume protocol state updates.
- `agent-shell-consent-workflow`: Adds development host pause/resume simulation and audit events.

## Impact

- Affected code: `packages/protocol`, `apps/agent-shell`, docs, and focused tests.
- API impact: shared protocol schemas will accept `paused` as a session authorization status; authorization helpers will expose pause/resume transitions.
- Safety impact: strengthens host control by modeling immediate pause before native capture/input exists.
- Touches auth and logs/audit protocol usage; requires security review.
- Non-goals: screen capture, input injection, clipboard sync, file transfer, installer behavior, startup behavior, service registration, credential access, privilege elevation, persistence, hidden access, or bypassing Windows security prompts.
