## ADDED Requirements

### Requirement: Host and viewer role ready validate token-env agent-only output

The role-scoped host and viewer MVP ready helpers SHALL validate token-env agent-only command output in addition to the fixed localhost and representative LAN role-filter output. `npm run mvp:ready -- --role host` SHALL run the non-executing command kit as `mvp:commands -- --only host --token-env WINBRIDGE_RELAY_SHARED_TOKEN` and internally require the reviewed `$env:WINBRIDGE_RELAY_SHARED_TOKEN` token reference while preserving host-only output validation. `npm run mvp:ready -- --role viewer` SHALL do the same for `mvp:commands -- --only viewer --token-env WINBRIDGE_RELAY_SHARED_TOKEN` while preserving viewer-only output validation. Relay role-scoped readiness MUST NOT add host or viewer token-env agent-only checks.

The validation MUST fail closed with only fixed check metadata when the output drifts. It MUST NOT echo generated command strings, relay URLs, local URLs, ports, pairing codes, token references, local paths, stdout, stderr, child output, credentials, screen contents, input contents, or full secrets. It MUST remain non-executing and MUST NOT start relay, host, viewer, browser, capture, input, sockets, HTTP listeners, services, startup persistence, unattended access, privilege elevation, LAN discovery, firewall changes, AV/EDR evasion, Windows prompt bypass, or hidden-session behavior.

#### Scenario: Host role ready covers token-env host-only output

- **WHEN** a developer runs `npm run mvp:ready -- --role host`
- **THEN** the helper validates doctor, native preflight, localhost host role-filter output, LAN host role-filter output, and token-env host role-filter output
- **AND** output reports only bounded fixed status for those checks

#### Scenario: Viewer role ready covers token-env viewer-only output

- **WHEN** a developer runs `npm run mvp:ready -- --role viewer`
- **THEN** the helper validates doctor, native preflight, localhost viewer role-filter output, LAN viewer role-filter output, token-env viewer role-filter output, browser role-filter output, and ephemeral browser role-filter output
- **AND** output reports only bounded fixed status for those checks

#### Scenario: Token-env role output drift fails closed

- **WHEN** the token-env role-filter output omits the expected bounded environment-variable reference, includes a raw token value instead, includes another role's runtime command block, or contains malformed role-filter metadata
- **THEN** `mvp:ready -- --role host` or `mvp:ready -- --role viewer` treats the matching token-env role-filter check as failed
- **AND** diagnostics do not echo the unsafe command string, token reference, token value, relay URL, pairing code, path, stdout, stderr, child output, credential, screen content, input content, or full secret

#### Scenario: Relay role ready remains token-env scoped

- **WHEN** a developer runs `npm run mvp:ready -- --role relay`
- **THEN** the helper does not run host or viewer token-env agent-only checks
- **AND** relay readiness remains scoped to relay command validation
