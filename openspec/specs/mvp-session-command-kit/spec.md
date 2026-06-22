# mvp-session-command-kit Specification

## Purpose
TBD - created by archiving change add-mvp-session-command-kit. Update Purpose after archive.
## Requirements
### Requirement: MVP session command kit prints validated visible-session commands

The MVP command kit MUST print a validated, non-executing, ordered PowerShell
command plan for a visible development relay, host, viewer, and viewer browser
surface. The plan MUST include explicit preflight commands, a relay command, a
host command with interactive consent prompt, visible-session state, host
control prompt, local audit path, explicit host input opt-in, explicit host
signal probe acknowledgement, explicit bounded host display-name metadata,
finite Windows capture scheduling, a viewer command that requests
`screen:view`, `input:pointer`, and `input:keyboard`, explicit bounded viewer
display-name metadata for the host consent prompt, an explicit bounded viewer
request reason for the host consent prompt, an explicit bounded viewer signal
probe delay for authorization readiness metadata, a viewer latest-frame output
path, a loopback local viewer control surface port, a browser open command for
that loopback surface, and host-side pause, resume, revoke, terminate, and
disconnect controls. When invoked with `--relay-host`, the command kit MUST
accept only a bounded host name or IPv4 literal without a scheme, port, path,
query, fragment, loopback, unspecified, or secret-bearing metadata and MUST
generate the relay URL `ws://<relay-host>:8787/` for the same non-executing
command plan. The command kit MUST support a bounded
`--capture-duration-minutes` option that derives a finite host
`--dev-screen-frame-count` from the capture interval while preserving the
existing finite frame-count bound. The command kit MUST support a bounded
`--viewer-signal-probe-after-ms` option that only changes the printed viewer
probe delay and does not authorize access.

#### Scenario: Command plan includes signal probe readiness flags

- **WHEN** a developer runs the command kit with default signal probe options
- **THEN** the printed host command includes `--host-signal-probe-ack true`
- **AND** the printed viewer command includes a bounded
  `--viewer-signal-probe-after-ms` value
- **AND** the printed plan describes the signal probe as non-authorizing
  readiness metadata

#### Scenario: Custom signal probe delay is rendered

- **WHEN** a developer runs the command kit with
  `--viewer-signal-probe-after-ms 0`
- **THEN** the printed viewer command includes
  `--viewer-signal-probe-after-ms '0'`
- **AND** the helper does not treat the probe as authentication or
  authorization

### Requirement: MVP session command kit fails closed on malformed input

The MVP command kit MUST reject malformed, duplicate, ambiguous, unsafe, or
secret-bearing options before rendering relay, host, viewer, browser, token, or
preflight commands. It MUST reject raw relay token values and accept only a
bounded environment variable name for token references. It MUST reject relay
URLs that contain credentials, token query parameters, search parameters,
fragments, unsupported schemes, or unsafe scalar characters. It MUST reject
unsafe file paths, unsafe identifiers, invalid ports, invalid capture cadence
values, invalid signal probe delay values, invalid `--generate-pairing`
combinations, invalid preflight-only combinations, unsafe host or viewer
display names, unsafe request reasons, and invalid JSON/preflight flags without
echoing raw unsafe input in diagnostics. The `--relay-host` shortcut MUST be
rejected when it is malformed, loopback, unspecified, secret-bearing, or
combined with `--relay`. The `--capture-duration-minutes` option MUST be
rejected when malformed, combined with `--capture-count`, or when its derived
finite frame count exceeds the supported command-kit frame-stream bound.

#### Scenario: Unsafe signal probe delay is rejected

- **WHEN** a developer supplies a blank, fractional, negative, oversized,
  non-numeric, or unsafe `--viewer-signal-probe-after-ms` value
- **THEN** the command kit rejects the input before rendering commands
- **AND** the error output remains bounded and does not echo raw unsafe input

### Requirement: MVP session command kit remains non-executing and development-scoped

The command kit SHALL only format text for a development MVP workflow. It MUST
NOT spawn child processes, open sockets, start HTTP listeners, connect to the
relay, capture the screen, inject input, write audit files, read or write frame
files, install services, configure startup persistence, elevate privileges,
collect credentials, read clipboard data, transfer files, collect diagnostics
dumps, evade AV/EDR, bypass Windows prompts, or keep background handles alive.

#### Scenario: Command kit prints without side effects

- **WHEN** a developer runs the command kit successfully
- **THEN** it prints the command sequence and exits
- **AND** it MUST NOT create a relay connection, start a host, start a viewer,
  start the viewer surface, capture screen frames, apply input, persist audit
  records, write frame bytes, or create background processes

#### Scenario: Command kit failure has no remote side effects

- **WHEN** command kit validation fails
- **THEN** it exits before printing runnable session commands
- **AND** it MUST NOT start capture, send input, reconnect peers, grant
  permissions, suppress host visibility, install persistence, or bypass consent

### Requirement: MVP session smoke check verifies the local static workflow

The project SHALL provide a root development smoke check that starts a bounded
local relay, host, and viewer session through the existing CLI entrypoints,
using static development frames and explicit visible host authorization. The
smoke check SHALL verify that the viewer publishes a latest-frame file for the
current run, that the loopback viewer surface serves both the generated HTML
and current frame endpoint, that the loopback viewer status endpoint reports
the bounded host acknowledgement readiness flag
`signalProbeAckReceived=true` for the current consent-bound signal probe, that
the loopback viewer surface accepts one bounded pointer command through its
token-protected local `/input` path, and that both configured host and viewer
local JSONL audit files contain bounded schema-like audit records for the smoke
run. The smoke check MUST stop all child processes after success, failure,
timeout, or interrupt. By default, it SHALL remove the temporary smoke work
directory before exit. When the developer explicitly passes `--keep-artifacts`,
the smoke check SHALL retain the smoke work directory and print bounded
metadata identifying that directory on success. When invoked with `--json`, the
smoke check SHALL emit bounded machine-readable result metadata containing only
`ok`, optional safe reason codes, per-check bounded status records, artifact
cleanup state, and the retained artifact directory only when explicitly
requested with `--keep-artifacts`. It MUST NOT invoke Windows capture, apply OS
input, launch a browser, install services, configure startup persistence, run
unattended, elevate privileges, collect credentials, read clipboard data,
transfer files, collect diagnostics dumps, evade AV/EDR, bypass Windows
prompts, or hide the host visible-session state.

#### Scenario: Smoke check emits bounded JSON success

- **WHEN** a developer runs the root MVP smoke check with `--json`
- **THEN** it emits JSON with bounded success status and per-check metadata for
  relay, frame, surface, signal, input, and audit readiness
- **AND** default JSON output states artifacts were cleaned
- **AND** JSON output MUST NOT include frame paths, surface URLs, audit paths,
  raw audit contents, mutation tokens, authorization ids, raw signal payloads,
  raw input commands, raw child process output, relay tokens, pairing codes,
  credentials, private reasons, screen contents, input contents, clipboard
  contents, file-transfer contents, diagnostics dumps, or full secrets

#### Scenario: Smoke check emits bounded JSON failure

- **WHEN** the smoke check fails while invoked with `--json`
- **THEN** it emits JSON with `ok=false` and only a safe bounded reason code when
  one is available
- **AND** for known relay, frame, surface, signal, input, or audit step failures,
  it MAY emit fixed subcheck status records using only fixed subcheck names,
  boolean `ok` values, and optional boolean `skipped` markers
- **AND** failure subcheck records MUST NOT include local paths, URLs, commands,
  ports, process ids, raw exceptions, stdout, stderr, frame bytes, audit paths,
  raw audit contents, mutation tokens, authorization ids, raw signal payloads,
  raw input commands, tokens, pairing codes, credentials, private reasons,
  screen contents, input contents, clipboard contents, file-transfer contents,
  diagnostics dumps, or full secrets
- **AND** diagnostics MUST NOT expose raw frame bytes, audit paths, raw audit
  contents, mutation tokens, authorization ids, raw signal payloads, raw input
  commands, tokens, pairing codes, credentials, private reasons, raw command
  output, screen contents, input contents, clipboard contents, file-transfer
  contents, diagnostics dumps, or full secrets

#### Scenario: Smoke check succeeds for static frame transport

- **WHEN** a developer runs the root MVP smoke check with default options
- **THEN** it starts a local development relay, host, and viewer with a bounded
  static frame stream, host signal acknowledgement enabled, bounded viewer
  signal probe, and configured local host/viewer audit paths
- **AND** it waits until the viewer latest-frame output exists for the current
  run
- **AND** it verifies that the loopback viewer surface returns HTML and a JPEG
  or PNG frame response
- **AND** it verifies that the sanitized loopback viewer status endpoint reports
  `signalProbeAckReceived=true`
- **AND** it verifies that the token-protected local `/input` endpoint accepts
  one bounded pointer command
- **AND** it verifies that both host and viewer audit JSONL files contain
  bounded schema-like audit records
- **AND** it stops relay, host, and viewer processes before exiting
- **AND** it removes the temporary smoke work directory before exit

#### Scenario: Smoke check retains artifacts only when explicitly requested

- **WHEN** a developer runs the root MVP smoke check with `--keep-artifacts`
- **THEN** the same local static workflow checks run
- **AND** relay, host, and viewer processes are still stopped before exit
- **AND** the smoke work directory is retained for local troubleshooting
- **AND** success output includes only bounded artifact directory metadata
- **AND** diagnostics MUST NOT expose raw frame bytes, audit paths, raw audit
  contents, local surface mutation tokens, authorization ids, raw signal
  payloads, raw input commands, relay tokens, pairing codes, credentials,
  private reasons, raw child process output, screen contents, input contents,
  clipboard contents, file-transfer contents, or diagnostics dumps

#### Scenario: Smoke check fails closed

- **WHEN** the smoke check times out, a child exits unexpectedly, the frame file
  is not published, the loopback viewer surface does not become ready, the
  viewer signal acknowledgement readiness flag is not observed, the viewer
  surface token is unavailable, the local `/input` endpoint does not accept the
  bounded command, or either local audit JSONL file is absent, empty, or
  malformed
- **THEN** it exits non-zero with bounded diagnostics
- **AND** it stops any started child processes before returning control
- **AND** diagnostics MUST NOT expose raw frame bytes, audit paths, raw audit
  contents, mutation tokens, authorization ids, raw signal payloads, raw input
  commands, tokens, pairing codes, credentials, private reasons, raw command
  output, screen contents, input contents, clipboard contents, file-transfer
  contents, or diagnostics dumps

#### Scenario: Smoke check remains development-scoped

- **WHEN** the smoke check starts the local host and viewer processes
- **THEN** the host approval is explicit in the command arguments and the host
  visible-session option remains enabled
- **AND** the development signal probe remains non-authorizing readiness
  metadata
- **AND** audit verification only reads the configured local smoke audit files
- **AND** the check MUST NOT use `windows-capture`, `--host-apply-input true`,
  browser automation, browser pointer control, keyboard buttons, clipboard,
  macros, file transfer, diagnostics collection, services, startup persistence,
  privilege elevation, unattended access, hidden sessions, or Windows prompt
  bypass

### Requirement: MVP doctor validates local readiness without side effects

`npm run mvp:doctor` SHALL validate local MVP readiness before a two-PC trial
without starting relay, host, viewer, browser, capture, input, services,
startup persistence, unattended access, or network listeners. The doctor SHALL
check the local Windows platform, supported Node runtime, required root scripts
including `mvp:ready` and `mvp:native-preflight`, required workspace manifests,
required root MVP helper script entrypoints, and required source entrypoints for
the relay, protocol, audit, Windows capture, Windows input, and critical
agent-shell MVP modules including host controls, viewer controls, viewer frame
output, viewer local control surface, screen-frame output, and CLI shutdown.
Its default success output SHALL include bounded readiness lines for platform,
Node, scripts, workspaces, entrypoints, and visible-consent safety. When invoked
with `--json`, it SHALL emit bounded machine-readable readiness metadata
containing only `ok`, optional bounded reason codes, and per-check bounded
status records. Its failure output SHALL use bounded reason codes only and MUST
NOT include raw paths, tokens, pairing codes, credentials, screen contents,
keystrokes, or full secrets.

#### Scenario: Doctor fails when a critical agent-shell MVP module is missing

- **WHEN** a critical agent-shell MVP module required by the generated two-PC
  command plan is missing
- **THEN** the doctor exits with a bounded `missing-entrypoint` reason
- **AND** the output MUST NOT include the missing path, tokens, pairing codes,
  credentials, screen contents, keystrokes, or full secrets

### Requirement: MVP native preflight validates native Windows readiness without side effects

`npm run mvp:native-preflight` SHALL validate local Windows native prerequisites
for the development MVP host path without invoking screen capture, applying OS
input, starting relay, host, viewer, browser, sockets, HTTP listeners, services,
startup persistence, unattended access, privilege elevation, clipboard, file
transfer, diagnostics dumps, AV/EDR evasion, Windows prompt bypass, or hidden
session behavior. The preflight SHALL check Windows platform, bounded
PowerShell execution, capture prerequisite assembly/type availability, and input
wrapper compilation readiness. Default success output SHALL be bounded
readiness metadata only. When invoked with `--json`, it SHALL emit bounded
machine-readable readiness metadata containing only `ok`, optional bounded
reason codes, and per-check bounded status records. Failure output SHALL use
bounded reason codes only and MUST NOT echo raw PowerShell output, local file
paths, tokens, pairing codes, credentials, screen contents, input contents,
keystrokes, private reasons, or full secrets.

#### Scenario: Native preflight passes on a prepared Windows host
- **WHEN** a developer runs `npm run mvp:native-preflight` on a Windows machine where the fixed PowerShell prerequisite checks succeed
- **THEN** it reports bounded readiness lines for Windows platform, PowerShell, capture prerequisites, input prerequisites, and read-only safety
- **AND** it exits without starting WinBridge runtime processes, opening network listeners, capturing the screen, applying input, writing files, launching a browser, installing services, configuring startup persistence, elevating privileges, running unattended, or bypassing Windows prompts

#### Scenario: Native preflight emits bounded JSON readiness
- **WHEN** a developer runs `npm run mvp:native-preflight -- --json`
- **THEN** it emits JSON with bounded readiness status and per-check metadata
- **AND** the JSON MUST NOT include raw PowerShell output, scripts, local paths, tokens, pairing codes, credentials, screen contents, input contents, keystrokes, private reasons, raw exceptions, environment values, or full secrets

#### Scenario: Native preflight fails closed
- **WHEN** the platform is not Windows, PowerShell is unavailable, capture prerequisites cannot be loaded, or input prerequisites cannot be compiled
- **THEN** it exits non-zero with a bounded reason code
- **AND** diagnostics MUST NOT expose raw PowerShell output, local paths, tokens, pairing codes, credentials, screen contents, input contents, keystrokes, private reasons, or full secrets

#### Scenario: Native preflight remains read-only
- **WHEN** the native preflight runs its fixed PowerShell checks
- **THEN** those checks MUST NOT call `CopyFromScreen`, call `SendInput`, create input arrays, read clipboard data, read arbitrary files, write files, open sockets, start services, configure startup persistence, launch browsers, elevate privileges, run unattended, evade AV/EDR, or bypass Windows prompts

### Requirement: MVP ready helper aggregates local readiness checks

The project SHALL provide a root `npm run mvp:ready` helper that aggregates
local MVP readiness checks before a two-PC trial. By default it SHALL run the
root MVP doctor, root MVP native preflight, root MVP localhost command-plan
validation, and root MVP representative LAN command-plan validation
sequentially, stop after the first failed check, and report only bounded check
status metadata. The localhost command-plan validation SHALL run the existing
non-executing MVP command kit in bounded JSON mode, verify that it emits an
`ok=true` non-executing session command plan with the fixed command names
`preflight.ready`, `preflight.doctor`, `preflight.native`, `preflight.smoke`,
`relay`, `host`, `viewer`, and `browser`, and MUST NOT surface raw command
strings or child output. The representative LAN command-plan validation SHALL
run the existing non-executing MVP command kit in bounded JSON mode with a fixed
safe LAN relay host, verify the same fixed command names, and verify that the
relay, host, and viewer command entries target the derived LAN relay URL
without surfacing raw command strings or child output. When invoked with
`--include-smoke`, it SHALL also run the existing root MVP smoke check after
the default checks pass. The included smoke step SHALL use the smoke check's
bounded JSON mode and MAY surface fixed safe smoke subchecks for relay, frame,
surface, signal, input, and audit readiness or failure status in the aggregate
ready output. When invoked with `--json`, it SHALL emit bounded
machine-readable aggregate readiness metadata containing only `ok`, optional
bounded reason codes, per-check bounded status records, optional fixed smoke
subcheck status records, and safe skipped state. It MUST NOT echo raw child
stdout/stderr, generated command strings, frame paths, surface URLs, audit
paths, frame bytes, surface mutation tokens, raw input commands, relay tokens,
pairing codes, credentials, private reasons, raw signal payloads, raw audit
contents, screen contents, input contents, clipboard contents, file-transfer
contents, diagnostics dumps, or full secrets.

#### Scenario: Ready helper passes default read-only checks

- **WHEN** a developer runs `npm run mvp:ready` and all default checks pass
- **THEN** it reports bounded success for doctor, native preflight, localhost
  command-plan readiness, and LAN command-plan readiness
- **AND** it reports smoke as skipped
- **AND** it does not start relay, host, viewer, browser, capture, input,
  services, startup persistence, unattended access, privilege elevation, or
  Windows prompt bypass

#### Scenario: Ready helper validates the non-executing localhost command plan

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the ready helper invokes the existing MVP command kit in bounded JSON
  mode after doctor and native preflight pass
- **AND** it accepts only an `ok=true` non-executing session plan with fixed
  expected command names
- **AND** ready output MUST NOT include generated command strings, pairing
  codes, relay tokens, audit paths, frame paths, raw child output, credentials,
  screen contents, input contents, clipboard contents, file-transfer contents,
  diagnostics dumps, or full secrets

#### Scenario: Ready helper validates the non-executing LAN command plan

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the ready helper invokes the existing MVP command kit in bounded JSON
  mode with a fixed safe LAN relay host after localhost command-plan validation
  passes
- **AND** it accepts only an `ok=true` non-executing session plan with fixed
  expected command names and relay, host, and viewer command entries targeting
  the derived LAN relay URL
- **AND** ready output MUST NOT include generated command strings, pairing
  codes, relay tokens, audit paths, frame paths, raw child output, credentials,
  screen contents, input contents, clipboard contents, file-transfer contents,
  diagnostics dumps, or full secrets

#### Scenario: Ready helper includes smoke only when requested

- **WHEN** a developer runs `npm run mvp:ready -- --include-smoke`
- **THEN** it runs the existing bounded local MVP smoke check after doctor,
  native preflight, localhost command-plan, and LAN command-plan checks pass
- **AND** it reports bounded success or failure metadata for the smoke check
- **AND** it may report fixed bounded smoke subchecks for relay, frame, surface,
  signal, input, and audit readiness or failure status
- **AND** it does not use Windows capture, OS input application, browser
  automation, services, startup persistence, unattended access, privilege
  elevation, or Windows prompt bypass

#### Scenario: Ready helper emits bounded JSON

- **WHEN** a developer runs `npm run mvp:ready -- --json`
- **THEN** it emits JSON with bounded aggregate status and per-check metadata
- **AND** JSON output MUST NOT include raw child stdout/stderr, generated
  command strings, local paths, frame bytes, surface mutation tokens, raw input
  commands, relay tokens, pairing codes, credentials, private reasons, screen
  contents, input contents, clipboard contents, file-transfer contents,
  diagnostics dumps, or full secrets

#### Scenario: Ready helper emits bounded smoke subchecks

- **WHEN** a developer runs
  `npm run mvp:ready -- --json --include-smoke` and the smoke check returns
  bounded JSON subchecks
- **THEN** the aggregate JSON includes only fixed safe smoke subcheck names,
  boolean readiness or failure status, and optional boolean skipped markers
- **AND** JSON output MUST NOT include smoke stdout/stderr, frame paths, surface
  URLs, audit paths, frame bytes, surface mutation tokens, raw input commands,
  relay tokens, pairing codes, credentials, private reasons, raw signal
  payloads, raw audit contents, screen contents, input contents, clipboard
  contents, file-transfer contents, diagnostics dumps, or full secrets

#### Scenario: Ready helper fails closed

- **WHEN** argument parsing fails, a child process cannot start, a child
  readiness check exits non-zero, localhost command-plan validation returns
  malformed or unexpected JSON metadata, LAN command-plan validation returns
  malformed or unexpected JSON metadata, or an included smoke check returns
  malformed or unexpected JSON metadata
- **THEN** the helper exits non-zero with bounded diagnostics
- **AND** it stops before running later checks
- **AND** diagnostics MUST NOT echo raw rejected values, raw child stdout/stderr,
  generated command strings, paths containing secrets, tokens, pairing codes,
  credentials, private reasons, screen contents, input contents, clipboard
  contents, file-transfer contents, diagnostics dumps, or full secrets

