## Why

Runtime error reporting already sanitizes direct host control failures, but the primary diagnostic event callback can still throw while that sanitized error is being reported. That callback failure must remain best-effort observability and must not replace fail-closed direct host control errors or weaken consent, visibility, authorization, audit, or signal boundaries.

## What Changes

- Treat diagnostic event callback failures in the primary sanitized runtime error reporting path as contained best-effort diagnostics.
- Add regression coverage for a direct host lifecycle control whose audit persistence fails while the diagnostic event callback also throws.
- Preserve the current fail-closed behavior: no failed lifecycle protocol messages, authorization state changes, permission revocations, signal messages, or workflow audit events are sent when required audit persistence fails.
- Non-goals: no capture, input, clipboard, file transfer, installer, startup persistence, service, privilege elevation, hidden session, security prompt bypass, credential access, keylogging, AV/EDR evasion, relay behavior, or native Windows API changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: Runtime error diagnostic event callbacks become explicitly best-effort in the same sanitized fail-closed reporting path as runtime diagnostic loggers.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`.
- Affected tests: `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected specs: `openspec/specs/agent-shell-consent-workflow/spec.md` through a delta spec for this change.
- Security areas touched: auth/audit diagnostics and local runtime logs/events only.
- No dependency, protocol schema, relay, installer, startup, service, token format, privilege, capture, input, or native Windows API changes.
