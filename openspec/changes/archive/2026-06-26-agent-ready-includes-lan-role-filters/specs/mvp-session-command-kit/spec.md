## ADDED Requirements

### Requirement: Host and viewer role ready validate LAN agent-only output

The role-scoped host and viewer MVP ready helpers SHALL validate
representative LAN agent-only command output in addition to the fixed localhost
role-filter output. `npm run mvp:ready -- --role host` SHALL run the
non-executing command kit as
`mvp:commands -- --only host --relay-host 192.168.1.10` and internally require
the representative `ws://192.168.1.10:8787/` relay URL shape while preserving
host-only output validation. `npm run mvp:ready -- --role viewer` SHALL do the
same for `mvp:commands -- --only viewer --relay-host 192.168.1.10` while
preserving viewer-only output validation. Relay role-scoped readiness MUST NOT
add host or viewer LAN agent-only checks.

The validation MUST fail closed with only fixed check metadata when the output
drifts. It MUST NOT echo generated command strings, relay URLs, local URLs,
ports, pairing codes, token references, local paths, stdout, stderr, child
output, credentials, screen contents, input contents, or full secrets. It MUST
remain non-executing and MUST NOT start relay, host, viewer, browser, capture,
input, sockets, HTTP listeners, services, startup persistence, unattended
access, privilege elevation, LAN discovery, firewall changes, AV/EDR evasion,
Windows prompt bypass, or hidden-session behavior.

#### Scenario: Host role ready covers LAN host-only output

- **WHEN** a developer runs `npm run mvp:ready -- --role host`
- **THEN** the helper validates doctor, native preflight, localhost host
  role-filter output, and LAN host role-filter output
- **AND** output reports only bounded fixed status for those checks

#### Scenario: Viewer role ready covers LAN viewer-only output

- **WHEN** a developer runs `npm run mvp:ready -- --role viewer`
- **THEN** the helper validates doctor, native preflight, localhost viewer
  role-filter output, LAN viewer role-filter output, browser role-filter
  output, and ephemeral browser role-filter output
- **AND** output reports only bounded fixed status for those checks

#### Scenario: Relay role ready remains scoped

- **WHEN** a developer runs `npm run mvp:ready -- --role relay`
- **THEN** the helper does not run host or viewer LAN agent-only checks
- **AND** relay readiness remains scoped to relay command validation
