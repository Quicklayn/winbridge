## MODIFIED Requirements

### Requirement: MVP session command kit prints validated visible-session commands

The MVP command kit MUST print a validated, non-executing, ordered PowerShell
command plan for a visible development relay, host, viewer, and viewer browser
surface. The plan MUST include explicit preflight commands, a relay command, a
host command with interactive consent prompt, visible-session state, host
control prompt, local audit path, explicit host input opt-in, finite Windows
capture scheduling, a viewer command that requests `screen:view`,
`input:pointer`, and `input:keyboard`, a viewer latest-frame output path, a
loopback local viewer control surface port, a browser open command for that
loopback surface, and host-side pause, resume, revoke, terminate, and
disconnect controls. When invoked with `--relay-host`, the command kit MUST
accept only a bounded host name or IPv4 literal without a scheme, port, path,
query, fragment, loopback, unspecified, or secret-bearing metadata and MUST
generate the relay URL `ws://<relay-host>:8787/` for the same non-executing
command plan. The command kit MUST support a bounded
`--capture-duration-minutes` option that derives a finite host
`--dev-screen-frame-count` from the capture interval while preserving the
existing finite frame-count bound.

#### Scenario: Duration option derives a finite capture count

- **WHEN** a developer runs the command kit with `--capture-duration-minutes 5`
- **THEN** the printed host command uses a finite `--dev-screen-frame-count`
  derived from five minutes and the configured capture interval
- **AND** the helper does not print an infinite, unattended, service, startup,
  privilege-elevation, hidden-capture, hidden-input, or auto-executing command

### Requirement: MVP session command kit fails closed on malformed input

The MVP command kit MUST reject malformed, duplicate, ambiguous, unsafe, or
secret-bearing options before rendering relay, host, viewer, browser, token, or
preflight commands. It MUST reject raw relay token values and accept only a
bounded environment variable name for token references. It MUST reject relay
URLs that contain credentials, token query parameters, search parameters,
fragments, unsupported schemes, or unsafe scalar characters. It MUST reject
unsafe file paths, unsafe identifiers, invalid ports, invalid capture cadence
values, invalid `--generate-pairing` combinations, invalid preflight-only
combinations, and invalid JSON/preflight flags without echoing raw unsafe input
in diagnostics. The `--relay-host` shortcut MUST be rejected when it is
malformed, loopback, unspecified, secret-bearing, or combined with `--relay`.
The `--capture-duration-minutes` option MUST be rejected when malformed,
combined with `--capture-count`, or when its derived finite frame count exceeds
the supported command-kit frame-stream bound.

#### Scenario: Malformed capture duration is rejected

- **WHEN** a developer supplies a non-integer, zero, duplicate,
  `--capture-count`-conflicting, or oversized `--capture-duration-minutes`
  value
- **THEN** the command kit rejects the input before rendering commands
- **AND** the error output remains bounded and does not echo raw unsafe input
