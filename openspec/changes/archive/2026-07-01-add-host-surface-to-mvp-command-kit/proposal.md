## Why

The agent shell now has an opt-in host local control surface, but the MVP
two-PC command kit still guides operators through terminal-only host controls.
The MVP workflow should surface the same visible pause, revoke, terminate, and
disconnect controls in the generated non-executing plan before a real trial.

## What Changes

- Add a host local control surface port option to the MVP command kit.
- Render the host command with `--host-control-surface-port`, using an
  ephemeral loopback port by default.
- Update readiness validation so drift in the reviewed host surface command
  plan fails closed.
- Update README guidance to make the host surface part of the MVP operator
  flow.
- Keep the command kit non-executing: it prints commands only and does not
  start listeners, browsers, relay, capture, or input.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `mvp-session-command-kit`: include the host local control surface in the
  reviewed MVP command plan and readiness gates.

## Impact

- Affected code: `scripts/mvp-session-commands.mjs`,
  `scripts/mvp-ready.mjs`, related tests, and README MVP workflow guidance.
- Touches capture/input/auth only as command text validation for the existing
  development MVP flow; it does not execute capture, input, authorization, or
  lifecycle actions.
- Does not touch relay runtime behavior, installer behavior, startup,
  services, tokens beyond existing environment-reference validation, logs,
  privilege elevation, or native Windows APIs.
- Safety impact: improves host revocation ergonomics while preserving explicit
  consent, visible-session state, loopback-only local controls, bounded
  diagnostics, and fail-closed readiness validation.
