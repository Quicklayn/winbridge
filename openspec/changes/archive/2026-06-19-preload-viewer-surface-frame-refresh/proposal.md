## Why

The local viewer surface currently disables pointer arming whenever it starts a
frame refresh. Because the page polls frames once per second, browser pointer
control can be disarmed during normal use even while a valid previously loaded
frame is still displayed. For MVP remote assistance, pointer input should stay
fail-closed when no displayed frame is ready, but a refresh should not interrupt
control until a replacement frame has loaded.

## What Changes

- Preload the next frame before replacing the displayed frame image.
- Keep the last displayed ready frame active while a replacement frame is
  loading.
- Keep pointer arming disabled until the first frame is ready, and disarm only
  when no displayed ready frame exists or the displayed frame becomes not-ready.
- Add focused tests and docs/spec updates.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: viewer local surface frame refresh preserves a
  ready displayed frame while preloading the next frame.

## Impact

- Affected code: `apps/agent-shell/src/viewer-local-control-surface.ts` and
  focused tests.
- Affected docs/specs: README, architecture/security docs, and agent-shell
  consent workflow spec.
- APIs/dependencies: no protocol, relay, runtime API, CLI flag, native Windows,
  or dependency changes.
- Safety impact: improves MVP usability without changing authorization gates.
  It does not add capture, hidden input, unattended access, persistence,
  credential access, keylogging, AV/EDR evasion, Windows prompt bypass, or new
  authorization behavior.
