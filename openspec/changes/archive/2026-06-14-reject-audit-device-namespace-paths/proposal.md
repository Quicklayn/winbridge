## Why

Windows device namespace prefixes such as `\\.\` and `\\?\` can route file operations outside ordinary Win32 file path semantics, including device and pipe namespaces. Development audit logs are accountability evidence, so configured audit paths must point to ordinary reviewable files before relay or agent workflows start.

## What Changes

- Reject file audit paths that start with Windows device namespace prefixes such as `\\.\`, `\\?\`, `//./`, or `//?/`.
- Preserve ordinary relative paths and ordinary Windows drive paths such as `C:\logs\audit.jsonl` and `D:/logs/audit.jsonl`.
- Keep rejection diagnostics sanitized so they do not echo the raw configured path.
- Update shared audit-log, relay, agent-shell tests, docs, and OpenSpec specs.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `audit-log-persistence`: configured audit file paths must reject Windows device namespace prefixes before file sink construction, relay startup, or agent-shell runtime startup.
- `relay-runtime`: relay audit path runtime validation must include Windows device namespace prefixes.
- `agent-shell-consent-workflow`: agent-shell CLI/environment audit path validation must include Windows device namespace prefixes.

## Impact

- Touches logs/audit path validation only.
- Affected code: `packages/audit-log`, `apps/relay`, `apps/agent-shell`.
- Affected docs/specs: README, architecture/security docs, `audit-log-persistence`, `relay-runtime`, and `agent-shell-consent-workflow`.
- No capture, input, installer, startup persistence, services, token handling, privilege elevation, or remote-control behavior changes.
