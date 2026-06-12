## Why

The agent shell uses `relay-ready` room metadata to decide when to send `hello` and, for viewers, a session authorization request. A malformed or relay-like endpoint that sends a same-session `relay-ready` for a different peer should not be able to trigger local workflow messages.

## What Changes

- Ignore inbound `relay-ready` messages when the message `peerId` does not match the local runtime peer id.
- Perform this check before emitting local `received` protocol events or using `roomSize` to send `hello` or viewer authorization requests.
- Report ignored input only through redacted summary metadata such as byte length.
- Non-goals: no protocol schema, relay forwarding, production identity, screen capture, input injection, clipboard, file transfer, unattended access, installer, service, startup, privilege, or native Windows behavior changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: Add a local inbound relay-ready peer boundary before presence and consent request workflow handling.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`.
- Affected tests: `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected docs/specs: agent-shell consent workflow documentation and security model.
- Security areas touched: relay lifecycle metadata, authorization request trigger, local runtime events, and logs. No capture, input, installer, startup, services, tokens, or privilege elevation changes.
