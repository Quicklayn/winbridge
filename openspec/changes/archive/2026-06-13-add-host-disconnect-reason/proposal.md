## Why

Host local disconnect simulation currently uses a fixed close reason string. Development operators need a bounded, explicit reason knob for local disconnect drills while preserving secret-safe diagnostics and the rule that disconnect reasons are not audit detail or protocol authority.

## What Changes

- Add a host-only `--disconnect-reason` CLI option for host local disconnect simulation.
- Add a direct runtime `hostDisconnectReason` option that reuses canonical workflow reason validation plus the WebSocket close-frame reason byte bound.
- Use the validated reason only as the local WebSocket close reason for host disconnect simulation and direct host disconnect control.
- Keep local disconnect audit records secret-safe: persist bounded lifecycle metadata, not raw disconnect reason text.
- Update docs and focused tests for parsing, runtime validation, close diagnostics, and redaction.
- No protocol schema, relay behavior, remote action authorization, capture, input, clipboard, file transfer, diagnostics, installer, startup, service, token handling, privilege elevation, or reconnect behavior changes are included.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: host local disconnect simulation accepts a bounded local disconnect reason while preserving fail-closed, visibility, and audit redaction boundaries.

## Impact

- Affected code: `apps/agent-shell/src/args.ts`, `apps/agent-shell/src/runtime.ts`, and focused agent-shell tests.
- Affected docs: README and security/architecture notes for development host disconnect simulation.
- Runtime/API impact: adds optional `hostDisconnectReason` to managed runtime options.
- Safety impact: touches local host disconnect/audit logs only. The option must not create peer-originated disconnect notices, grant permissions, start signaling, expose raw reason text in audit records/events/logs, or bypass consent and visible authorization gates.
