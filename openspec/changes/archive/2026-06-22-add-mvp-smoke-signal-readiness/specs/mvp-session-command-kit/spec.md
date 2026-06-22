## MODIFIED Requirements

### Requirement: MVP session smoke check verifies the local static workflow

The project SHALL provide a root development smoke check that starts a bounded
local relay, host, and viewer session through the existing CLI entrypoints,
using static development frames and explicit visible host authorization. The
smoke check SHALL verify that the viewer publishes a latest-frame file for the
current run, that the loopback viewer surface serves both the generated HTML
and current frame endpoint, that the loopback viewer status endpoint reports
the bounded host acknowledgement readiness flag
`signalProbeAckReceived=true` for the current consent-bound signal probe, and
that the loopback viewer surface accepts one bounded pointer command through
its token-protected local `/input` path. The smoke check MUST stop all child
processes after success, failure, timeout, or interrupt. By default, it SHALL
remove the temporary smoke work directory before exit. When the developer
explicitly passes `--keep-artifacts`, the smoke check SHALL retain the smoke
work directory and print bounded metadata identifying that directory on success.
When invoked with `--json`, the smoke check SHALL emit bounded
machine-readable result metadata containing only `ok`, optional safe reason
codes, per-check bounded status records, artifact cleanup state, and the
retained artifact directory only when explicitly requested with
`--keep-artifacts`. It MUST NOT invoke Windows capture, apply OS input, launch
a browser, install services, configure startup persistence, run unattended,
elevate privileges, collect credentials, read clipboard data, transfer files,
collect diagnostics dumps, evade AV/EDR, bypass Windows prompts, or hide the
host visible-session state.

#### Scenario: Smoke check emits bounded JSON success

- **WHEN** a developer runs the root MVP smoke check with `--json`
- **THEN** it emits JSON with bounded success status and per-check metadata for
  relay, frame, surface, signal, and input readiness
- **AND** default JSON output states artifacts were cleaned
- **AND** JSON output MUST NOT include frame paths, surface URLs, mutation
  tokens, authorization ids, raw signal payloads, raw input commands, raw child
  process output, relay tokens, pairing codes, credentials, private reasons,
  screen contents, input contents, clipboard contents, file-transfer contents,
  diagnostics dumps, or full secrets

#### Scenario: Smoke check emits bounded JSON failure

- **WHEN** the smoke check fails while invoked with `--json`
- **THEN** it emits JSON with `ok=false` and only a safe bounded reason code when
  one is available
- **AND** diagnostics MUST NOT expose raw frame bytes, mutation tokens,
  authorization ids, raw signal payloads, raw input commands, tokens, pairing
  codes, credentials, private reasons, raw command output, screen contents,
  input contents, clipboard contents, file-transfer contents, diagnostics dumps,
  or full secrets

#### Scenario: Smoke check succeeds for static frame transport

- **WHEN** a developer runs the root MVP smoke check with default options
- **THEN** it starts a local development relay, host, and viewer with a bounded
  static frame stream, host signal acknowledgement enabled, and a bounded viewer
  signal probe
- **AND** it waits until the viewer latest-frame output exists for the current
  run
- **AND** it verifies that the loopback viewer surface returns HTML and a JPEG
  or PNG frame response
- **AND** it verifies that the sanitized loopback viewer status endpoint reports
  `signalProbeAckReceived=true`
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
  tokens, authorization ids, raw signal payloads, raw input commands, relay
  tokens, pairing codes, credentials, private reasons, raw child process output,
  screen contents, input contents, clipboard contents, file-transfer contents,
  or diagnostics dumps

#### Scenario: Smoke check fails closed

- **WHEN** the smoke check times out, a child exits unexpectedly, the frame file
  is not published, the loopback viewer surface does not become ready, the
  viewer signal acknowledgement readiness flag is not observed, the viewer
  surface token is unavailable, or the local `/input` endpoint does not accept
  the bounded command
- **THEN** it exits non-zero with bounded diagnostics
- **AND** it stops any started child processes before returning control
- **AND** diagnostics MUST NOT expose raw frame bytes, mutation tokens,
  authorization ids, raw signal payloads, raw input commands, tokens, pairing
  codes, credentials, private reasons, raw command output, screen contents,
  input contents, clipboard contents, file-transfer contents, or diagnostics
  dumps

#### Scenario: Smoke check remains development-scoped

- **WHEN** the smoke check starts the local host and viewer processes
- **THEN** the host approval is explicit in the command arguments and the host
  visible-session option remains enabled
- **AND** the development signal probe remains non-authorizing readiness
  metadata
- **AND** the check MUST NOT use `windows-capture`, `--host-apply-input true`,
  browser automation, browser pointer control, keyboard buttons, clipboard,
  macros, file transfer, diagnostics collection, services, startup persistence,
  privilege elevation, unattended access, hidden sessions, or Windows prompt
  bypass
