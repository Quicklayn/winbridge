## Why

The current MVP smoke check proves the relay, consent, viewer surface, input
path, audit, revocation, and disconnect behavior with static frames only. A
Windows-to-Windows MVP also needs an explicit operator-run check that the
existing consent-bound Windows capture adapter can feed a real frame through
the same host/viewer path without enabling OS input or hidden capture.

## What Changes

- Add an explicit `mvp:smoke --windows-capture` mode that uses the existing
  host `--dev-screen-frame-source windows-capture` path instead of static frame
  data.
- Keep the smoke check local, visible, consent-bound, finite, and metadata-only
  in its output.
- Reject `--windows-capture` on unsupported platforms before starting relay,
  host, viewer, browser, input, services, startup persistence, or unattended
  behavior.
- Keep OS input application disabled in smoke; the viewer input path remains a
  protocol/local-surface check only.

## Capabilities

### New Capabilities

### Modified Capabilities
- `mvp-session-command-kit`: add explicit native Windows capture smoke
  orchestration and readiness validation behavior.

## Impact

- Affected code: `scripts/mvp-session-smoke.mjs`,
  `scripts/mvp-session-smoke.test.ts`, `scripts/mvp-ready.mjs`,
  `scripts/mvp-ready.test.ts`, README/OpenSpec docs.
- Touches capture and user-visible MVP workflow.
- Does not change input application, relay authorization, protocol schemas,
  installer behavior, startup persistence, services, privilege elevation,
  authentication, or production deployment.
