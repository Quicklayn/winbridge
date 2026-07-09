## Why

The two-PC MVP workflow already prints a viewer-browser command reference, but
`mvp:trial --role viewer` is the only role-filtered way to reach it. A separate
browser role gives the viewer operator a narrower checklist for opening the
loopback viewer control surface after the viewer runtime reports readiness.

## What Changes

- Add `browser` as a valid `mvp:trial --role` value.
- Print a browser-scoped non-executing section that references the existing
  `mvp:commands -- --only browser` command plan.
- Include the browser role in full text and JSON trial plans.
- Update tests and README usage.
- No breaking changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mvp-session-command-kit`: the trial helper gains a bounded browser role for
  viewer-surface launch instructions.

## Impact

- Affected code: `scripts/mvp-trial.mjs` and focused tests.
- Affected docs/specs: README and `mvp-session-command-kit`.
- Safety impact: the change is non-executing and does not start browsers,
  runtimes, sockets, HTTP listeners, capture, input, services, startup
  persistence, unattended access, privilege elevation, or Windows prompt
  bypasses. It does not touch capture, input, auth, relay behavior, installer,
  startup, services, token parsing, audit logs, or privilege elevation.
