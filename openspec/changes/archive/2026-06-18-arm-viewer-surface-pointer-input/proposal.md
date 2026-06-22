## Why

The local viewer surface currently sends pointer movement whenever the mouse
moves over the displayed frame. For MVP remote assistance, pointer control
should require an explicit visible page action so accidental hover does not send
remote input.

## What Changes

- Add an explicit pointer arming control to the generated viewer local surface.
- Keep pointer input disabled by default and send pointer events only while the
  page-level pointer control is armed.
- Suppress browser-native context menu and image drag defaults on the displayed
  remote frame only, so local browser UI does not interrupt explicit remote
  pointer gestures.
- Keep command-box pointer commands and keyboard buttons on the existing
  consent-bound `/input` path.
- Add focused tests and docs/spec updates for pointer arming.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: Browser-originated pointer input from the
  generated local viewer page must require an explicit pointer arming action.

## Impact

- Affected code: `apps/agent-shell/src/viewer-local-control-surface.ts` and
  focused tests.
- Affected docs/specs: README, architecture/security docs, and agent-shell
  consent workflow spec.
- APIs/dependencies: no protocol, relay, runtime API, CLI flag, or dependency
  changes.
- Safety impact: reduces accidental remote input. It does not add capture,
  hidden input, unattended access, persistence, credential access, keylogging,
  AV/EDR evasion, Windows prompt bypass, or new authorization behavior.
