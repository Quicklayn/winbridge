## Why

Development audit files are consent and lifecycle evidence. Windows reserved device names such as `NUL`, `CON`, `PRN`, `AUX`, `COM1`, and `LPT1` can behave like device targets rather than ordinary files, so an audit path using one of those names can appear accepted while failing to produce a reviewable JSONL file.

## What Changes

- Reject configured audit log paths whose final or nested path segment resolves to a Windows reserved device name.
- Apply the same validation to shared file audit sinks, relay audit environment configuration, and agent-shell audit CLI or environment configuration because they share the audit log path validator.
- Add focused audit-log tests for reserved device paths and safe lookalike names.
- No capture, input, authorization grant, relay routing, installer, startup, service, token, or privilege behavior changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `audit-log-persistence`: Audit log path validation rejects Windows reserved device path segments before writing audit records or falling back to non-file audit behavior.

## Impact

- Affected code: `packages/audit-log/src/index.ts` and `packages/audit-log/src/index.test.ts`.
- Affected systems: local development JSONL audit persistence used by relay and agent-shell configuration.
- Safety impact: prevents accidental or misleading audit sinks that do not create reviewable consent/audit evidence.
- Touch areas: logs/audit path validation. Security review is required before completion.
