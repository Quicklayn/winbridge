## Why

The managed agent shell already delays internally generated `hello` and viewer authorization requests until the relay reports a paired two-peer room or a peer `hello` is observed. The public `send()` method still accepts same-session, same-identity peer messages before that recipient evidence exists, which can emit local `sent` events and write to the socket before the relay rejects the message for having no recipient.

## What Changes

- Track whether the runtime has observed a recipient peer through paired `relay-ready` or inbound peer `hello`.
- Reject public runtime `send()` calls for peer-directed messages before socket write and before local `sent` event emission until a recipient peer has been observed.
- Clear recipient availability after a trusted `peer-disconnected` notice and keep the existing disconnected-peer send failure.
- Keep blocked-send diagnostics generic and secret-safe, with no raw protocol payload, session id, peer id, display name, permissions, signal payload, token, pairing code, private reason, keystrokes, screenshots, screen contents, or input contents.
- Update `agent-shell-consent-workflow` with a public-send recipient boundary requirement.
- Non-goals: do not implement screen capture, remote input, clipboard sync, file transfer, WebRTC media, native Windows UI, services, startup persistence, credential access, stealth behavior, or production authentication.

## Capabilities

### New Capabilities

### Modified Capabilities

- `agent-shell-consent-workflow`: add local recipient-observed binding for public runtime `send()` calls before socket writes and `sent` events.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts` and focused runtime integration tests.
- Affected docs/specs: `agent-shell-consent-workflow`.
- Security impact: touches local send-path authorization and diagnostics; requires security review.
- External API impact: low-level `AgentShellRuntime.send()` rejects same-session peer messages until the runtime has observed a recipient peer.
- Dependencies: no new runtime dependencies.
