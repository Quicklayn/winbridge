## Why

WinBridge now has separate explicit Windows smoke gates for native screen
capture and native input application, but MVP evidence still lacks a single
readiness gate proving both boundaries in the same consent-bound session. A
combined gate better represents the real "connect, view, and control" Windows
MVP path without changing default smoke safety.

## What Changes

- Add an explicit `mvp:ready -- --include-windows-control-smoke` option.
- The new readiness step runs `mvp:smoke -- --json --windows-capture --windows-input`.
- Reuse the existing smoke behavior for explicit host approval, visible session
  state, host/viewer surfaces, frame verification, protocol input, native input
  audit evidence, revocation, and viewer disconnect.
- Keep default readiness, role-scoped readiness, and `--include-all-smoke` free
  of native capture and OS input application.
- Document the direct combined smoke command for Windows operators.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `mvp-session-command-kit`: the MVP ready helper gains an explicit combined
  Windows control smoke gate for the native capture plus native input MVP path.

## Impact

- Affected code: `scripts/mvp-ready.mjs`, `scripts/mvp-ready.test.ts`,
  `scripts/mvp-session-smoke.test.ts`, README, and OpenSpec artifacts.
- Touches capture/input readiness orchestration only through an explicit local
  Windows smoke command.
- Does not add unattended access, hidden sessions, installer behavior, startup,
  services, privilege elevation, credential access, keylogging, clipboard
  access, AV/EDR evasion, Windows prompt bypass, default native capture, or
  default OS input.
- Safety impact: strengthens MVP evidence for real remote control while keeping
  native boundaries opt-in, consent-bound, visible, audited, revocable, and
  secret-safe.
