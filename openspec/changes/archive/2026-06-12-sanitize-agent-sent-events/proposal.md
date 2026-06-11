## Why

The protocol encoder normalizes and redacts `audit-event.detail`, but the agent shell emits local `sent` runtime events with the original message object after sending. Direct runtime callers can pass an audit event containing sensitive detail keys; the wire payload is redacted, but the local event callback can still see the unredacted object.

## What Changes

- Emit `sent` runtime events with a schema-normalized event-safe protocol view rather than the caller's original object.
- Redact raw pairing codes from local sent `join-session` events while preserving the validated wire payload needed by the relay.
- Preserve the existing wire validation/redaction behavior.
- Add regression coverage proving local sent events do not expose raw sensitive audit detail.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: sent runtime events must be secret-safe and reflect the validated/redacted protocol envelope.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`.
- Affected tests: agent-shell runtime integration tests.
- Affected docs/specs: agent-shell consent workflow, security model, and architecture docs.
- Safety impact: prevents local development event callbacks from observing raw tokens, credentials, pairing codes, screenshots, screen contents, or other sensitive details.
- Touches: logging/event surface, audit detail, and token/secret handling. Does not touch capture, input, installer, startup, services, persistence, privilege elevation, or Windows APIs.
- Non-goals: no new remote assistance capability, no credential collection, no hidden sessions, and no production audit backend.
