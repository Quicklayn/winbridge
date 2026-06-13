## Why

Shared protocol `reason` fields are validated for blank, oversized, and untrimmed text, but still accept ASCII control characters and Unicode bidi or zero-width formatting controls. These fields cross relay and agent boundaries before being redacted, so malformed invisible or directional text should be rejected at the protocol envelope boundary.

## What Changes

- Reject authorization-related protocol `reason` values containing ASCII control characters.
- Reject authorization-related protocol `reason` values containing Unicode bidirectional or zero-width formatting controls, including `U+FEFF`.
- Verify relay handling remains fail-closed and secret-safe when malformed protocol reasons are received.
- Update docs that describe protocol and agent workflow reason constraints.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-authorization-protocol`: Canonical protocol reason validation rejects control and formatting-control characters before messages can be forwarded or processed.
- `relay-runtime`: Existing invalid-message rejection behavior covers malformed protocol reasons without forwarding raw private reason text.

## Impact

- Affected code: `packages/protocol/src/messages.ts`.
- Affected tests: `packages/protocol/src/messages.test.ts`, `apps/relay/src/server.integration.test.ts`.
- Affected docs/specs: protocol and relay specs plus README/security-model reason text.
- Security surface: touches authorization protocol validation, relay message rejection, and log/audit-adjacent reason metadata.
- Non-goals: no capture, input, clipboard, file transfer, installer, startup, service, persistence, privilege elevation, reconnect, or production authentication changes.
