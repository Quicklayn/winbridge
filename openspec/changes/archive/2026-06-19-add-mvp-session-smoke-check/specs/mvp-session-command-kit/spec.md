## ADDED Requirements

### Requirement: MVP session smoke check verifies the local static workflow

The project SHALL provide a root development smoke check that starts a bounded
local relay, host, and viewer session through the existing CLI entrypoints,
using static development frames and explicit visible host authorization. The
smoke check SHALL verify that the viewer publishes a latest-frame file for the
current run and that the loopback viewer surface serves both the generated HTML
and current frame endpoint. The smoke check MUST stop all child processes after
success, failure, timeout, or interrupt. It MUST NOT invoke Windows capture,
apply OS input, launch a browser, install services, configure startup
persistence, run unattended, elevate privileges, collect credentials, read
clipboard data, transfer files, collect diagnostics dumps, evade AV/EDR, bypass
Windows prompts, or hide the host visible-session state.

#### Scenario: Smoke check succeeds for static frame transport

- **WHEN** a developer runs the root MVP smoke check with default options
- **THEN** it starts a local development relay, host, and viewer with a bounded
  static frame stream
- **AND** it waits until the viewer latest-frame output exists for the current
  run
- **AND** it verifies that the loopback viewer surface returns HTML and a JPEG
  or PNG frame response
- **AND** it stops relay, host, and viewer processes before exiting

#### Scenario: Smoke check fails closed

- **WHEN** the smoke check times out, a child exits unexpectedly, the frame file
  is not published, or the loopback viewer surface does not become ready
- **THEN** it exits non-zero with bounded diagnostics
- **AND** it stops any started child processes before returning control
- **AND** diagnostics MUST NOT expose raw frame bytes, tokens, pairing codes,
  credentials, private reasons, raw command output, screen contents, input
  contents, clipboard contents, file-transfer contents, or diagnostics dumps

#### Scenario: Smoke check remains development-scoped

- **WHEN** the smoke check starts the local host and viewer processes
- **THEN** the host approval is explicit in the command arguments and the host
  visible-session option remains enabled
- **AND** the check MUST NOT use `windows-capture`, `--host-apply-input true`,
  browser pointer control, command-box input, keyboard buttons, clipboard,
  macros, file transfer, diagnostics collection, services, startup persistence,
  privilege elevation, unattended access, hidden sessions, or Windows prompt
  bypass
