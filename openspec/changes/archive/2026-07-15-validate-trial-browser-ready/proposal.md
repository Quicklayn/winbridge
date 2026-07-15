## Why

`mvp:trial` now has a browser role, but `mvp:ready` still validates trial
plans against the older preflight/relay/host/viewer/evidence role set. This
leaves the new browser trial section outside the default readiness gate before
a two-PC MVP trial.

## What Changes

- Update `mvp:ready` trial-plan validation to require the browser role in the
  full `mvp:trial -- --json` plan.
- Add browser role-scoped `mvp:trial -- --role browser --json` validation.
- Keep browser trial validation non-executing and metadata-only.
- Update focused tests, README readiness wording, and specs.
- No breaking changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mvp-session-command-kit`: default and role-scoped readiness validates the
  browser trial plan section.

## Impact

- Affected code: `scripts/mvp-ready.mjs` and focused tests.
- Affected docs/specs: README and `mvp-session-command-kit`.
- Safety impact: readiness validation remains non-executing. It does not start
  relay, host, viewer, browser, capture, input, sockets, HTTP listeners,
  services, startup persistence, unattended access, privilege elevation,
  AV/EDR evasion, Windows prompt bypass, or hidden-session behavior. It does
  not touch capture, input, auth, relay behavior, installer, startup, services,
  token parsing, audit persistence, logs, or privilege elevation.
