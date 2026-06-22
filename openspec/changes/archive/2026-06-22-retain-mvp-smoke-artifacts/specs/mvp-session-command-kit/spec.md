## MODIFIED Requirements

### Requirement: MVP session command kit prints validated visible-session commands

The project SHALL provide a root development command kit that prints preflight,
relay, host, viewer, and browser commands for a Windows-to-Windows MVP remote
assistance session. The printed preflight section SHALL instruct the developer
to run the root MVP doctor on each Windows machine and the root MVP smoke check
as a local static preflight before starting the two-PC trial. The printed relay
address guidance SHALL show the validated relay URL, state that `localhost`
relay URLs are only for same-machine trials, and instruct two-PC users to rerun
the command kit with an explicit LAN IP or DNS relay URL for the relay PC. When
the validated relay URL uses a non-loopback hostname, the printed relay command
SHALL explicitly set the development relay bind host to `0.0.0.0` before
starting relay. When the validated relay URL uses an effective port other than
`8787`, the printed relay command SHALL explicitly set `WINBRIDGE_RELAY_PORT`
to that effective port before starting relay. The printed relay command SHALL
use a root helper that builds the workspace packages required by the
development relay before starting relay. The printed host command SHALL require
an explicit host action to run, keep the session visible, prompt the host
interactively before approval, enable host-side terminal controls after active
visible approval, configure metadata-only audit, opt in to host input
application, use a finite Windows capture stream, and request only currently
reviewed permissions. The printed viewer command SHALL configure metadata-only
audit, explicit latest frame output, and a loopback local control surface. The
printed browser step SHALL be a visible PowerShell command that opens the
already validated loopback viewer surface URL on the viewer PC when the
developer explicitly runs it, while keeping that loopback URL inspectable in
the generated output. The printed browser step SHALL include bounded static
guidance that browser pointer actions require `frame=ready` and the visible
`Pointer Off/On` control before pointer input can be sent. The default printed
local audit and latest-frame paths SHALL be backed by runtime sinks that create
safe parent directories on first authorized write, so a fresh checkout does not
require manual `logs` or `frames` directory setup before the developer runs the
printed commands. The root agent helper used by those printed host and viewer
commands SHALL build the workspace packages required by the generated MVP
audit, capture, and input workflow before starting agent-shell.

#### Scenario: Custom relay URL port is printed for relay startup
- **WHEN** the command kit prints commands for a validated relay URL whose effective port is not `8787`
- **THEN** the relay command explicitly sets `WINBRIDGE_RELAY_PORT` to that port
- **AND** the host and viewer commands use the same validated relay URL
- **AND** the command kit itself MUST NOT start relay, host, viewer, browser, capture, input, socket, HTTP, service, startup persistence, privilege, unattended, or Windows prompt actions

### Requirement: MVP session smoke check verifies the local static workflow

The project SHALL provide a root development smoke check that starts a bounded
local relay, host, and viewer session through the existing CLI entrypoints,
using static development frames and explicit visible host authorization. The
smoke check SHALL verify that the viewer publishes a latest-frame file for the
current run, that the loopback viewer surface serves both the generated HTML
and current frame endpoint, and that the loopback viewer surface accepts one
bounded pointer command through its token-protected local `/input` path. The
smoke check MUST stop all child processes after success, failure, timeout, or
interrupt. By default, it SHALL remove the temporary smoke work directory before
exit. When the developer explicitly passes `--keep-artifacts`, the smoke check
SHALL retain the smoke work directory and print bounded metadata identifying
that directory on success. It MUST NOT invoke Windows capture, apply OS input,
launch a browser, install services, configure startup persistence, run
unattended, elevate privileges, collect credentials, read clipboard data,
transfer files, collect diagnostics dumps, evade AV/EDR, bypass Windows
prompts, or hide the host visible-session state.

#### Scenario: Smoke check succeeds for static frame transport

- **WHEN** a developer runs the root MVP smoke check with default options
- **THEN** it starts a local development relay, host, and viewer with a bounded
  static frame stream
- **AND** it waits until the viewer latest-frame output exists for the current
  run
- **AND** it verifies that the loopback viewer surface returns HTML and a JPEG
  or PNG frame response
- **AND** it verifies that the token-protected local `/input` endpoint accepts
  one bounded pointer command
- **AND** it stops relay, host, and viewer processes before exiting
- **AND** it removes the temporary smoke work directory before exit

#### Scenario: Smoke check retains artifacts only when explicitly requested

- **WHEN** a developer runs the root MVP smoke check with `--keep-artifacts`
- **THEN** the same local static workflow checks run
- **AND** relay, host, and viewer processes are still stopped before exit
- **AND** the smoke work directory is retained for local troubleshooting
- **AND** success output includes only bounded artifact directory metadata
- **AND** diagnostics MUST NOT expose raw frame bytes, local surface mutation
  tokens, raw input commands, relay tokens, pairing codes, credentials, private
  reasons, raw child process output, screen contents, input contents, clipboard
  contents, file-transfer contents, or diagnostics dumps

#### Scenario: Smoke check fails closed

- **WHEN** the smoke check times out, a child exits unexpectedly, the frame file
  is not published, the loopback viewer surface does not become ready, the
  viewer surface token is unavailable, or the local `/input` endpoint does not
  accept the bounded command
- **THEN** it exits non-zero with bounded diagnostics
- **AND** it stops any started child processes before returning control
- **AND** diagnostics MUST NOT expose raw frame bytes, mutation tokens, raw
  input commands, tokens, pairing codes, credentials, private reasons, raw
  command output, screen contents, input contents, clipboard contents,
  file-transfer contents, or diagnostics dumps

#### Scenario: Smoke check remains development-scoped

- **WHEN** the smoke check starts the local host and viewer processes
- **THEN** the host approval is explicit in the command arguments and the host
  visible-session option remains enabled
- **AND** the check MUST NOT use `windows-capture`, `--host-apply-input true`,
  browser automation, browser pointer control, keyboard buttons, clipboard,
  macros, file transfer, diagnostics collection, services, startup persistence,
  privilege elevation, unattended access, hidden sessions, or Windows prompt
  bypass
