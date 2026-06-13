## Why

Viewer-side local leave is currently exercised through the generic runtime `stop()` path and scheduled CLI helpers. Future viewer UI wiring benefits from an explicit managed viewer leave control that documents and enforces the safety boundary for local-only exit.

## What Changes

- Add a managed runtime `leave()` operation for viewer runtimes.
- Make viewer scheduled local disconnect and viewer control prompt disconnect use the viewer leave operation.
- Keep `leave()` viewer-only and available without requested permissions or active authorization.
- Ensure viewer status after local leave reports inactive local state with no action-capable permissions.
- Ensure viewer leave closes only the local viewer relay connection and does not construct or send `peer-disconnected`, lifecycle, signal, control, or workflow audit messages.
- Non-goals: no protocol schema changes, relay changes, screen capture, input injection, clipboard/file transfer, diagnostics collection, reconnect, host lifecycle controls, installer/startup/service work, token handling changes, or privilege elevation.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: Adds explicit managed viewer local leave behavior and fail-closed status after leave.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`, viewer disconnect/control helpers, focused tests.
- Affected docs: README and architecture/security documentation for the development agent shell.
- Affected safety surface: viewer local lifecycle API only.
- Not touched: protocol schemas, relay behavior, capture, input, auth, installer, startup, services, tokens, logs, or privilege elevation.
