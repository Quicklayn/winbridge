## Why

The command kit now supports machine-specific `--only` output for two-PC
trials. `mvp:ready` should validate that filtered workflow alongside the full
JSON command plan so a broken target-specific command block is caught before a
live assistance attempt.

## What Changes

- Add default `mvp:ready` validation for fixed `mvp:commands --only` targets:
  relay, host, viewer, browser, and preflight.
- Treat malformed, unsafe, or cross-target filtered output as a bounded
  readiness failure.
- Keep ready output metadata-only; do not echo filtered command strings or
  child output.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mvp-session-command-kit`: ready helper validates role-filtered command-kit
  output as part of the default non-executing readiness gate.

## Impact

- Affected code: `scripts/mvp-ready.mjs`, `scripts/mvp-ready.test.ts`, README,
  and OpenSpec docs.
- Affected systems: local readiness validation only.
- Safety impact: no new capture, input, relay runtime, authentication, audit
  log, installer, startup, service, token, or privilege behavior. The ready
  helper runs non-executing command generation and reports only fixed check
  status.
- Non-goals: no process launch beyond existing readiness child commands, no
  remote discovery, no network probing, no firewall configuration, no automatic
  browser launch, no native capture/input execution, no hidden sessions, and no
  unattended access.
