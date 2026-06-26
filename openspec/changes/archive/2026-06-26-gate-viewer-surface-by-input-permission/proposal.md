## Why

The local viewer surface currently enables visible input controls when the
viewer has any active visible grant, even if that grant is only `screen:view`.
Before MVP trials, the browser helper should make pointer and keyboard
readiness match the granted input permissions so the operator sees an accurate
control state before runtime authorization rejects a command.

## What Changes

- Add bounded sanitized viewer status metadata for pointer and keyboard input
  readiness.
- Gate browser pointer arming on active visible `input:pointer` readiness.
- Gate keyboard buttons and modifier toggles on active visible
  `input:keyboard` readiness.
- Keep manual command submission disabled unless at least one input permission
  is ready, while preserving runtime authorization as the authoritative gate.
- Keep local surface responses and visible status metadata secret-safe and free
  of authorization ids, raw permission lists, command text, key values,
  pointer coordinates, tokens, pairing codes, screen contents, and diagnostics.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: local viewer surface readiness must reflect
  granted input permission kind instead of only positive permission count.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`,
  `apps/agent-shell/src/viewer-local-control-surface.ts`,
  `apps/agent-shell/src/viewer-local-control-surface.test.ts`, and OpenSpec
  artifacts.
- Affected systems: development viewer local control surface status and local
  browser control enablement only.
- Safety impact: improves consent-visible input UX without granting access.
  Runtime `sendInputEvent()` permission, routing, audit-before-send, pause,
  revoke, expiration, disconnect, and redaction gates remain authoritative.
- Touches input and authorization status metadata. It does not change native
  Windows input execution, screen capture, relay forwarding, pairing, tokens,
  audit persistence, installer behavior, services, startup persistence,
  privilege elevation, credential access, clipboard access, keylogging,
  AV/EDR behavior, Windows prompt behavior, unattended access, or hidden
  sessions.
