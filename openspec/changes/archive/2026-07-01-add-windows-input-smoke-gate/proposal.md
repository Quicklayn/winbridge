## Why

The local MVP smoke path proves protocol input can be sent, but it does not
prove the host can apply consent-bound input through the reviewed Windows input
adapter. MVP evidence should include an explicit Windows-only gate for native
input application without making OS input part of the default smoke.

## What Changes

- Add an explicit `mvp:smoke -- --windows-input` option that starts the host
  with `--host-apply-input true` only for an opt-in Windows smoke run.
- Verify a fixed `windows-input` smoke subcheck from host audit evidence after
  the existing protocol input send path.
- Fail closed before starting relay, host, viewer, capture, input, browser,
  services, startup persistence, or unattended behavior when `--windows-input`
  is requested off Windows.
- Add an explicit `mvp:ready -- --include-windows-input-smoke` gate that runs
  `mvp:smoke -- --json --windows-input` only when requested.
- Keep default smoke and `--include-all-smoke` free of OS input application.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `mvp-session-command-kit`: the MVP smoke and ready helpers gain an explicit
  Windows-only native input smoke gate while preserving default no-OS-input
  behavior.

## Impact

- Affected code: `scripts/mvp-session-smoke.mjs`,
  `scripts/mvp-ready.mjs`, tests, README, and OpenSpec artifacts.
- Touches native input verification, host audit evidence, and command
  orchestration only inside the explicit local MVP smoke path.
- Does not add unattended access, hidden sessions, installer behavior, startup,
  services, privilege elevation, credential access, keylogging, clipboard
  access, AV/EDR evasion, Windows prompt bypass, or default OS input.
- Safety impact: strengthens MVP proof for real remote control while keeping
  host consent, visible active session state, authorization, revocation, audit,
  and fail-closed platform behavior mandatory.
