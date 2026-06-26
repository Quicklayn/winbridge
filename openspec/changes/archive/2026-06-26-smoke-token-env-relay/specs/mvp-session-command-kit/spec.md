# Delta: MVP session command kit

## ADDED Requirements

### Requirement: MVP smoke check supports token-env protected relay mode

The root MVP smoke check SHALL support an explicit `--token-env <NAME>` option
that reads a bounded relay shared-token value from the named environment
variable, configures the local relay child with `WINBRIDGE_RELAY_SHARED_TOKEN`,
and passes the same token to the local host and viewer children through their
existing token option. The option MUST reject raw token command-line values,
malformed or duplicate environment-variable names, and missing or malformed
environment token values before starting child processes. Human and JSON smoke
output and diagnostics MUST NOT expose raw token values, token environment
values, child command strings, child environment maps, relay URLs, pairing
codes, child output, credentials, screen contents, input contents, clipboard
contents, or full secrets. The token-env mode MUST preserve the existing local
static-frame smoke workflow, visible host approval, active-session indicator
verification, host revoke/lifecycle denial, audit checks, viewer disconnect,
cleanup behavior, and prohibition on Windows capture, OS input application,
browser automation, services, startup persistence, unattended access,
privilege elevation, credential access, keylogging, AV/EDR evasion, Windows
prompt bypass, and hidden-session behavior.

#### Scenario: Token-env smoke verifies token-protected local relay connection

- **WHEN** a developer runs `npm run mvp:smoke -- --token-env WINBRIDGE_RELAY_SHARED_TOKEN`
  with a valid bounded token value in that environment variable
- **THEN** the smoke helper starts the relay with
  `WINBRIDGE_RELAY_SHARED_TOKEN`
- **AND** it starts host and viewer children with the same token through the
  existing token option
- **AND** the existing relay, visible indicator, frame, surface, signal,
  surface guard, input, audit, lifecycle, and viewer-disconnect checks pass
  through the token-protected relay path
- **AND** smoke output reports only bounded fixed check metadata

#### Scenario: Unsafe token-env smoke input fails closed

- **WHEN** a developer supplies raw `--token`, a missing `--token-env` value, a
  malformed environment-variable name, a duplicate token-env option, a missing
  environment token value, or a malformed environment token value
- **THEN** the smoke helper rejects the input before starting relay, host, or
  viewer children
- **AND** diagnostics do not echo raw unsafe input, token values, environment
  values, command strings, child output, pairing codes, credentials, screen
  contents, input contents, or full secrets

#### Scenario: LAN-style smoke can remain token protected without public bind

- **WHEN** a developer combines `--lan-relay` with `--token-env`
- **THEN** the smoke helper still uses the reviewed same-machine
  `ws://127.0.0.1:<port>/` relay URL internally
- **AND** it does not configure LAN or public relay bind settings, discovery,
  firewall changes, services, startup persistence, unattended access, hidden
  sessions, Windows capture, OS input application, or browser automation

