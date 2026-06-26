## ADDED Requirements

### Requirement: Relay role ready validates LAN relay-only bind output

The role-scoped relay MVP ready helper SHALL validate a representative LAN
relay-only command output in addition to the fixed localhost relay role-filter
output. `npm run mvp:ready -- --role relay` SHALL run the non-executing command
kit as `mvp:commands -- --only relay --relay-host 192.168.1.10` and SHALL
internally require the reviewed `WINBRIDGE_RELAY_BIND_HOST = '0.0.0.0'` relay
bind marker while preserving relay-only output validation. Host and viewer
role-scoped ready plans MUST NOT add this relay LAN-only check.

The validation MUST fail closed with only fixed check metadata when the output
drifts. It MUST NOT echo generated command strings, relay URLs, local URLs,
ports, pairing codes, token references, local paths, stdout, stderr, child
output, credentials, screen contents, input contents, or full secrets. It MUST
remain non-executing and MUST NOT start relay, host, viewer, browser, capture,
input, sockets, HTTP listeners, services, startup persistence, unattended
access, privilege elevation, LAN discovery, firewall changes, AV/EDR evasion,
Windows prompt bypass, or hidden-session behavior.

#### Scenario: Relay role ready covers LAN relay-only output

- **WHEN** a developer runs `npm run mvp:ready -- --role relay`
- **THEN** the helper validates doctor, localhost relay role-filter output,
  and LAN relay role-filter output
- **AND** the LAN relay validation passes only when the relay-only block
  includes the reviewed LAN bind marker
- **AND** output reports only bounded fixed status for those checks

#### Scenario: Host and viewer role ready remain scoped

- **WHEN** a developer runs `npm run mvp:ready -- --role host` or
  `npm run mvp:ready -- --role viewer`
- **THEN** the helper does not run the relay LAN-only check
- **AND** each role remains scoped to its local readiness checks
