## ADDED Requirements

### Requirement: MVP agent token-env surfaces avoid raw child token argv

The reviewed MVP command and runner surfaces SHALL prefer agent
`--token-env <ENV_NAME>` for host and viewer token-protected relay access. When
the command kit is invoked with `--token-env <ENV_NAME>`, generated host and
viewer command text MUST include `--token-env` references instead of raw
`--token` runtime values. When `mvp:run` starts a live host or viewer role with
`--token-env <ENV_NAME>`, the child argv MUST include the bounded environment
variable name and MUST NOT include the resolved token value. Relay role runs
MAY continue to pass relay bind, port, and shared-token values through child
environment variables.

The MVP readiness helper MUST validate sanitized runner dry-run metadata and
token-env role-filter command output so regressions to raw host/viewer
`--token` argv fail closed before live use. Human and JSON diagnostics MUST NOT
echo generated command strings, raw relay URLs, local URLs, local paths, token
values, token environment values, pairing codes, child stdout, child stderr,
frame bytes, screen contents, input contents, clipboard contents, credentials,
diagnostics dumps, or full secrets.

This requirement MUST NOT add hidden sessions, unattended access, service
install, startup persistence, browser launch, privilege elevation, firewall
changes, LAN discovery, credential access, keylogging, AV/EDR evasion, Windows
prompt bypass, hidden capture, or hidden input.

#### Scenario: Command kit prints agent token-env references

- **WHEN** a developer runs `npm run mvp:commands -- --token-env WINBRIDGE_RELAY_SHARED_TOKEN`
- **THEN** the generated host and viewer commands include
  `--token-env $env:WINBRIDGE_RELAY_SHARED_TOKEN` or the reviewed platform
  equivalent
- **AND** the generated host and viewer commands do not include raw token
  values

#### Scenario: Role runner live host and viewer avoid token argv

- **WHEN** a developer runs `npm run mvp:run -- --role host` or
  `npm run mvp:run -- --role viewer` with valid explicit session, pairing,
  relay target, token-env, and foreground acknowledgement
- **THEN** the spawned child argv includes `--token-env <ENV_NAME>`
- **AND** the spawned child argv does not include the resolved relay token
  value

#### Scenario: Ready rejects raw token regressions

- **WHEN** runner dry-run metadata or command-kit token-env role-filter output
  includes raw host/viewer `--token` argv instead of reviewed `--token-env`
  markers
- **THEN** `mvp:ready` treats the matching check as failed
- **AND** diagnostics do not echo token values, token environment values,
  generated commands, pairing codes, stdout, stderr, child output, or secrets
