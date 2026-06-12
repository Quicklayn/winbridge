## Why

The agent shell emits local received events for inbound `signal` messages with redacted payload summaries. A malformed or relay-like endpoint should not be able to surface signaling metadata unless the signal is addressed to the local peer and originates from a distinct remote peer.

## What Changes

- Ignore inbound `signal` messages when `toPeerId` does not equal the local runtime peer id.
- Ignore inbound `signal` messages when `fromPeerId` equals the local runtime peer id.
- Perform these checks before emitting local `received` protocol events or logging received signal summaries.
- Report ignored input only through redacted summary metadata such as byte length.
- Non-goals: no protocol schema, relay forwarding, WebRTC/media transport, screen capture, input injection, clipboard, file transfer, unattended access, installer, service, startup, privilege, or native Windows behavior changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: Add a local inbound signal peer boundary before received signal event handling.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`.
- Affected tests: `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected docs/specs: agent-shell consent workflow documentation and security model.
- Security areas touched: signaling metadata, local runtime events, and logs. No capture, input, auth grant, relay, installer, startup, services, tokens, or privilege elevation changes.
