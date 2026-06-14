## Why

The managed agent shell now returns immutable host and viewer status snapshots, but public documentation still describes these surfaces mostly as read-only. Updating documentation keeps future UI/native integration guidance aligned with the runtime and OpenSpec contract before callers depend on mutable status objects.

## What Changes

- Document host status snapshots as immutable local metadata snapshots in README user-facing CLI guidance.
- Document viewer status snapshots, including signal acknowledgement metadata, as immutable local metadata snapshots in README user-facing CLI guidance.
- Update the security model wording so future adapters treat status objects as non-authorizing immutable snapshots, not mutable workflow state.
- No runtime behavior, protocol shape, relay behavior, native Windows API, capture, input, installer, service, startup, token, log, privilege, or permission vocabulary changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: documentation must describe managed host/viewer status snapshots as immutable, bounded, non-authorizing local metadata.

## Impact

- Affected documentation:
  - `README.md`
  - `docs/security-model.md`
- Affected OpenSpec:
  - `openspec/specs/agent-shell-consent-workflow/spec.md`
- Safety impact: reduces integration ambiguity around local status metadata. This change does not add remote access, signaling, capture, input, clipboard, file transfer, diagnostics, reconnect, hidden-session, persistence, evasion, or Windows prompt-bypass capability.
