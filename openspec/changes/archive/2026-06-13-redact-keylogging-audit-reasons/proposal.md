## Why

Top-level audit `reason` metadata is already redacted when it contains common
remote-content and authentication markers, but obvious keylogging markers such
as `keylog` and `keylogger` are not covered at that level. Audit records should
never persist raw keylogging-shaped text, even in development failure reasons.

## What Changes

- Extend shared audit reason redaction so top-level reasons containing
  keylogging-related markers are replaced with `[REDACTED]`.
- Add protocol and audit-log focused tests proving raw keylogging reason text is
  not returned, emitted, or persisted.
- Update security documentation to describe keylogging reason redaction.
- Safety impact: this touches logs only. It does not add screen capture, input,
  clipboard, file-transfer, diagnostics, persistence, service, installer,
  privilege, evasion, or Windows prompt-bypass behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `audit-foundation`: Top-level audit reason redaction includes
  keylogging-related markers.
- `audit-log-persistence`: Persisted file audit records redact top-level
  keylogging-related reason text.

## Impact

- Affected code: `packages/protocol/src/audit.ts`,
  `packages/protocol/src/audit.test.ts`,
  `packages/audit-log/src/index.test.ts`, and docs.
- No API shape changes, dependency changes, storage migrations, relay behavior
  changes, or native Windows behavior changes.
