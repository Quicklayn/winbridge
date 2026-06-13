## Why

The current documentation can be read as saying that managed local viewer leave preserves optional authorization id/status metadata, while the implemented and safer behavior clears connection-scoped viewer state. This should be explicit before future viewer UI work depends on the status snapshot contract.

## What Changes

- Clarify that trusted remote host disconnect may preserve optional authorization id/status metadata for local diagnostics.
- Clarify that managed local viewer leave clears connection-scoped viewer authorization metadata and reports only inactive local state, `visibleToHost=false`, and `permissionCount=0`.
- Update documentation and focused tests so local viewer leave cannot be confused with remote host disconnect.
- Non-goals: no runtime behavior changes, protocol schema changes, relay changes, screen capture, input injection, clipboard/file transfer, diagnostics collection, reconnect, host lifecycle control changes, installer/startup/service work, token handling changes, log/audit persistence changes, or privilege elevation.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: Clarifies the viewer status metadata contract after managed local viewer leave.

## Impact

- Affected specs: `openspec/specs/agent-shell-consent-workflow/spec.md`.
- Affected docs: README and architecture/security documentation for viewer status and local viewer leave.
- Affected tests: focused runtime integration assertions for local viewer leave status metadata.
- Affected safety surface: viewer local status metadata only.
- Not touched: protocol schemas, relay behavior, native Windows APIs, capture, input, auth, installer, startup, services, tokens, logs, or privilege elevation.
