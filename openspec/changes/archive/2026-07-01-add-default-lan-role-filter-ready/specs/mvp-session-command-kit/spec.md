## ADDED Requirements

### Requirement: Default ready validates tokenized LAN role-filter output

The default aggregate MVP ready helper SHALL validate tokenized LAN
role-filtered command output for relay, host, and viewer roles in addition to
the full LAN command-plan validation and existing localhost/token role-filter
validation. It SHALL run the non-executing command kit as
`mvp:commands -- --only relay --relay-host 192.168.1.10 --token-env WINBRIDGE_RELAY_SHARED_TOKEN`,
`mvp:commands -- --only host --relay-host 192.168.1.10 --token-env WINBRIDGE_RELAY_SHARED_TOKEN`,
and
`mvp:commands -- --only viewer --relay-host 192.168.1.10 --token-env WINBRIDGE_RELAY_SHARED_TOKEN`.
The relay check MUST require relay-only output plus the reviewed
`WINBRIDGE_RELAY_BIND_HOST = '0.0.0.0'` marker. The host and viewer checks MUST
require role-only agent output, the representative `ws://192.168.1.10:8787/`
relay URL shape, and the reviewed `$env:WINBRIDGE_RELAY_SHARED_TOKEN` token
reference. The helper MUST fail closed on missing, duplicated, malformed, or
cross-role output. Failure output MUST remain bounded and MUST NOT echo
generated command strings, relay URLs, local URLs, ports, token references,
token values, token environment values, pairing codes, local paths, stdout,
stderr, child output, credentials, frame bytes, screen contents, input
contents, clipboard contents, or full secrets. The checks MUST remain
non-executing and MUST NOT start relay, host, viewer, browser, capture, input,
sockets, HTTP listeners, services, startup persistence, unattended access,
privilege elevation, LAN discovery, firewall changes, AV/EDR evasion, Windows
prompt bypass, or hidden-session behavior.

#### Scenario: Default ready covers tokenized LAN role filters

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the helper validates tokenized LAN relay role-filter output
- **AND** it validates tokenized LAN host role-filter output
- **AND** it validates tokenized LAN viewer role-filter output
- **AND** output reports only bounded fixed status for those checks

#### Scenario: Default LAN role-filter drift fails closed

- **WHEN** a default tokenized LAN role-filter output omits the expected LAN
  relay shape, omits the token env reference, includes raw token values,
  includes another role's runtime command block, or contains malformed
  role-filter metadata
- **THEN** `mvp:ready` treats the matching LAN role-filter check as failed
- **AND** diagnostics do not echo the unsafe command string, token reference,
  token value, relay URL, pairing code, path, stdout, stderr, child output,
  credential, screen content, input content, or full secret

#### Scenario: Role-scoped LAN checks remain unchanged

- **WHEN** a developer runs `npm run mvp:ready -- --role relay`, `--role host`,
  or `--role viewer`
- **THEN** role-scoped readiness keeps its existing local role's LAN
  role-filter coverage
- **AND** it does not add unrelated roles' LAN role-filter checks
