## Why

Agent shell status APIs now return frozen immutable snapshots at runtime, and documentation describes them as immutable. The exported TypeScript status snapshot types still present writable properties, which can mislead future UI/native adapters into treating snapshots as mutable workflow state.

## What Changes

- Mark exported host and viewer status snapshot types as read-only at compile time.
- Keep the serialized status shape and runtime behavior unchanged.
- Update runtime integration tests so runtime mutation attempts remain tested through explicit mutable casts while public types stay read-only.
- Rename status lifecycle test descriptions from read-only-only wording to immutable wording.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: status snapshot API types must express immutable read-only local metadata at compile time.

## Impact

- Affected code:
  - `apps/agent-shell/src/runtime.ts`
  - `apps/agent-shell/src/runtime.integration.test.ts`
- TypeScript consumers attempting direct assignment to status snapshot fields will now receive compile-time errors. Runtime output shape, protocol messages, relay behavior, authorization lifecycle behavior, and CLI output are unchanged.
- Safety impact: strengthens the non-authorizing snapshot boundary for future UI/native integrations. This change does not add capture, input, clipboard, file transfer, diagnostics, reconnect, installer, startup, service, token, audit sink, privilege, hidden-session, or Windows prompt-bypass behavior.
