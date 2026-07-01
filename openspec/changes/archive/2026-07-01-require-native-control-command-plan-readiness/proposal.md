## Why

`mvp:ready` already validates command-plan shape, LAN relay/token handling, and
some reviewed safety markers, but it does not fail closed if the generated host
or viewer commands drift away from the native Windows capture/input MVP path.
The MVP needs a local readiness gate that proves the printed two-PC command
plan still points at visible, consent-bound viewing and control before a live
trial.

## What Changes

- Strengthen `mvp:ready` command-plan parsing so default, LAN, token, and
  ephemeral JSON command-plan checks require the reviewed native control path.
- Require the host command to include exactly one reviewed Windows capture
  source marker and exactly one reviewed host input application marker.
- Require the viewer command to include the reviewed screen/input request and
  latest-frame output path.
- Keep the checks non-executing and diagnostic-safe; no relay, host, viewer,
  browser, capture, input, socket, or HTTP listener is started by these checks.
- Document that default readiness validates the printed native host/viewer
  command path in addition to relay/token/consent/audit markers.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `mvp-session-command-kit`: default MVP readiness command-plan validation now
  fails closed unless the printed host/viewer commands preserve the reviewed
  Windows capture, host input, viewer request, and frame-output markers.

## Impact

- Affected code: `scripts/mvp-ready.mjs`, `scripts/mvp-ready.test.ts`, README,
  and OpenSpec artifacts.
- Touches capture/input readiness semantics only through non-executing command
  string validation.
- Does not add unattended access, hidden sessions, installer behavior, startup,
  services, privilege elevation, credential access, keylogging, clipboard
  access, AV/EDR evasion, Windows prompt bypass, default native execution, or
  any new capture/input adapter behavior.
- Safety impact: reduces risk that a developer reaches a two-PC MVP trial with
  a command plan that no longer uses the reviewed consent-bound native
  capture/input path.
