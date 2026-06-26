## ADDED Requirements

### Requirement: Viewer role ready includes ephemeral browser-only validation

The role-scoped viewer MVP ready helper SHALL validate the explicit ephemeral
browser-only command output in addition to the fixed viewer and browser
role-filter outputs. `npm run mvp:ready -- --role viewer` SHALL run the same
non-executing `mvp:commands -- --only browser --viewer-control-surface-port 0`
validation as the aggregate ready helper and SHALL fail closed with only fixed
check metadata when that output drifts. Relay and host role-scoped ready plans
MUST NOT add this viewer-browser check. The validation MUST NOT echo generated
command strings, local URLs, ports, relay URLs, pairing codes, token
references, local paths, stdout, stderr, child output, mutation tokens,
credentials, screen contents, input contents, or full secrets. It MUST remain
non-executing and MUST NOT start relay, host, viewer, browser, capture, input,
sockets, HTTP listeners, services, startup persistence, unattended access,
privilege elevation, remote discovery, firewall changes, AV/EDR evasion,
Windows prompt bypass, or hidden-session behavior.

#### Scenario: Viewer role ready covers ephemeral browser output

- **WHEN** a developer runs `npm run mvp:ready -- --role viewer`
- **THEN** the helper validates doctor, native preflight, viewer role-filter,
  browser role-filter, and ephemeral browser role-filter output
- **AND** output reports only bounded fixed status for those checks

#### Scenario: Relay and host role ready remain scoped

- **WHEN** a developer runs `npm run mvp:ready -- --role relay` or
  `npm run mvp:ready -- --role host`
- **THEN** the helper does not run the viewer ephemeral browser-only check
- **AND** it remains scoped to the local role's readiness checks

