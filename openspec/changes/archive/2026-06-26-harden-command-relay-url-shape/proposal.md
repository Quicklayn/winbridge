## Why

The MVP command kit rejects unsafe `--relay-host` shortcuts, but a full
`--relay` URL can still encode connect-target mistakes such as `0.0.0.0` or a
non-root path. Before a two-PC MVP trial, the command generator should fail
closed on relay URLs that are valid syntax but unsafe or misleading as host and
viewer connection targets.

## What Changes

- Reject full `--relay` URLs whose host is unspecified, such as `0.0.0.0`,
  `::`, or bracketed IPv6 unspecified forms.
- Reject full `--relay` URLs with non-root path components, while keeping the
  existing acceptance of the default root path.
- Keep command-kit diagnostics bounded and avoid echoing unsafe relay URL
  input.
- Document that `0.0.0.0` is only generated as a relay bind setting for LAN
  trials, never accepted as the host/viewer relay connection target.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mvp-session-command-kit`: stricter full relay URL validation for the
  non-executing MVP command generator.

## Impact

- Affected code: `scripts/mvp-session-commands.mjs`,
  `scripts/mvp-session-commands.test.ts`, README, and OpenSpec docs.
- Affected systems: command rendering and readiness command-plan validation
  only.
- Safety impact: prevents unsafe operator command output for two-PC trials. It
  does not start relay, host, viewer, browser, sockets, capture, input, audit
  writes, installers, services, startup persistence, privilege elevation, or
  authorization behavior.
- Non-goals: no remote discovery, no LAN probing, no firewall changes, no
  production deployment hardening, no hidden sessions, no unattended access, no
  credential access, no keylogging, no AV/EDR evasion, and no Windows prompt
  bypass.
