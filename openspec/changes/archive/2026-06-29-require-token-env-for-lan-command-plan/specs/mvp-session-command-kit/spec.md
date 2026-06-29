## ADDED Requirements

### Requirement: MVP command kit requires token-env for LAN session plans

The MVP command kit SHALL reject full-session command plans that target a
non-loopback relay URL unless a bounded `--token-env <NAME>` option is provided.
This requirement applies to `--relay-host <host>` shortcuts and full `--relay
ws://<non-loopback-host>:<port>/` or `wss://<non-loopback-host>:<port>/` URLs.
The rejection MUST happen before rendering relay, host, viewer, browser, JSON,
or role-filter runtime commands and diagnostics MUST NOT echo relay hosts, relay
URLs, token environment values, command text, credentials, pairing codes, local
paths, stdout, stderr, child output, or raw input. Loopback-only localhost
session plans and preflight-only command output MAY remain available without
`--token-env`.

#### Scenario: LAN relay-host shortcut requires token-env

- **WHEN** a developer requests a full-session command plan with
  `--relay-host <non-loopback-host>` and omits `--token-env`
- **THEN** the command kit rejects the request before rendering any runtime
  commands
- **AND** diagnostics remain bounded and do not echo the relay host

#### Scenario: Non-loopback relay URL requires token-env

- **WHEN** a developer requests a full-session command plan with a non-loopback
  `--relay` URL and omits `--token-env`
- **THEN** the command kit rejects the request before rendering any runtime
  commands
- **AND** diagnostics remain bounded and do not echo the relay URL

#### Scenario: LAN command plan with token-env remains valid

- **WHEN** a developer requests a full-session LAN command plan with
  `--token-env <NAME>`
- **THEN** the command kit renders the existing LAN relay bind behavior
- **AND** the host, viewer, and all-smoke preflight commands reference the token
  environment variable without printing raw token values

### Requirement: MVP ready validates tokenized LAN command plan

The root MVP ready helper SHALL validate the representative LAN command plan
through `--token-env WINBRIDGE_RELAY_SHARED_TOKEN`. The `lan-command-plan`
readiness check MUST fail closed when the generated LAN command plan omits the
expected token environment references, omits the LAN relay URL, or omits the
reviewed relay bind host. Failure output MUST remain bounded and MUST NOT echo
relay URLs, token environment values, command text, stdout, stderr, child
output, credentials, pairing codes, or raw input.

#### Scenario: Ready LAN command plan includes token-env

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the helper validates a representative LAN command plan that includes
  `--token-env WINBRIDGE_RELAY_SHARED_TOKEN`
- **AND** the check requires both LAN relay routing and token-env references

#### Scenario: Ready fails tokenless LAN plan drift

- **WHEN** the representative LAN command-plan output omits expected token-env
  references
- **THEN** `lan-command-plan` fails with bounded `exit-nonzero` metadata
- **AND** diagnostics do not echo relay URLs, token environment values, command
  text, stdout, stderr, child output, credentials, or raw input
