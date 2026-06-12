## Why

The agent shell ignores inbound cross-session protocol envelopes before local `received` events, but its public `send()` method does not currently bind outbound envelopes to the runtime's configured session. A caller can ask the runtime to write a different-session message and receive a local `sent` event before the development relay rejects it. The managed runtime should fail closed locally so event consumers never treat cross-session output as accepted remote-assistance traffic.

## What Changes

- Reject public managed runtime `send()` calls whose protocol `sessionId` differs from the local runtime session.
- Run the check before workflow-authority, signal routing, authorization checks, socket write, and local `sent` event emission.
- Keep blocked-send diagnostics generic and secret-safe, with no raw protocol payload, session id, signal payload, token, pairing code, or private metadata exposure.
- Update `agent-shell-consent-workflow` with an outbound public-send session binding requirement.
- Non-goals: do not implement screen capture, remote input, clipboard sync, file transfer, WebRTC media, native Windows UI, services, startup persistence, credential access, stealth behavior, or production authentication.

## Capabilities

### New Capabilities

### Modified Capabilities

- `agent-shell-consent-workflow`: add local session binding for public runtime `send()` calls before socket writes and `sent` events.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts` and focused runtime integration tests.
- Affected docs/specs: `agent-shell-consent-workflow`.
- Security impact: touches local send-path authorization and diagnostics; requires security review.
- External API impact: low-level `AgentShellRuntime.send()` rejects cross-session envelopes that the relay would reject later.
- Dependencies: no new runtime dependencies.
