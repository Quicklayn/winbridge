## Why

The viewer runtime now blocks outbound `signal` sends before active visible authorization, but the host runtime should also defend itself against signals from non-agent or modified viewers that bypass that local viewer gate. Host-side inbound gating keeps future native consumers from seeing transport-like messages before explicit visible host consent is active.

## What Changes

- Track the host's locally emitted authorization lifecycle state in the agent shell runtime.
- Ignore inbound `signal` messages at the host before local `received` events or received signal summary logs unless the host has an active, visible, unexpired `screen:view` authorization.
- Fail closed after host pause, revocation of `screen:view`, termination, expiration, or visible activation being withheld.
- Keep ignored inbound signal diagnostics redacted to metadata such as byte length.
- Update docs and specs to describe the host-side inbound signal authorization boundary.
- Non-goals: do not implement screen capture, remote input, clipboard sync, file transfer, WebRTC media, native Windows UI, services, startup persistence, or production authentication.

## Capabilities

### New Capabilities

### Modified Capabilities

- `agent-shell-consent-workflow`: add host-side authorization gating for inbound `signal` messages.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts` and focused runtime integration tests.
- Affected docs/specs: agent shell architecture/security docs and `agent-shell-consent-workflow`.
- Security impact: touches authorization, inbound signal handling, and redacted diagnostics; requires explicit security review.
- External API impact: host runtime no longer emits local `received` events for inbound viewer `signal` messages until the host has emitted active visible `screen:view` authorization.
- Dependencies: no new runtime dependencies.
