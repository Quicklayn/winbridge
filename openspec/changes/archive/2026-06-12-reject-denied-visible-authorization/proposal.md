## Why

`denied` authorization is a fail-closed outcome from a pending request, so it
must not report host visible active-session state. The current record and
protocol schemas can parse `denied` with `visibleToHost: true`, which is
ambiguous for future adapters even though permissions are empty.

## What Changes

- Reject denied authorization records with `visibleToHost: true`.
- Reject denied `session-authorization-state` protocol messages with
  `visibleToHost: true`.
- Preserve terminal visible history for revoked, terminated, and expired states,
  which can occur after an active visible session.
- Add focused authorization and protocol tests.
- Update session authorization specs and security docs.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `session-authorization`: denied records must not report host visible
  active-session state.
- `session-authorization-protocol`: denied state updates must not report host
  visible active-session state.

## Impact

- Affected code: `packages/protocol/src/authorization.ts`,
  `packages/protocol/src/authorization.test.ts`,
  `packages/protocol/src/messages.ts`,
  `packages/protocol/src/messages.test.ts`.
- Affected docs/specs: `openspec/specs/session-authorization/spec.md`,
  `openspec/specs/session-authorization-protocol/spec.md`,
  `docs/security-model.md`.
- Touches authorization/protocol validation only. It does not add screen capture,
  input, clipboard, file transfer, installer, startup, service, persistence, or
  privilege behavior.
