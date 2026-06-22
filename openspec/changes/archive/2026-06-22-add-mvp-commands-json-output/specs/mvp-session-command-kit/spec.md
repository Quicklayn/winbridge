## MODIFIED Requirements

### Requirement: MVP session command kit prints validated visible-session commands

The project SHALL provide a root development command kit that prints preflight,
relay, host, viewer, and browser commands for a Windows-to-Windows MVP remote
assistance session. The printed preflight section SHALL instruct the developer
to run the root MVP doctor and root MVP native preflight on each Windows
machine, and the root MVP smoke check as a local static preflight before
starting the two-PC trial. When invoked with `--json`, the command kit SHALL
emit bounded machine-readable command-plan metadata for the same validated
non-executing plan. When invoked with `--preflight-only`, the command kit SHALL
print only the bounded preflight commands and safety notes needed before a
two-PC trial, and MUST NOT print relay, host, viewer, browser, capture, input,
token, Start-Process, or live session command steps. When invoked with both
`--preflight-only` and `--json`, the command kit SHALL emit bounded
machine-readable metadata only for that preflight command plan. The printed
relay address guidance SHALL show the validated relay URL, state that
`localhost` relay URLs are only for same-machine trials, and instruct two-PC
users to rerun the command kit with an explicit LAN IP or DNS relay URL for the
relay PC. When the validated relay URL uses a non-loopback hostname, the printed
relay command SHALL explicitly set the development relay bind host to `0.0.0.0`
before starting relay. When the validated relay URL uses an effective port other
than `8787`, the printed relay command SHALL explicitly set
`WINBRIDGE_RELAY_PORT` to that effective port before starting relay. The printed
relay command SHALL use a root helper that builds the workspace packages
required by the development relay before starting relay. The printed host
command SHALL require an explicit host action to run, keep the session visible,
prompt the host interactively before approval, enable host-side terminal
controls after active visible approval, configure metadata-only audit, opt in
to host input application, use a finite Windows capture stream, and request only
currently reviewed permissions. The printed viewer command SHALL configure
metadata-only audit, explicit latest frame output, and a loopback local control
surface. The printed browser step SHALL be a visible PowerShell command that
opens the already validated loopback viewer surface URL on the viewer PC when
the developer explicitly runs it, while keeping that loopback URL inspectable in
the generated output. The printed browser step SHALL include bounded static
guidance that browser pointer actions require `frame=ready` and the visible
`Pointer Off/On` control before pointer input can be sent. The default printed
local audit and latest-frame paths SHALL be backed by runtime sinks that create
safe parent directories on first authorized write, so a fresh checkout does not
require manual `logs` or `frames` directory setup before the developer runs the
printed commands. The root agent helper used by those printed host and viewer
commands SHALL build the workspace packages required by the generated MVP
audit, capture, and input workflow before starting agent-shell.

#### Scenario: JSON output contains full command plan without execution

- **WHEN** a developer runs the command kit with `--json`
- **THEN** it emits JSON containing bounded command records for preflight,
  relay, host, viewer, and browser steps
- **AND** it states the plan is non-executing
- **AND** JSON output MUST NOT include raw relay token values, credentials,
  frame bytes, input payloads, clipboard contents, file-transfer contents,
  diagnostics dumps, or full secrets
- **AND** the command kit itself MUST NOT start relay, host, viewer, browser,
  capture, input, socket, HTTP, service, startup persistence, privilege,
  unattended, or Windows prompt actions

#### Scenario: JSON preflight-only output excludes live session commands

- **WHEN** a developer runs the command kit with `--preflight-only --json`
- **THEN** it emits JSON containing only the root MVP doctor, root MVP native
  preflight, and root MVP smoke commands
- **AND** it MUST NOT include relay, host, viewer, browser, capture, input,
  token, `Start-Process`, socket, HTTP listener, service, startup persistence,
  privilege, unattended, or Windows prompt action commands
- **AND** it states that host consent and visible sessions remain required for
  live trials

#### Scenario: Preflight-only output excludes live session commands

- **WHEN** a developer runs the command kit with `--preflight-only`
- **THEN** it prints the root MVP doctor and root MVP native preflight commands
  for each Windows machine
- **AND** it prints the root MVP smoke check command for one local development
  machine
- **AND** it MUST NOT print relay, host, viewer, browser, capture, input, token,
  `Start-Process`, socket, HTTP listener, service, startup persistence,
  privilege, unattended, or Windows prompt action commands
- **AND** it states that the helper printed commands only and host consent and
  visible sessions remain required for live trials

#### Scenario: Custom relay URL port is printed for relay startup
- **WHEN** the command kit prints commands for a validated relay URL whose effective port is not `8787`
- **THEN** the relay command explicitly sets `WINBRIDGE_RELAY_PORT` to that port
- **AND** the host and viewer commands use the same validated relay URL
- **AND** the command kit itself MUST NOT start relay, host, viewer, browser, capture, input, socket, HTTP, service, startup persistence, privilege, unattended, or Windows prompt actions

### Requirement: MVP session command kit fails closed on malformed input

The command kit SHALL validate all configurable values before printing a
command. Malformed values MUST fail closed with bounded usage diagnostics before
printing relay, host, viewer, browser, token, capture, input, audit, process, or
surface commands. The `--json` flag SHALL be accepted only as a flag-only
option. The `--preflight-only` flag SHALL be accepted as a sole flag-only
invocation or with `--json`; malformed combinations MUST fail closed with
bounded usage diagnostics.

#### Scenario: Malformed JSON command option is rejected

- **WHEN** a developer passes duplicate `--json`, gives `--json` a value, or
  combines `--preflight-only` with value options
- **THEN** the command kit exits through bounded usage handling before printing
  any session commands
- **AND** diagnostics MUST NOT echo raw rejected values, tokens, pairing codes,
  credentials, paths containing secrets, screen contents, input contents, or
  full secrets

#### Scenario: Malformed preflight-only option is rejected

- **WHEN** a developer combines `--preflight-only` with another option or value
  other than `--json`
- **THEN** the command kit exits through bounded usage handling before printing
  any session commands
- **AND** diagnostics MUST NOT echo raw rejected values, tokens, pairing codes,
  credentials, paths containing secrets, screen contents, input contents, or
  full secrets

#### Scenario: Malformed command option is rejected

- **WHEN** a developer passes an unknown option, duplicate option, invalid
  session id, invalid pairing code, non-WebSocket relay URL, relay URL with
  embedded credentials or token query, unsafe audit path, unsafe frame path,
  unsafe viewer surface port, unsafe capture count, unsafe capture interval, or
  unsafe capture delay
- **THEN** the command kit exits through bounded usage handling before printing
  any session commands
- **AND** diagnostics MUST NOT echo raw rejected values, tokens, pairing codes,
  credentials, paths containing secrets, screen contents, input contents, or
  full secrets

#### Scenario: Unsafe token handling is rejected

- **WHEN** a developer attempts to pass a raw relay token or an invalid token
  environment variable name to the command kit
- **THEN** the command kit rejects the invocation before printing commands
- **AND** diagnostics MUST NOT echo the raw token value, credentials, pairing
  codes, private reasons, command output, or full secrets
