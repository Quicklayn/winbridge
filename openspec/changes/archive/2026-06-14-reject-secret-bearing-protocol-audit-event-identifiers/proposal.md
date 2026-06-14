## Why

Protocol `audit-event` envelopes still validate their fixed identifiers through the generic protocol identifier schemas. That allows secret-bearing marker text to appear in audit-event `messageId`, `sessionId`, `eventId`, or `actorPeerId` before the message is rejected, forwarded, encoded, or stored by development components.

## What Changes

- Add protocol-level validation for fixed `audit-event` identifiers.
- Reject secret-bearing protocol identifier metadata in `messageId`, `sessionId`, `eventId`, and `actorPeerId` during parsing and encoding.
- Keep schema-valid non-secret identifiers accepted.
- Keep existing audit-event detail redaction and action validation behavior unchanged.
- Ensure rejection diagnostics are bounded and do not expose the raw rejected identifier.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `audit-foundation`: Extend audit-event protocol requirements to reject secret-bearing fixed identifiers before parse, encode, forwarding, emission, or persistence.

## Impact

- Affected code: `packages/protocol/src/messages.ts` and protocol tests.
- Affected behavior: protocol validation for `audit-event` envelopes only.
- Security impact: reduces accidental secret metadata exposure in audit-event fixed fields.
- Touches logs/protocol metadata validation; does not touch capture, input, authentication approval, relay routing, installer behavior, startup behavior, services, tokens at rest, or privilege elevation.
- Non-goals: no new remote access capability, no unattended access, no native Windows capture/input, no authorization bypass, no persistence, and no hidden session behavior.
