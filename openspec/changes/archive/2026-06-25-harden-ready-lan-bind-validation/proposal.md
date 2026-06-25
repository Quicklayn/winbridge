## Why

`mvp:ready` validates the representative LAN command plan before a two-PC trial,
but its relay validation only checks for a relay bind environment variable by
name. It should also verify that the LAN relay command binds to the reviewed
`0.0.0.0` value and does not silently regress to loopback or an unsafe bind
shape while still keeping output bounded.

## What Changes

- Harden `mvp:ready` LAN command-plan parsing to require the exact
  `WINBRIDGE_RELAY_BIND_HOST = '0.0.0.0'` relay command prefix for the
  representative LAN relay host.
- Reject LAN command-plan JSON that routes host/viewer to the LAN URL but keeps
  relay bound to loopback, omits the bind value, or binds to a different value.
- Keep ready output metadata-only and avoid echoing relay commands, URLs,
  ports, stdout, stderr, token environment names, or child output.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mvp-session-command-kit`: ready helper performs stricter non-executing LAN
  command-plan validation.

## Impact

- Affected code: `scripts/mvp-ready.mjs`, `scripts/mvp-ready.test.ts`,
  README, and OpenSpec docs.
- Affected systems: local readiness parsing only.
- Safety impact: no process launch, relay runtime, host, viewer, browser,
  capture, input, sockets, audit writes, native API calls, installer, startup,
  service, privilege, token, or authorization behavior changes.
- Non-goals: no remote discovery, no network probing, no firewall changes, no
  production deployment workflow, no hidden sessions, no unattended access, no
  credential access, no keylogging, and no Windows prompt bypass.
