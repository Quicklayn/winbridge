## ADDED Requirements

### Requirement: MVP command kit bootstraps fresh trial metadata

The MVP command kit SHALL support an explicit full-plan `--generate-session`
option that generates a bounded protocol-valid session id for a two-PC trial.
The option MUST be compatible with `--generate-pairing` in full command-plan
mode so one reviewed plan can coordinate both fresh metadata values. Generated
session ids and pairing codes are coordination metadata only; they MUST NOT be
described as authentication, authorization, relay tokens, account identity, or
host consent.

The command kit MUST reject `--generate-session` in role-filtered output and
preflight-only output before generating metadata. It MUST reject explicit
`--session` when `--generate-session` is supplied. Failure diagnostics MUST
remain bounded and MUST NOT echo generated session ids, pairing codes, relay
URLs, token values, token environment values, local paths, generated runtime
commands, stdout, stderr, child output, credentials, or full secrets.

The full `mvp:trial` planning surface SHALL include a fixed non-executing
bootstrap reference to the reviewed full command plan using
`mvp:commands -- --generate-session --generate-pairing --relay-host
<relay-pc-lan-ip> --token-env WINBRIDGE_RELAY_SHARED_TOKEN`. The trial helper
MUST NOT execute that command or print generated session ids, concrete pairing
codes, relay URLs, token values, token environment values, local URLs, local
paths, generated runtime commands, stdout, stderr, child output, credentials,
or full secrets.

This requirement MUST NOT start relay, host, viewer, browser, capture, input,
sockets, HTTP listeners, services, startup persistence, unattended access,
privilege elevation, LAN discovery, firewall changes, remote log retrieval,
log upload, hidden sessions, AV/EDR evasion, or Windows prompt bypass.

#### Scenario: Full command plan generates coordinated metadata

- **WHEN** a developer renders the full MVP command plan with
  `--generate-session --generate-pairing`
- **THEN** the host and viewer commands share the same generated session id
  and pairing code
- **AND** the output remains a non-executing visible-session command plan
- **AND** generated metadata is not described as auth or consent

#### Scenario: Role-filtered generation fails closed

- **WHEN** a developer combines `--generate-session` with `--only relay`,
  `--only host`, `--only viewer`, `--only browser`, `--only preflight`, or
  `--preflight-only`
- **THEN** the command kit rejects the invocation before generating metadata
- **AND** diagnostics remain bounded and secret-safe

#### Scenario: Trial plan references bootstrap command

- **WHEN** a developer renders the full two-PC MVP trial plan
- **THEN** the preflight section includes the fixed session bootstrap command
  reference
- **AND** role-scoped trial output remains focused on that role and does not
  print generated session ids or concrete pairing codes
