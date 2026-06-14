## Why

Shared audit records currently reject or redact many secret-bearing action, reason, detail, and participant device-id values, but direct callers can still place token-, credential-, cookie-, key-, or authorization-shaped metadata in fixed audit identifiers such as `eventId`, `actor.id`, `sessionId`, or `target.id`. Those fixed fields are persisted or emitted as audit evidence, so they should fail closed before storage or output.

## What Changes

- Reject secret-bearing fixed audit identifier fields: `eventId`, `actor.id`, `sessionId`, and `target.id`.
- Preserve valid non-secret audit identifiers and existing audit detail redaction behavior.
- Keep relay-specific redaction/bounding behavior separate; this change hardens the shared audit factory for direct callers.
- Add tests proving rejection diagnostics do not echo raw identifier values.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `audit-foundation`: Tighten audit schema validation for fixed audit identifier fields before local storage, local emission, console output, file persistence, protocol encoding, forwarding, or development component storage.

## Impact

- Affected code: `packages/protocol/src/audit.ts`, `packages/protocol/src/audit.test.ts`.
- Affected APIs: Shared audit record validation rejects additional malformed fixed identifier inputs.
- Safety impact: Reduces risk of storing raw token, credential, cookie, key, or authorization marker metadata in immutable audit evidence. This does not grant permissions or add remote access behavior.
- Non-goals: No capture, input, clipboard, file transfer, diagnostics, relay routing, installer, startup, service, persistence, token transport, credential collection, privilege elevation, hidden sessions, or Windows prompt behavior changes.
