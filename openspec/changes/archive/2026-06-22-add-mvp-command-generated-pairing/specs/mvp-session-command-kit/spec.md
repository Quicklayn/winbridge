## MODIFIED Requirements

### Requirement: MVP session command kit prints validated visible-session commands

The project SHALL provide a root development command kit that prints preflight,
relay, host, viewer, and browser commands for a Windows-to-Windows MVP remote
assistance session. The printed preflight section SHALL instruct the developer
to run the root MVP ready helper before the two-PC trial, and SHALL also list
the root MVP doctor, root MVP native preflight, and root MVP smoke check as
manual troubleshooting preflight commands. When invoked with `--generate-pairing`,
the command kit SHALL generate a fresh bounded pairing code matching `NNN-NNN`
and use it consistently in the printed host and viewer commands. When invoked
with `--json`, the command kit SHALL emit bounded machine-readable command-plan
metadata for the same validated non-executing plan, including a bounded
`preflight.ready` command record and any generated pairing code only inside the
generated host/viewer command strings. When invoked with `--preflight-only`, the
command kit SHALL print only the bounded preflight commands and safety notes
needed before a two-PC trial, and MUST NOT print relay, host, viewer, browser,
capture, input, token, Start-Process, pairing, or live session command steps.
When invoked with both `--preflight-only` and `--json`, the command kit SHALL
emit bounded machine-readable metadata only for that preflight command plan,
including `preflight.ready`. The printed relay address guidance SHALL show the
validated relay URL, state that `localhost` relay URLs are only for same-machine
trials, and instruct two-PC users to rerun the command kit with an explicit LAN
IP or DNS relay URL for the relay PC. When the validated relay URL uses a
non-loopback hostname, the printed relay command SHALL explicitly set the
development relay bind host to `0.0.0.0` before starting relay. When the
validated relay URL uses an effective port other than `8787`, the printed relay
command SHALL explicitly set `WINBRIDGE_RELAY_PORT` to that effective port
before starting relay. The printed relay command SHALL use a root helper that
builds the workspace packages required by the development relay before starting
relay. The printed host command SHALL require an explicit host action to run,
keep the session visible, prompt the host interactively before approval, enable
host-side terminal controls after active visible approval, configure
metadata-only audit, opt in to host input application, use a finite Windows
capture stream, and request only currently reviewed permissions. The printed
viewer command SHALL configure metadata-only audit, explicit latest frame
output, and a loopback local control surface. The printed browser step SHALL be
a visible PowerShell command that opens the already validated loopback viewer
surface URL on the viewer PC when the developer explicitly runs it, while
keeping that loopback URL inspectable in the generated output. The printed
browser step SHALL include bounded static guidance that browser pointer actions
require `frame=ready` and the visible `Pointer Off/On` control before pointer
input can be sent. The default printed local audit and latest-frame paths SHALL
be backed by runtime sinks that create safe parent directories on first
authorized write, so a fresh checkout does not require manual `logs` or `frames`
directory setup before the developer runs the printed commands. The root agent
helper used by those printed host and viewer commands SHALL build the workspace
packages required by the generated MVP audit, capture, and input workflow before
starting agent-shell.

#### Scenario: Generated pairing is used consistently

- **WHEN** a developer runs the command kit with `--generate-pairing`
- **THEN** the printed host and viewer commands use the same generated `NNN-NNN`
  pairing code
- **AND** the command kit itself MUST NOT start relay, host, viewer, browser,
  capture, input, socket, HTTP, service, startup persistence, privilege,
  unattended, or Windows prompt actions

#### Scenario: JSON generated pairing remains bounded

- **WHEN** a developer runs the command kit with `--generate-pairing --json`
- **THEN** the generated host and viewer command records use the same generated
  `NNN-NNN` pairing code
- **AND** JSON output MUST NOT include raw relay token values, credentials,
  frame bytes, input payloads, clipboard contents, file-transfer contents,
  diagnostics dumps, or full secrets

### Requirement: MVP session command kit fails closed on malformed input

The command kit SHALL validate all configurable values before printing a
command. Malformed values MUST fail closed with bounded usage diagnostics before
printing relay, host, viewer, browser, token, capture, input, audit, process, or
surface commands. The `--json` flag and `--generate-pairing` flag SHALL be
accepted only as flag-only options. The `--generate-pairing` flag MUST be
rejected when combined with an explicit `--pairing` value or preflight-only mode.
The `--preflight-only` flag SHALL be accepted as a sole flag-only invocation or
with `--json`; malformed combinations MUST fail closed with bounded usage
diagnostics.

#### Scenario: Malformed generated pairing option is rejected

- **WHEN** a developer passes duplicate `--generate-pairing`, gives it a value,
  combines it with `--pairing`, or combines it with `--preflight-only`
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
