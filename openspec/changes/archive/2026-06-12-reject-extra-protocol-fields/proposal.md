## Why

Protocol and audit schemas currently rely on Zod object defaults, which can silently strip unknown fixed-shape fields instead of failing closed. At remote-assistance boundaries, malformed or smuggled top-level fields should be rejected so peers, relay, and audit sinks never normalize ambiguous input into trusted records.

## What Changes

- Reject unknown fixed-shape fields in protocol envelopes, nested fixed protocol records, session grants, device identity records, pairing records, session authorization records, audit records, audit actors, and audit targets.
- Preserve intentional JSON metadata containers such as `signal.payload`, protocol `audit-event.detail`, and audit record `detail` as open JSON-compatible objects with existing sensitive-field validation and redaction.
- Add protocol, audit, identity, authorization, grant, relay integration, and agent-shell integration regression tests proving extra fixed fields fail closed and payload/detail metadata remains accepted.
- **BREAKING** for malformed inputs that previously parsed after unknown fixed-shape fields were stripped; valid messages and records are unchanged.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `protocol-identifiers`: require fixed-shape protocol-facing objects to reject unknown fields before relay, authorization, pairing, or audit use.
- `session-authorization-protocol`: require protocol envelopes and authorization protocol messages to fail closed on unknown fixed top-level fields.
- `audit-foundation`: require audit records and protocol audit-event envelopes to reject unknown fixed fields while preserving redacted audit details.
- `identity-pairing`: require device identity, pairing ticket, and paired-device records to reject unknown fixed fields.
- `session-authorization`: require session authorization and consent-bound grant records to reject unknown fixed fields before remote action checks.
- `relay-runtime`: require the relay to reject inbound protocol messages with unknown fixed fields before registration or forwarding.
- `agent-shell-consent-workflow`: require agent-shell inbound and public-send protocol validation to reject unknown fixed fields before trusted runtime events or socket writes.

## Impact

- Affected code: `packages/protocol/src/messages.ts`, `packages/protocol/src/audit.ts`, `packages/protocol/src/identity.ts`, `packages/protocol/src/authorization.ts`, `packages/protocol/src/session.ts`.
- Affected tests: protocol unit tests, relay integration tests, and agent-shell integration tests for malformed message rejection.
- Safety impact: strengthens fail-closed schema boundaries and reduces ambiguity at relay/auth/audit boundaries.
- Touches relay input handling, agent-shell protocol receive/send behavior, auth-related protocol records, pairing records, and logs/audit schemas; requires focused security review.
- Does not touch screen capture, input execution, keylogging, clipboard/file/diagnostics collection, installer behavior, startup behavior, services, persistence, privilege elevation, native Windows APIs, token validation semantics, pairing secret hashing, or authorization grant rules.
