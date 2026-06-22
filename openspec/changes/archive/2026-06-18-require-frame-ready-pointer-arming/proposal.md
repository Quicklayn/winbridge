## Why

The generated viewer local surface now requires explicit pointer arming, but the
arming control can still be toggled while the latest frame is loading or absent.
MVP pointer control should stay fail-closed whenever the displayed frame is not
ready, so browser-originated pointer events cannot target a stale or missing
remote image.

## What Changes

- Track frame readiness in the generated viewer local surface.
- Keep the pointer arming button disabled while the frame is not ready.
- Disarm pointer mode when a frame refresh starts or fails.
- Gate browser pointer handlers on both explicit arming and ready frame state.
- Add focused tests and docs/spec updates.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: local viewer browser pointer input requires a
  current ready displayed frame in addition to explicit same-page arming.

## Impact

- Affected code: `apps/agent-shell/src/viewer-local-control-surface.ts` and
  focused tests.
- Affected docs/specs: README, security/architecture docs, and agent-shell
  consent workflow spec.
- APIs/dependencies: no protocol, relay, runtime API, CLI flag, native Windows,
  or dependency changes.
- Safety impact: reduces stale-frame and absent-frame remote input risk. It
  does not add capture, hidden input, unattended access, persistence,
  credential access, keylogging, AV/EDR evasion, Windows prompt bypass, or new
  authorization behavior.
