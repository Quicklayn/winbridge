## Why

Protocol `audit-event` messages use the shared audit detail redactor, so expanded authentication-key redaction applies on parse and encode. The protocol-specific tests and spec wording still focus on the older key set, leaving the wire-message boundary weakly documented.

## What Changes

- Add focused protocol tests proving `audit-event` parse and encode redact expanded authentication/session secret keys.
- Update the audit-foundation spec wording for protocol `audit-event` detail redaction to include the expanded key set.
- Keep safe lifecycle identifiers such as `authorizationId` visible in `audit-event` details.
- Non-goals: no schema shape changes, no new protocol message types, no relay routing changes, no authorization changes, no capture, input, clipboard, file transfer, installer, services, startup persistence, privilege elevation, or Windows prompt behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `audit-foundation`: protocol `audit-event` detail redaction explicitly covers expanded authentication/session secret keys.

## Impact

- Affected code: protocol tests for `audit-event` parsing/encoding.
- Affected specs/docs: audit-foundation requirement wording.
- Affected API: no runtime behavior or schema interface changes expected; this codifies existing shared redaction behavior.
- Safety impact: strengthens verification of audit/log secret handling only; does not add or expand remote assistance capability.
- Review gate: security review required because this touches protocol audit/log redaction behavior.
