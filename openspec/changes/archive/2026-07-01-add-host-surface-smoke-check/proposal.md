## Why

The MVP command plan now includes the host local control surface, but the root
MVP smoke check still verifies only the viewer local surface. The smoke gate
should prove that the generated host-side browser control surface starts
visibly on loopback and keeps its local mutation guards intact before a
two-PC trial.

## What Changes

- Start the host smoke process with `--host-control-surface-port 0`.
- Add a bounded `host-surface` smoke subcheck that extracts the host loopback
  URL from host output, fetches host status, and verifies local mutation guard
  rejections.
- Extend `mvp:ready` smoke-result parsing to accept and report the new fixed
  subcheck.
- Update README smoke guidance to mention host local surface verification.
- Keep the smoke workflow local, explicit, finite, and consent-bound.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `mvp-session-command-kit`: the root MVP smoke and ready helpers verify the
  host local control surface as part of the local MVP evidence path.

## Impact

- Affected code: `scripts/mvp-session-smoke.mjs`,
  `scripts/mvp-ready.mjs`, related tests, README, and OpenSpec artifacts.
- Touches host controls, audit/readiness evidence, and command orchestration
  only inside the explicit local MVP smoke path.
- Does not add production UI, unattended access, installer behavior, startup,
  services, privilege elevation, credential access, keylogging, LAN-bound host
  surfaces, Windows prompt bypass, or hidden sessions.
- Safety impact: strengthens proof that the host-visible local controls are
  present and locally guarded without granting permissions or applying input
  outside the existing consent-bound workflow.
