## Why

The viewer signal send gate currently depends on the latest observed authorization lifecycle state. To keep the development shell fail-closed against unbound or out-of-order lifecycle input, the viewer should only use host authority messages that can be tied back to a host decision for the local viewer.

## What Changes

- Bind viewer-side authorization snapshots to the `hostPeerId` from a `session-authorization-decision` addressed to the local viewer.
- Ignore viewer-side `session-authorization-state`, `permission-revoked`, and `session-control` messages before local `received` event emission when they cannot be tied to that bound host authority.
- Keep ignored-message diagnostics redacted to metadata-only summaries.
- Add integration coverage proving unbound lifecycle state does not unlock viewer-originated `signal` sends.
- Safety non-goals: no screen capture, input injection, clipboard, file transfer, installer, startup persistence, service behavior, privilege elevation, hidden sessions, or Windows security prompt bypass.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: viewer-side authorization lifecycle handling must bind host authority before using lifecycle state to authorize signal sends.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`.
- Affected tests: `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected docs/specs: `openspec/specs/agent-shell-consent-workflow/spec.md`, architecture/security documentation if needed.
- Touches auth and logs; does not touch relay, protocol schema, capture, input, installer, startup, services, tokens, or privilege elevation.
