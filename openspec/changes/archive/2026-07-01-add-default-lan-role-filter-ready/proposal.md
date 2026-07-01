## Why

The default MVP readiness path validates the aggregate LAN command plan, and
role-scoped readiness validates per-role LAN command snippets. However, default
readiness does not yet validate the exact tokenized LAN relay, host, and viewer
role-filter outputs that operators are likely to copy for a two-PC trial. README
already describes these as covered, so the default gate should prove them.

## What Changes

- Add default `mvp:ready` checks for tokenized LAN relay, host, and viewer
  role-filter command output.
- Reuse the existing representative relay host `192.168.1.10` and token env
  name `WINBRIDGE_RELAY_SHARED_TOKEN`.
- Reuse existing bounded role-filter parsers for LAN relay and LAN agent output.
- Keep the checks non-executing: they render command text only and do not start
  relay, host, viewer, browser, capture, input, sockets, or listeners.
- Keep failure output bounded to fixed check names and reason codes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `mvp-session-command-kit`: default `mvp:ready` validates tokenized LAN
  role-filter relay, host, and viewer command outputs.

## Impact

- Affected code: `scripts/mvp-ready.mjs`, `scripts/mvp-ready.test.ts`, README,
  and OpenSpec artifacts.
- Touches relay/token readiness command rendering only through non-executing
  command-plan validation.
- Does not add remote discovery, firewall changes, public probing, browser
  automation, native capture/input execution, installer behavior, startup,
  services, privilege elevation, unattended access, credential access,
  keylogging, clipboard access, AV/EDR evasion, Windows prompt bypass, or
  hidden sessions.
- Safety impact: strengthens two-PC MVP operator evidence while keeping token
  values referenced only through environment variables and diagnostics bounded.
