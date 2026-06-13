## Why

`hello` capability metadata is presence information used by the relay and agent shell before consent workflow handling. It is already required to be non-blank, trimmed, and unique, but it can still contain ASCII control characters or Unicode bidi/zero-width formatting controls. Visually ambiguous capability values should be rejected before they become trusted peer metadata, local events, or relay-forwarded data.

## What Changes

- Reject ASCII control characters in protocol `hello.capabilities` entries.
- Reject Unicode bidirectional and zero-width formatting controls, including `U+FEFF`, in protocol `hello.capabilities` entries.
- Ensure relay and agent-shell malformed-capability rejection remains fail-closed and secret-safe.
- Add focused protocol, relay, and agent-shell regression tests plus docs/spec updates.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-broker`: `hello` capability metadata must be bounded, trimmed, unique, and free of unsafe control/formatting characters.
- `agent-shell-consent-workflow`: inbound and public-send malformed capability metadata is rejected before trusted local events or socket writes.
- `relay-runtime`: registered malformed `hello` capability metadata is rejected before forwarding without leaking raw capability text.

## Impact

- Affected code: `packages/protocol/src/messages.ts`.
- Affected tests: `packages/protocol/src/messages.test.ts`, `apps/relay/src/server.integration.test.ts`, `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected docs/specs: session broker, agent-shell consent workflow, relay runtime, README/security model where relevant.
- Security surface: peer presence metadata, relay forwarding, agent-shell event/log safety.
- Non-goals: no capture, input, clipboard, file transfer, installer, startup, service, privilege elevation, persistence, reconnect, or production auth changes.
