## Why

`mvp:ready` now validates the full JSON command-plan native Windows control
path, but per-machine role-filtered host/viewer command text can still pass
readiness without those same reviewed capture/input markers. A two-PC operator
may copy only the role-filtered command for their machine, so the readiness gate
must catch drift in those visible command blocks too.

## What Changes

- Strengthen target-specific role-filter parsing in `mvp:ready` for host and
  viewer command output.
- Require host role-filter output to include the reviewed host input
  application marker and Windows capture source marker.
- Require viewer role-filter output to include the reviewed screen/input
  request and latest-frame output marker.
- Apply the same checks to LAN and token-env host/viewer role-filter readiness
  because those helpers delegate to the target-specific parser.
- Keep the checks non-executing and diagnostic-safe.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `mvp-session-command-kit`: role-filter readiness now fails closed unless
  host/viewer per-machine command output preserves the reviewed native Windows
  capture/input MVP markers.

## Impact

- Affected code: `scripts/mvp-ready.mjs`, `scripts/mvp-ready.test.ts`, README,
  and OpenSpec artifacts.
- Touches capture/input readiness semantics only through non-executing command
  text validation.
- Does not add hidden sessions, unattended access, installer behavior, startup,
  services, privilege elevation, credential access, keylogging, clipboard
  access, AV/EDR evasion, Windows prompt bypass, or any new capture/input
  runtime behavior.
- Safety impact: reduces risk that per-machine operator commands drift away
  from the reviewed visible, consent-bound native control path.
