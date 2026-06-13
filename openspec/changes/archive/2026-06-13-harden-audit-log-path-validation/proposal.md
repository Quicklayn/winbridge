## Why

Development audit files are a safety-critical evidence trail, but configured audit log paths currently only reject blank or untrimmed values. Adding bounded path validation closes avoidable control-character and oversized-input cases before relay or agent-shell audit persistence starts.

## What Changes

- Require file audit paths to be non-blank, already trimmed, 1024 UTF-8 bytes or less, and free of ASCII control characters.
- Apply the same path validation to the shared `FileAuditSink`, relay `WINBRIDGE_RELAY_AUDIT_LOG_PATH`, agent-shell `WINBRIDGE_AGENT_AUDIT_LOG_PATH`, and agent-shell `--audit-log`.
- Keep rejection diagnostics secret-safe: raw path values are not included in usage or configuration errors.
- Non-goals: no remote capture/input, no production identity system, no installer/service/startup behavior, and no hidden audit persistence.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `audit-log-persistence`: Strengthen file audit path validation for shared, relay, and agent-shell audit persistence.
- `agent-shell-consent-workflow`: Strengthen agent-shell CLI audit log path validation before runtime startup.

## Impact

- Affected areas: `packages/audit-log`, `apps/relay`, `apps/agent-shell`, tests, README, security model, architecture docs, and OpenSpec specs.
- Touches logs/audit persistence and startup validation. It does not touch capture, input, auth token semantics, relay message forwarding, installer behavior, services, startup persistence, privilege elevation, or Windows security prompts.
