## ADDED Requirements

### Requirement: Default ready validates token-env role-filter output

The default aggregate MVP ready helper SHALL validate host and viewer token-env role-filtered command output in addition to the full shared-token command-plan validation and fixed localhost role-filter command validation. `npm run mvp:ready` SHALL run the non-executing command kit as `mvp:commands -- --only host --token-env WINBRIDGE_RELAY_SHARED_TOKEN` and `mvp:commands -- --only viewer --token-env WINBRIDGE_RELAY_SHARED_TOKEN`, internally require the reviewed `$env:WINBRIDGE_RELAY_SHARED_TOKEN` token reference, and preserve host-only or viewer-only output validation for the selected target.

The validation MUST fail closed with only fixed check metadata when the output drifts. It MUST NOT echo generated command strings, relay URLs, local URLs, ports, pairing codes, token references, local paths, stdout, stderr, child output, credentials, screen contents, input contents, or full secrets. It MUST remain non-executing and MUST NOT start relay, host, viewer, browser, capture, input, sockets, HTTP listeners, services, startup persistence, unattended access, privilege elevation, LAN discovery, firewall changes, AV/EDR evasion, Windows prompt bypass, or hidden-session behavior.

#### Scenario: Default ready covers token-env host and viewer role filters

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the helper validates the full shared-token command plan
- **AND** it validates token-env host role-filter output
- **AND** it validates token-env viewer role-filter output
- **AND** output reports only bounded fixed status for those checks

#### Scenario: Default token-env role-filter drift fails closed

- **WHEN** the default token-env host or viewer role-filter output omits the expected bounded environment-variable reference, includes a raw token value instead, includes another role's runtime command block, or contains malformed role-filter metadata
- **THEN** `mvp:ready` treats the matching token-env role-filter check as failed
- **AND** diagnostics do not echo the unsafe command string, token reference, token value, relay URL, pairing code, path, stdout, stderr, child output, credential, screen content, input content, or full secret
