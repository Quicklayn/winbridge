## Why

Two-PC MVP rehearsal currently has separate readiness coverage for LAN-style
smoke and token-protected smoke, but no single readiness switch verifies the
combined LAN-style relay URL shape plus shared-token path. Adding an explicit
aggregate check reduces operator error before a real Windows-to-Windows trial.

## What Changes

- Add an explicit `mvp:ready -- --include-lan-token-smoke` option for default
  aggregate readiness.
- Run `mvp:smoke -- --json --lan-relay --token-env WINBRIDGE_RELAY_SHARED_TOKEN`
  only when the option is provided.
- Report `lan-token-smoke` as skipped metadata by default and reject the option
  in role-scoped readiness.
- Preserve bounded, secret-safe readiness output and fail closed on smoke
  output drift.
- Non-goals: no public relay bind, LAN discovery, firewall change, native
  capture, OS input application, browser automation, services, startup
  persistence, unattended access, privilege elevation, AV/EDR evasion, Windows
  prompt bypass, or hidden sessions.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mvp-session-command-kit`: Adds explicit readiness aggregation for the
  existing LAN-style token-protected local smoke workflow.

## Impact

- Affected code: `scripts/mvp-ready.mjs`,
  `scripts/mvp-ready.test.ts`, `README.md`.
- Affected systems: local MVP readiness orchestration and OpenSpec
  documentation.
- Security impact: touches token and relay readiness diagnostics only. It must
  not expose token values, command strings, relay URLs, pairing codes, stdout,
  stderr, child output, credentials, screen contents, input contents, or full
  secrets.
