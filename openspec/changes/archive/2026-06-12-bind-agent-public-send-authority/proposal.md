## Why

The agent shell public `send()` path now binds outbound envelopes to the local session and binds `signal` routing, but other non-workflow messages can still be written with spoofed local identity or relay-owned lifecycle types before the development relay rejects them. A caller can emit local `sent` events for `join-session`, `relay-ready`, `peer-disconnected`, spoofed `hello`, or viewer-originated request messages that do not match the local runtime peer and role.

## What Changes

- Reject public runtime `send()` calls for join-only and relay-originated messages: `join-session`, `relay-ready`, and `peer-disconnected`.
- Bind public `hello` sends to the local runtime peer id and role.
- Bind public legacy `host-consent-required` and `session-authorization-request` sends to the local viewer peer and viewer role.
- Keep blocked-send diagnostics generic and secret-safe, with no raw protocol payload, session id, peer id, role, display name, permissions, signal payload, token, pairing code, or private metadata exposure.
- Update `agent-shell-consent-workflow` with a public-send identity and lifecycle authority requirement.
- Non-goals: do not implement screen capture, remote input, clipboard sync, file transfer, WebRTC media, native Windows UI, services, startup persistence, credential access, stealth behavior, or production authentication.

## Capabilities

### New Capabilities

### Modified Capabilities

- `agent-shell-consent-workflow`: add local identity/role and lifecycle authority binding for public runtime `send()` calls before socket writes and `sent` events.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts` and focused runtime integration tests.
- Affected docs/specs: `agent-shell-consent-workflow`.
- Security impact: touches local send-path authorization and diagnostics; requires security review.
- External API impact: low-level `AgentShellRuntime.send()` rejects spoofed or relay-owned envelopes that the relay would reject later.
- Dependencies: no new runtime dependencies.
