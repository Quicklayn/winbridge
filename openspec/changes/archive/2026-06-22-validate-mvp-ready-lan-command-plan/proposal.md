## Why

The default `mvp:ready` command-plan validation checks only the localhost command plan, while the real MVP trial normally uses `--relay-host <LAN-IP>`. A regression in the LAN command-plan path could pass readiness and fail only when a user tries to connect two Windows PCs.

## What Changes

- Extend `mvp:ready` default readiness checks to validate a fixed safe LAN command plan using the existing non-executing command kit.
- Require the LAN validation to use bounded JSON output and validate only safe metadata: `ok`, `mode`, `nonExecuting`, fixed command names, and evidence that relay/host/viewer commands target the fixed LAN relay URL.
- Keep all generated command strings, child stdout/stderr, relay tokens, pairing codes, local paths, frame bytes, input details, and secrets hidden from ready output.
- Preserve existing fail-fast ordering: doctor, native preflight, localhost command plan, LAN command plan, then optional smoke.
- Safety impact: local readiness validation only. It must not start relay, host, viewer, browser, capture, input, services, startup persistence, unattended access, privilege elevation, or Windows prompt bypass.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mvp-session-command-kit`: the MVP ready helper now validates both localhost and representative LAN two-PC command plans.

## Impact

- `scripts/mvp-ready.mjs`
- `scripts/mvp-ready.test.ts`
- `README.md`
- `openspec/specs/mvp-session-command-kit/spec.md` after archive
