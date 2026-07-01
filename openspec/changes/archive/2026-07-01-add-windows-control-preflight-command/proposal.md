## Why

The command kit already prints the full local all-smoke gate, but it does not
surface the explicit Windows control smoke gate that exercises native capture
and native input together. That makes the closest automated "view and control"
readiness path easier to miss before a Windows MVP trial.

## What Changes

- Add a fixed non-executing command-plan entry named
  `preflight.ready-windows-control-smoke`.
- Render `npm run mvp:ready -- --include-windows-control-smoke` in full-session,
  preflight-only, and JSON command-plan output.
- Update `mvp:ready` command-plan drift validation to require the fixed entry
  and exact command string.
- Document that this is an explicit Windows native control readiness gate and
  remains separate from `--include-all-smoke`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mvp-session-command-kit`: command plans and readiness validation must include
  a fixed, non-executing Windows control smoke preflight command.

## Impact

- Affected code: `scripts/mvp-session-commands.mjs`,
  `scripts/mvp-session-commands.test.ts`, `scripts/mvp-ready.mjs`, and
  `scripts/mvp-ready.test.ts`.
- Affected docs/specs: README and `openspec/specs/mvp-session-command-kit`.
- Touches command rendering and readiness validation only.
- Does not execute smoke automatically, enable Windows capture/input by
  default, bind public relays, install services, configure startup persistence,
  add unattended access, elevate privileges, read credentials or clipboard
  contents, keylog, evade AV/EDR, bypass Windows prompts, or hide
  capture/session/input activity.
