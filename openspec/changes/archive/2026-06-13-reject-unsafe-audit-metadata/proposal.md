## Why

Audit records and protocol `audit-event` messages reject blank, oversized, and untrimmed semantic metadata today, but still allow ASCII control characters and Unicode bidi or zero-width formatting controls. Audit metadata is used for security review and incident reconstruction, so visually ambiguous action, reason, or target type values should be rejected before records are emitted, forwarded, or persisted.

## What Changes

- Reject ASCII control characters in audit record action, top-level reason, and target type metadata.
- Reject Unicode bidirectional and zero-width formatting controls, including `U+FEFF`, in those audit metadata fields.
- Apply the same checks to protocol `audit-event.action` before parse, encode, relay forwarding, or persistence.
- Add focused protocol and relay regression tests plus docs/spec updates.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `audit-foundation`: Audit semantic metadata rejects unsafe control and formatting characters before storage, emission, or protocol use.
- `relay-runtime`: Malformed protocol `audit-event` action metadata is rejected before forwarding without leaking raw payload text.

## Impact

- Affected code: `packages/protocol/src/audit.ts`, `packages/protocol/src/messages.ts`.
- Affected tests: `packages/protocol/src/audit.test.ts`, `packages/protocol/src/messages.test.ts`, `apps/relay/src/server.integration.test.ts`.
- Affected docs/specs: audit foundation, relay runtime, README/security model where relevant.
- Security surface: audit/log metadata and protocol audit-event validation.
- Non-goals: no capture, input, clipboard, file transfer, installer, startup, service, privilege elevation, persistence, reconnect, or production auth changes.
