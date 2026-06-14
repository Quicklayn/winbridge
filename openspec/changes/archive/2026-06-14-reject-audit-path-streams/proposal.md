## Why

Windows alternate data streams can make a configured audit path write JSONL records into a hidden stream such as `audit.jsonl:hidden` instead of the ordinary file body. Development audit logs are a safety and accountability surface, so configured audit paths must resolve to ordinary, reviewable files before any relay or agent workflow starts.

## What Changes

- Reject file audit paths that contain Windows alternate data stream syntax or any colon-bearing path segment after an optional drive prefix.
- Preserve support for ordinary Windows drive paths such as `C:\logs\audit.jsonl` and `D:/logs/audit.jsonl`.
- Keep rejection diagnostics sanitized so they do not echo the raw configured path.
- Update relay, agent-shell, shared audit-log tests, docs, and OpenSpec specs.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `audit-log-persistence`: configured audit file paths must reject Windows alternate data stream path segments before file sink construction, relay startup, or agent-shell runtime startup.
- `relay-runtime`: relay audit path runtime validation must include Windows reserved device and alternate data stream path segments.
- `agent-shell-consent-workflow`: agent-shell CLI/environment audit path validation must include Windows reserved device and alternate data stream path segments.

## Impact

- Touches logs/audit path validation only.
- Affected code: `packages/audit-log`, `apps/relay`, `apps/agent-shell`.
- Affected docs/specs: README, architecture/security docs, `audit-log-persistence`.
- No capture, input, installer, startup persistence, services, token handling, privilege elevation, or remote-control behavior changes.
