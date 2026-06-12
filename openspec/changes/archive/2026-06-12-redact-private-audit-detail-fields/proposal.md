## Why

Audit detail redaction already protects tokens, pairing codes, credentials, remote content, and common authentication keys. It does not centrally protect raw user display names or raw private reason text when a future component accidentally places those values under common detail keys such as `displayName`, `viewerDisplayName`, `reason`, or `reasonText`.

Strengthening the shared audit redaction layer reduces log-leak risk for relay, agent-shell, file sinks, console sinks, and protocol `audit-event` messages without adding any remote capability.

## What Changes

- Redact raw display-name audit detail fields using common exact keys such as `displayName`, `hostDisplayName`, `viewerDisplayName`, and `deviceDisplayName`.
- Redact raw private reason audit detail fields using common exact keys such as `reason`, `reasonText`, `rawReason`, `denialReason`, `revokeReason`, `pauseReason`, `resumeReason`, and `terminationReason`.
- Preserve bounded non-secret reason metadata such as `reasonCode` and booleans such as `reasonConfigured`.
- Apply the same shared redaction behavior to protocol `audit-event` detail parsing/encoding and all shared audit sinks.
- Add tests for recursive detail redaction, persisted JSONL redaction, and protocol `audit-event` detail redaction.
- Do not add native screen capture, remote input, clipboard sync, file transfer, diagnostics export, reconnect, installer behavior, services, startup persistence, privilege elevation, hidden sessions, AV/EDR evasion, or Windows prompt bypass.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `audit-foundation`: shared audit detail redaction covers raw display-name and private reason detail keys while preserving safe reason metadata.
- `audit-log-persistence`: file audit persistence inherits the stronger shared redaction for display-name and private reason detail fields.

## Impact

- Affected code: `packages/protocol/src/audit.ts`, `packages/protocol/src/audit.test.ts`, `packages/protocol/src/messages.test.ts`, and `packages/audit-log/src/index.test.ts`.
- Affected specs/docs: `audit-foundation`, `audit-log-persistence`, and operator-facing security/architecture docs if needed.
- Security impact: touches logs/audit redaction only. It narrows persisted/emitted metadata and does not change authorization state, relay forwarding, native capture/input, installer, startup, services, tokens, or privilege behavior.
