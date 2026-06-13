## Why

Viewer status snapshots currently describe authorization lifecycle state, but a future viewer UI also needs to stop presenting an active session after the host disconnects. A trusted relay-originated host disconnect notice should make the local viewer status inactive without changing protocol authority or emitting new messages.

## What Changes

- Update viewer status snapshots so a viewer that has recorded trusted remote host disconnect state reports inactive local status.
- Preserve bounded authorization metadata when available, but clear host visibility and action-capable permission count after disconnect.
- Add integration coverage for active viewer authorization followed by host local disconnect.
- Document that viewer status is inactive after trusted host disconnect.
- No new protocol messages, remote actions, audit workflow events, host controls, relay behavior, authentication, token handling, installer/startup/service behavior, or privilege elevation changes are included.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: viewer status snapshots reflect trusted remote host disconnect state as inactive local status.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts` and focused runtime integration tests.
- Affected docs: README and security/architecture notes for viewer status.
- Runtime/API impact: the existing `getViewerStatus()` API changes local presentation after trusted host disconnect. It remains read-only and sends no protocol messages.
- Safety impact: this is fail-closed viewer UI metadata. It must not grant permissions, start signaling, hide host visibility, reconnect peers, emit audit events, or bypass consent.
