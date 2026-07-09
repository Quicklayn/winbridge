## ADDED Requirements

### Requirement: Agent shell accepts relay token through an environment variable name

The agent shell CLI SHALL support a bounded `--token-env <ENV_NAME>` option for
host and viewer roles. When supplied, the CLI MUST read the relay shared-token
value from the named environment variable during argument parsing and apply the
same token value validation used by the existing `--token` option. The CLI MUST
reject malformed environment variable names, missing environment values, blank
values, untrimmed values, oversized values, ASCII control characters, Unicode
bidi controls, zero-width formatting controls, and any invocation that combines
`--token` with `--token-env`.

The option MUST NOT change relay authentication semantics, host consent,
visible host session state, authorization grants, capture, input, audit,
revocation, pause, terminate, disconnect, or local control surface behavior.
Usage errors and diagnostics MUST remain bounded and MUST NOT echo token
values, token environment values, pairing codes, relay URLs, local paths,
stdout, stderr, child output, frame bytes, screen contents, input contents,
clipboard contents, credentials, diagnostics dumps, or full secrets.

#### Scenario: Host reads token from env name

- **WHEN** a developer runs the host agent with `--token-env WINBRIDGE_RELAY_SHARED_TOKEN`
  and that environment variable contains a valid bounded token value
- **THEN** argument parsing resolves the token value for the existing relay
  connection configuration
- **AND** diagnostics do not print the token value or environment value

#### Scenario: Viewer reads token from env name

- **WHEN** a developer runs the viewer agent with `--token-env WINBRIDGE_RELAY_SHARED_TOKEN`
  and that environment variable contains a valid bounded token value
- **THEN** argument parsing resolves the token value for the existing relay
  connection configuration
- **AND** runtime consent, authorization, capture, input, audit, and local
  surface behavior remain unchanged

#### Scenario: Ambiguous or unsafe token env input fails closed

- **WHEN** a developer supplies malformed `--token-env`, omits its value, uses
  an unset environment variable, supplies an unsafe environment token value, or
  combines `--token` with `--token-env`
- **THEN** parsing fails before relay startup, protocol messages, listeners,
  capture, input, authorization changes, persistence, or consent bypass
- **AND** diagnostics do not echo token values, environment values, pairing
  codes, credentials, or full secrets
