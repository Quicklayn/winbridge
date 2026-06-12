## Why

Audit redaction already covers tokens, credentials, pairing codes, keylogging, and screen data, but clipboard, file-transfer, and diagnostics content keys are not explicitly covered. These are sensitive remote-assistance actions, so audit detail redaction should fail closed when callers accidentally pass obvious content-bearing fields.

## What Changes

- Expand shared audit detail redaction to redact clipboard, file-transfer content/data/bytes, and diagnostics content/dump keys recursively.
- Expand top-level audit reason redaction for obvious clipboard, file-transfer, and diagnostics content markers that include secret-bearing values.
- Apply the same expanded redaction through protocol `audit-event` detail parsing/encoding and development file audit persistence.
- Preserve non-secret lifecycle identifiers such as `authorizationId`.
- Update security and architecture documentation to name the expanded audit redaction boundary.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `audit-foundation`: Expand audit detail and protocol `audit-event` redaction requirements for clipboard, file-transfer, and diagnostics content keys.
- `audit-log-persistence`: Expand file sink redaction coverage for the same remote-assistance content keys.

## Impact

- Affected code: shared protocol audit redaction and focused audit tests.
- Affected docs/specs: OpenSpec audit specs, security model, and architecture docs.
- Safety impact: this tightens log hygiene for sensitive remote-assistance content. It does not add capture, input, clipboard sync, file transfer, diagnostics export, installer, startup, service, token storage, or privilege elevation behavior.
