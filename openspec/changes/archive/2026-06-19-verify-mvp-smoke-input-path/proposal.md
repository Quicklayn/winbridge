# Change: Verify MVP smoke input path

## Why

The current MVP smoke check verifies static frame transport and the loopback
viewer surface, but it does not prove that the viewer surface can send a
consent-bound control command through the existing local `/input` endpoint.
For MVP readiness, the preflight should cover the viewer control path without
invoking native OS input.

## What Changes

- Extend `npm run mvp:smoke` to extract the per-run viewer surface mutation
  token from the generated local HTML and submit one bounded pointer command to
  `/input`.
- Verify only that the viewer local surface accepts the command through the
  existing runtime path.
- Keep host OS input application disabled in the smoke check.

## Safety Impact

The smoke check remains static, loopback-only, and development-scoped. It still
does not use Windows capture, `--host-apply-input true`, browser automation,
global keyboard capture, clipboard, file transfer, diagnostics dumps, services,
startup persistence, unattended access, privilege elevation, evasion, hidden
sessions, or Windows prompt bypass.
