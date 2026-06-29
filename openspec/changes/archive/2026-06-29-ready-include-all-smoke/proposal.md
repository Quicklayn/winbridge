## Why

The MVP readiness helper now exposes several explicit smoke switches, but a
developer preparing a two-PC trial must remember the exact combination needed
for full local coverage. A single explicit all-smoke flag reduces operator
error while preserving the existing opt-in safety model.

## What Changes

- Add `mvp:ready -- --include-all-smoke` for default aggregate readiness.
- Expand that flag to the existing default smoke, LAN-style smoke,
  token-protected smoke, and LAN-style token-protected smoke steps.
- Ensure non-token smoke variants do not implicitly inherit ambient
  `WINBRIDGE_RELAY_SHARED_TOKEN` from the parent shell.
- Keep the existing individual flags available and make `--include-all-smoke`
  reject duplicate or overlapping smoke flags to avoid ambiguous plans.
- Keep role-scoped readiness non-executing by rejecting `--include-all-smoke`
  with `--role`.
- Preserve bounded, secret-safe output and reuse the existing smoke JSON
  readiness parser.
- Non-goals: no new relay capability, public relay bind, LAN discovery,
  firewall change, native capture, OS input application, browser automation,
  installer, services, startup persistence, unattended access, privilege
  elevation, credential access, keylogging, AV/EDR evasion, Windows prompt
  bypass, or hidden sessions.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mvp-session-command-kit`: Adds an explicit readiness shortcut that
  aggregates all existing local smoke variants.

## Impact

- Affected code: `scripts/mvp-ready.mjs`,
  `scripts/mvp-ready.test.ts`, `README.md`.
- Affected systems: local MVP readiness orchestration and OpenSpec
  documentation.
- Security impact: touches token and relay readiness diagnostics only. It must
  not expose token values, token environment values, command strings, relay
  URLs, local URLs, pairing codes, stdout, stderr, child output, credentials,
  screen contents, input contents, clipboard contents, or full secrets.
