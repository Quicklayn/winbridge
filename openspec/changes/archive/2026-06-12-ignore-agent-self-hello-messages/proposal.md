## Why

The agent shell treats inbound `hello` as peer presence and can respond by sending its own `hello`. A malformed or relay-like endpoint should not be able to trigger presence workflow by sending a same-session `hello` that identifies the local runtime peer.

## What Changes

- Ignore inbound `hello` messages when the message `peerId` equals the local runtime peer id.
- Perform this check before emitting local `received` protocol events or sending a local `hello` because of that message.
- Report ignored input only through redacted summary metadata such as byte length.
- Non-goals: no protocol schema, relay forwarding, production identity, screen capture, input injection, clipboard, file transfer, unattended access, installer, service, startup, privilege, or native Windows behavior changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: Add a local inbound self-hello boundary before peer presence workflow handling.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`.
- Affected tests: `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected docs/specs: agent-shell consent workflow documentation and security model.
- Security areas touched: peer presence metadata, local runtime events, and logs. No capture, input, auth grant, relay, installer, startup, services, tokens, or privilege elevation changes.
