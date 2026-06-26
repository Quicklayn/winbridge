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
fragments, non-root paths, unspecified connect-target hosts, unsupported
schemes, or unsafe scalar characters. It MUST reject unsafe file paths, unsafe
identifiers, invalid ports, invalid capture cadence values, invalid signal
probe delay values, invalid `--generate-pairing` combinations, invalid
preflight-only combinations, unsafe host or viewer display names, unsafe
request reasons, and invalid JSON/preflight flags without echoing raw unsafe
input in diagnostics. The `--relay-host` shortcut MUST be rejected when it is
malformed, loopback, unspecified, secret-bearing, or combined with `--relay`.
The `--capture-duration-minutes` option MUST be rejected when malformed,
combined with `--capture-count`, or when its derived finite frame count exceeds
the supported command-kit frame-stream bound.

#### Scenario: Unsafe signal probe delay is rejected

- **WHEN** a developer supplies a blank, fractional, negative, oversized,
  non-numeric, or unsafe `--viewer-signal-probe-after-ms` value
- **THEN** the command kit rejects the input before rendering commands
- **AND** the error output remains bounded and does not echo raw unsafe input

#### Scenario: Unsafe full relay URL connect target is rejected

- **WHEN** a developer supplies a full `--relay` URL with an unspecified host,
  non-root path, credentials, query, fragment, unsupported scheme, or unsafe
  scalar content
- **THEN** the command kit rejects the input before rendering relay, host,
  viewer, or browser commands
- **AND** diagnostics MUST NOT echo the raw relay URL, credentials, query
  values, path, pairing code, token references, local paths, command text,
  stdout, stderr, or child output

#### Scenario: Root localhost and LAN relay URLs remain valid

- **WHEN** a developer supplies a full root `ws://localhost:<port>/` or
  `ws://<lan-host>:<port>/` relay URL without credentials, query, fragment, or
  unsafe scalar content
- **THEN** the command kit renders the non-executing command plan
- **AND** non-loopback relay URLs still include the reviewed relay bind setting
  for the relay terminal only

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
host CLI child process SHALL emit a bounded visible active-session indicator
marker that the smoke check can observe in captured child output. The smoke
check SHALL verify that this host indicator marker is active, visible to the
host, and has a positive permission count before continuing to frame, surface,
signal, input, audit, and lifecycle checks. The smoke check SHALL verify that
the viewer publishes a latest-frame file for the current run, that the loopback
viewer surface serves both the generated HTML and current frame endpoint, that
the loopback viewer status endpoint reports the bounded host acknowledgement
readiness flag `signalProbeAckReceived=true` for the current consent-bound
signal probe, that the loopback viewer surface rejects fixed unsafe local
mutation requests for missing token, foreign origin, and unsafe content type
before input acceptance, that the loopback viewer surface accepts one bounded
pointer command and one bounded keyboard command with explicit modifiers
through its token-protected local `/input` path, and that both configured host
and viewer local JSONL audit files contain bounded schema-like audit records
for the smoke run. The smoke check MUST stop all child processes after success,
failure, timeout, or interrupt. By default, it SHALL remove the temporary smoke
work directory before exit. When the developer explicitly passes
`--keep-artifacts`, the smoke check SHALL retain the smoke work directory and
print bounded metadata identifying that directory on success. When invoked with
`--json`, the smoke check SHALL emit bounded machine-readable result metadata
containing only `ok`, optional safe reason codes, per-check bounded status
records, artifact cleanup state, and the retained artifact directory only when
explicitly requested with `--keep-artifacts`. It MUST NOT invoke Windows
capture, apply OS input, launch a browser, install services, configure startup
persistence, run unattended, elevate privileges, collect credentials, read
clipboard data, transfer files, collect diagnostics dumps, evade AV/EDR, bypass
Windows prompts, or hide the host visible-session state.

#### Scenario: Smoke check observes CLI-visible host indicator

- **WHEN** a developer runs the root MVP smoke check with default options
- **THEN** the host CLI child output includes a bounded
  `[winbridge-agent] host indicator` marker for the active visible session
- **AND** the smoke check verifies that marker before frame, surface, signal,
  input, audit, and lifecycle checks
- **AND** the marker and smoke diagnostics MUST NOT expose raw protocol
  payloads, tokens, pairing codes, credentials, private reasons, screen
  contents, input contents, clipboard contents, file-transfer contents,
  diagnostics dumps, or full secrets

#### Scenario: Smoke check verifies local surface mutation guards

- **WHEN** the smoke workflow has verified the loopback viewer surface and
  extracted the bounded per-run mutation token
- **THEN** it posts fixed negative input requests for missing token, foreign
  origin, and unsafe content type
- **AND** each request is rejected before accepted input handling
- **AND** the smoke helper reports only the fixed `surface-guards` subcheck
  metadata
- **AND** diagnostics MUST NOT expose mutation tokens, origins, URLs, ports,
  response bodies, raw input commands, authorization ids, child output, pairing
  codes, credentials, screen contents, input contents, or full secrets

#### Scenario: Surface guard failure fails closed

- **WHEN** any fixed surface guard probe is accepted, times out, or returns an
  unexpected unsafe result
- **THEN** the smoke helper exits non-zero with a bounded
  `surface-guards-not-ready` reason
- **AND** it stops any started child processes before returning control
- **AND** diagnostics MUST NOT expose mutation tokens, origins, URLs, ports,
  response bodies, raw input commands, authorization ids, child output, pairing
  codes, credentials, screen contents, input contents, or full secrets

#### Scenario: Ready helper accepts fixed surface guard subcheck

- **WHEN** `npm run mvp:ready -- --include-smoke --json` consumes bounded
  smoke JSON containing the fixed `surface-guards` subcheck
- **THEN** the ready helper accepts and reports that fixed subcheck for both
  default smoke and LAN-style smoke when included
- **AND** malformed, missing, duplicate, or unexpected surface guard subcheck
  metadata fails closed without exposing unsafe values

### Requirement: MVP doctor validates local readiness without side effects

`npm run mvp:doctor` SHALL validate local MVP readiness before a two-PC trial
without starting relay, host, viewer, browser, capture, input, services,
startup persistence, unattended access, or network listeners. The doctor SHALL
check the local Windows platform, supported Node runtime, required root scripts
including `mvp:ready` and `mvp:native-preflight`, required root script
alignment for the reviewed `dev:agent`, `dev:relay`, and `mvp:smoke`
workflows, required workspace manifests, required root MVP helper script
entrypoints, and required source entrypoints for the relay, protocol, audit,
Windows capture, Windows input, and critical agent-shell MVP modules including
host controls, viewer controls, viewer frame output, viewer local control
surface, screen-frame output, and CLI shutdown. The `dev:agent` script
alignment check SHALL require the protocol, audit-log, Windows capture, and
Windows input workspace builds before the agent-shell development entrypoint.
The `dev:relay` script alignment check SHALL require the protocol and audit-log
workspace builds before the relay development entrypoint. The `mvp:smoke`
script alignment check SHALL require a root build before the smoke helper
entrypoint. Its default success output SHALL include bounded readiness lines for
platform, Node, scripts, workspaces, entrypoints, and visible-consent safety.
When invoked with `--json`, it SHALL emit bounded machine-readable readiness
metadata containing only `ok`, optional bounded reason codes, and per-check
bounded status records. Its failure output SHALL use bounded reason codes only
and MUST NOT include raw script bodies, package JSON content, raw paths, tokens,
pairing codes, credentials, screen contents, keystrokes, environment values,
stdout, stderr, or full secrets.

#### Scenario: Doctor fails when root scripts drift from the reviewed MVP workflow

- **WHEN** a required root MVP script exists but no longer contains the
  reviewed ordered workspace build or helper entrypoint chain
- **THEN** the doctor exits with the bounded `script-misaligned` reason
- **AND** output includes only fixed readiness check metadata
- **AND** output MUST NOT echo script bodies, package JSON content, paths,
  environment values, tokens, pairing codes, credentials, screen contents,
  keystrokes, stdout, stderr, or full secrets

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
validation, root MVP representative LAN command-plan validation, root MVP
shared-token command-plan validation, and fixed role-filter command validation
for `mvp:commands -- --only relay`, `host`, `viewer`, `browser`, and
`preflight` sequentially, stop after the first failed check, and report only
bounded check status metadata. The helper SHALL support explicit role-scoped
readiness with `--role relay`, `--role host`, and `--role viewer` without
changing the default aggregate plan. Role-scoped relay readiness SHALL run only
the root MVP doctor and relay role-filter command validation. Role-scoped host
readiness SHALL run the root MVP doctor, root MVP native preflight, and host
role-filter command validation. Role-scoped viewer readiness SHALL run the root
MVP doctor, root MVP native preflight, viewer role-filter command validation,
and browser role-filter command validation. Role mode MAY be combined with
`--json` and MUST reject `--include-smoke`.

The localhost command-plan validation SHALL run the existing non-executing MVP
command kit in bounded JSON mode, verify that it emits an `ok=true`
non-executing session command plan with the fixed command names
`preflight.ready`, `preflight.doctor`, `preflight.native`, `preflight.smoke`,
`relay`, `host`, `viewer`, and `browser`, and MUST NOT surface raw command
strings, local paths, relay URLs, pairing codes, relay tokens, token environment
values, stdout, stderr, or child output in readiness output. The LAN
command-plan validation SHALL run the same non-executing command kit with a
representative safe LAN relay host, verify the expected relay URL only as
internal readiness metadata, and verify that the relay command binds with the
reviewed `WINBRIDGE_RELAY_BIND_HOST = '0.0.0.0'` setting for the LAN trial
path. The shared-token command-plan validation SHALL run the same non-executing
command kit with a fixed relay token environment variable name and verify the
expected token environment reference only as internal readiness metadata. The
role-filter command validations SHALL run the same non-executing command kit in
text mode with exactly one fixed `--only` target per check, verify bounded
target-specific output for the selected relay, host, viewer, browser, or
preflight block, reject malformed or cross-target command text, and MUST NOT
echo the filtered command block, pairing, relay URL, local URLs, paths, tokens,
token environment values, stdout, stderr, or child output in readiness output.
With `--include-smoke`, the default helper SHALL also run the root MVP smoke
check and root MVP LAN smoke check in bounded JSON mode after the default checks
pass. Without `--include-smoke`, the default helper SHALL mark smoke and LAN
smoke as explicitly skipped metadata only. The helper MUST stop on the first
failed check and MUST NOT start relay, host, viewer, browser, capture, input,
services, startup persistence, unattended access, privilege elevation, remote
discovery, network probing, firewall changes, clipboard access, file transfer,
diagnostics dumps, AV/EDR evasion, Windows prompt bypass, hidden sessions, or
production deployment behavior.

#### Scenario: Ready rejects LAN command plan with unsafe relay bind

- **WHEN** the representative LAN command-plan JSON routes host and viewer to
  the expected LAN relay URL but omits the `0.0.0.0` relay bind or uses a
  different bind value
- **THEN** `mvp:ready` fails closed at the fixed `lan-command-plan` check
- **AND** output includes only fixed check metadata and a safe reason code
- **AND** output MUST NOT echo relay commands, relay URLs, ports, token
  references, stdout, stderr, child output, package JSON content, paths,
  pairing codes, credentials, screen contents, input contents, or full secrets

#### Scenario: Role-scoped ready runs only selected local checks

- **WHEN** a developer runs `npm run mvp:ready -- --role relay`, `--role host`,
  or `--role viewer`
- **THEN** the helper runs only the fixed readiness checks for that role
- **AND** host and viewer roles include native preflight while relay role does
  not
- **AND** output includes only bounded check status metadata
- **AND** output MUST NOT echo generated command strings, relay URLs, local
  URLs, local paths, pairing codes, tokens, stdout, stderr, child output,
  credentials, screen contents, input contents, or full secrets

#### Scenario: Role-scoped ready rejects smoke

- **WHEN** a developer combines `--role relay`, `--role host`, or
  `--role viewer` with `--include-smoke`
- **THEN** the helper rejects the invocation before running checks
- **AND** diagnostics remain bounded and do not echo raw unsafe input

### Requirement: MVP smoke check supports explicit LAN-style relay mode

The root MVP smoke check SHALL support an explicit `--lan-relay` option that
runs the same bounded local static workflow while connecting host and viewer
through a loopback LAN-style relay URL using `127.0.0.1` and the smoke relay's
resolved port. The option SHALL remain local and development-scoped: it MUST
NOT discover local network addresses, probe remote hosts, open firewall ports,
invoke Windows capture, apply OS input, launch browser automation, install
services, configure startup persistence, elevate privileges, run unattended,
use relay tokens, expose raw relay URLs or ports in diagnostics, or hide the
host visible-session state. When invoked with `--json`, success and failure
output MUST use the same bounded smoke result shape as the default smoke mode.

#### Scenario: LAN-style smoke mode uses static local workflow

- **WHEN** a developer runs `npm run mvp:smoke -- --lan-relay`
- **THEN** the smoke check starts the bounded local development relay, host,
  and viewer processes with static frames and visible host authorization
- **AND** host and viewer connect through a `ws://127.0.0.1:<resolved-port>/`
  relay URL for the current smoke run
- **AND** it verifies frame, surface, signal, input, and audit readiness using
  the same bounded checks as the default smoke mode
- **AND** it stops all child processes before exiting

#### Scenario: LAN-style smoke output stays bounded

- **WHEN** the LAN-style smoke mode succeeds or fails with `--json`
- **THEN** the emitted JSON contains only bounded `ok`, optional safe reason,
  per-check status, and artifact cleanup metadata
- **AND** it MUST NOT include relay URLs, ports, frame paths, surface URLs,
  audit paths, mutation tokens, authorization ids, raw input commands, raw
  child output, tokens, pairing codes, credentials, private reasons, screen
  contents, input contents, clipboard contents, file-transfer contents,
  diagnostics dumps, or full secrets

#### Scenario: LAN-style smoke mode remains local

- **WHEN** the LAN-style smoke mode prepares the relay URL
- **THEN** it uses the local smoke relay port and a fixed loopback host
  literal
- **AND** it MUST NOT discover LAN interfaces, connect to remote hosts, probe
  ports outside the local smoke workflow, configure firewall rules, bind a
  production service, or make the smoke helper an Internet-facing relay

### Requirement: MVP native preflight validates fixed probe JSON success markers

The root MVP native preflight helper SHALL treat a fixed PowerShell prerequisite
probe as successful only when the probe exits successfully and emits bounded
JSON stdout with the exact top-level object shape `{ "ok": true }`. The helper
MUST reject empty stdout, malformed JSON, arrays, null, non-object JSON,
`ok=false`, missing `ok`, extra top-level fields, and oversized stdout. Rejected
probe output MUST use the existing bounded per-probe failure reason and MUST
NOT be echoed in human output, JSON output, thrown errors, logs, or aggregate
readiness diagnostics.

#### Scenario: Probe success marker is accepted

- **WHEN** a fixed native preflight PowerShell probe exits successfully and emits
  exactly `{ "ok": true }` as bounded JSON stdout
- **THEN** the helper records that probe as passed
- **AND** default and JSON CLI output contain only bounded readiness metadata

#### Scenario: Malformed success marker fails closed

- **WHEN** a fixed native preflight PowerShell probe exits successfully but emits
  empty, malformed, false, array-shaped, non-object, extra-field, oversized, or
  otherwise unexpected stdout
- **THEN** the helper records that probe as failed with the same bounded reason
  code used for that probe's execution failure
- **AND** diagnostics MUST NOT expose raw PowerShell stdout, scripts, local
  paths, tokens, pairing codes, credentials, screen contents, input contents,
  keystrokes, private reasons, raw exceptions, environment values, or full
  secrets

#### Scenario: Strict marker validation remains read-only

- **WHEN** the helper validates a fixed native preflight probe's stdout
- **THEN** validation MUST NOT invoke screen capture, apply OS input, start
  relay, host, viewer, browser, sockets, HTTP listeners, services, startup
  persistence, unattended access, privilege elevation, clipboard, file transfer,
  diagnostics dumps, AV/EDR evasion, Windows prompt bypass, or hidden session
  behavior

### Requirement: MVP smoke check verifies lifecycle-denial input failure

The root MVP smoke check SHALL verify that the local static workflow fails
input closed after a bounded lifecycle loss of input authorization. After the
happy-path pointer and keyboard input checks have succeeded, the smoke check
SHALL use existing host lifecycle control behavior to remove active input
authorization through pause, revocation, termination, or an equivalent existing
explicit host-side control, then SHALL verify that the token-protected loopback
viewer surface no longer accepts a bounded input command. The smoke check MUST
stop all child processes after success, failure, timeout, or interrupt. Human
and JSON output MUST represent this verification using only fixed safe smoke
subcheck metadata and bounded reason codes.

#### Scenario: Lifecycle-denial smoke subcheck passes

- **WHEN** the smoke workflow has verified frame, surface, signal, accepted
  pointer input, accepted keyboard input, and audit readiness
- **THEN** it performs a bounded lifecycle-denial input check using existing
  explicit host-side lifecycle control behavior
- **AND** it verifies that a subsequent token-protected local viewer surface
  input command is rejected
- **AND** it reports the fixed lifecycle-denial subcheck as passed

#### Scenario: Lifecycle-denial smoke subcheck fails closed

- **WHEN** lifecycle control cannot be applied, authorization loss is not
  observed, the local viewer surface still accepts input after authorization
  loss, or the check times out
- **THEN** the smoke helper exits non-zero with bounded diagnostics
- **AND** it stops any started child processes before returning control
- **AND** diagnostics MUST NOT expose raw frame bytes, audit paths, raw audit
  contents, mutation tokens, authorization ids, raw signal payloads, raw input
  commands, tokens, pairing codes, credentials, private reasons, raw child
  output, screen contents, input contents, clipboard contents, file-transfer
  contents, diagnostics dumps, or full secrets

#### Scenario: Lifecycle-denial smoke output stays bounded

- **WHEN** the smoke check succeeds or fails with `--json`
- **THEN** the emitted JSON contains only bounded `ok`, optional safe reason,
  fixed per-check status records including the lifecycle-denial subcheck, and
  artifact cleanup metadata
- **AND** it MUST NOT include relay URLs, ports, frame paths, surface URLs,
  audit paths, mutation tokens, authorization ids, raw input commands, raw
  child output, tokens, pairing codes, credentials, private reasons, screen
  contents, input contents, clipboard contents, file-transfer contents,
  diagnostics dumps, or full secrets

### Requirement: MVP smoke check reports bounded audit summary metadata

The root MVP smoke check SHALL derive a read-only bounded audit summary from
the existing configured local smoke audit files after audit readiness passes.
The summary SHALL include only fixed role-local record counts, outcome counts,
and known coverage booleans for expected MVP smoke evidence such as consent,
screen-frame output, input sending, and lifecycle revocation. Human and JSON
output MUST NOT include audit paths, raw audit lines, event ids, authorization
ids, actor ids, target ids, detail values, reasons, raw action strings, raw
child output, tokens, pairing codes, credentials, private reasons, screen
contents, input contents, clipboard contents, file-transfer contents,
diagnostics dumps, or full secrets.

#### Scenario: Smoke JSON includes bounded audit summary

- **WHEN** the smoke workflow verifies relay, frame, surface, signal, input,
  audit, and lifecycle readiness and is invoked with `--json`
- **THEN** the emitted JSON includes a fixed `auditSummary` object for host and
  viewer audit coverage
- **AND** the summary contains only bounded counts and fixed booleans
- **AND** it does not include raw audit record content or local audit file
  paths

#### Scenario: Ready helper preserves bounded smoke audit summary

- **WHEN** `npm run mvp:ready -- --include-smoke --json` consumes bounded
  smoke JSON containing the fixed audit summary
- **THEN** the ready helper accepts the smoke result and may include the same
  bounded audit summary inside the aggregate smoke check metadata
- **AND** ready output MUST NOT echo raw child output, generated command
  strings, audit paths, raw audit records, raw action strings, event ids,
  authorization ids, tokens, pairing codes, credentials, private reasons, or
  full secrets

#### Scenario: Malformed audit summary fails closed

- **WHEN** a smoke result consumed by the ready helper contains malformed audit
  summary shape, unexpected audit summary fields, unsafe counts, unsafe
  strings, raw paths, raw actions, or private diagnostic metadata
- **THEN** the ready helper treats the smoke output as malformed
- **AND** aggregate diagnostics remain bounded and do not expose the unsafe
  values

### Requirement: MVP smoke check verifies host visible indicator readiness

The root MVP smoke check SHALL verify that the local host process emits a
bounded active visible host indicator marker during the same-machine smoke
workflow. The check SHALL use only fixed safe metadata markers indicating host
indicator state, active visibility, and a positive permission count. Human and
JSON output MUST represent this verification using only fixed subcheck metadata
and bounded reason codes. The smoke and ready helpers MUST NOT emit raw host
stdout or stderr, authorization ids, local paths, process ids, tokens, pairing
codes, credentials, private reasons, screen contents, input contents,
clipboard contents, file-transfer contents, diagnostics dumps, or full secrets.

#### Scenario: Host indicator smoke subcheck passes

- **WHEN** the smoke host reaches active visible authorization
- **THEN** the smoke check observes the bounded active host indicator marker in
  the host process output
- **AND** it reports the fixed `indicator` subcheck as passed

#### Scenario: Host indicator smoke subcheck fails closed

- **WHEN** the host process does not emit an active visible indicator marker
  before the smoke deadline
- **THEN** the smoke helper exits non-zero with a bounded
  `indicator-not-ready` reason
- **AND** it stops any started child processes before returning control
- **AND** diagnostics MUST NOT expose raw child output or authorization ids

#### Scenario: Ready helper aggregates indicator subcheck

- **WHEN** `npm run mvp:ready -- --include-smoke` consumes bounded smoke JSON
  containing the fixed `indicator` subcheck
- **THEN** the ready helper accepts and reports that fixed subcheck
- **AND** malformed or unexpected indicator metadata fails closed without
  exposing unsafe values

### Requirement: MVP command kit filters text output to one fixed target

The MVP command kit SHALL support a text-mode `--only` option with only the
fixed values `relay`, `host`, `viewer`, `browser`, and `preflight`. The option
SHALL render only the selected non-executing command block plus bounded safety
and preflight reminders. For session targets, the filtered output SHALL still
be derived from the same fully validated command plan, including relay URL,
pairing, display names, request reason, token environment references, audit
paths, capture cadence, visible host consent prompt, host controls, viewer
frame output, and loopback viewer surface settings. The option MUST NOT start
relay, host, viewer, browser, capture, input, sockets, HTTP listeners, audit
writes, services, startup persistence, unattended access, privilege elevation,
remote discovery, network probing, firewall changes, hidden sessions, or
Windows prompt bypass behavior.

#### Scenario: Host target prints only host command

- **WHEN** a developer runs `npm run mvp:commands -- --only host`
- **THEN** the helper renders bounded text containing the validated host command
- **AND** it includes manual preflight and host-control reminders
- **AND** it does not render the relay, viewer, or browser command blocks

#### Scenario: Viewer target prints only viewer command

- **WHEN** a developer runs `npm run mvp:commands -- --only viewer`
- **THEN** the helper renders bounded text containing the validated viewer
  command
- **AND** it includes a reminder that the viewer browser block is separate
- **AND** it does not render the relay, host, or browser command blocks

#### Scenario: Browser target prints only browser command

- **WHEN** a developer runs `npm run mvp:commands -- --only browser`
- **THEN** the helper renders bounded text containing only the loopback viewer
  browser command and readiness reminders
- **AND** it does not render relay, host, or viewer runtime commands

#### Scenario: Preflight target prints preflight commands only

- **WHEN** a developer runs `npm run mvp:commands -- --only preflight`
- **THEN** the helper renders the bounded preflight command set
- **AND** it does not render live session commands or browser commands

#### Scenario: Invalid filter fails closed

- **WHEN** a developer supplies an unknown, duplicate, JSON-combined, or
  preflight-only-combined `--only` option
- **THEN** the command kit rejects the input before rendering commands
- **AND** diagnostics remain bounded and do not echo raw unsafe values

### Requirement: MVP smoke check verifies viewer local surface disconnect

The root MVP smoke check SHALL verify that the local static workflow can end
the viewer side through the token-protected loopback viewer surface
`/disconnect` path after frame, surface, signal, guard, input, audit, and
lifecycle readiness have passed. The check SHALL post only a fixed empty JSON
body with the existing per-run local surface mutation token, same-origin
header, and JSON content type. It SHALL treat the disconnect subcheck as
successful only when the local surface returns a bounded `202` response with
`ok=true` and `action=disconnect`. Human and JSON output MUST represent this
verification using only the fixed `viewer-disconnect` subcheck metadata and
bounded reason codes. The smoke check MUST stop all child processes after
success, failure, timeout, or interrupt.

#### Scenario: Viewer disconnect smoke subcheck passes

- **WHEN** the smoke workflow has verified frame, surface, signal, guard,
  input, audit, and lifecycle readiness
- **THEN** it posts to the token-protected local viewer surface `/disconnect`
  path
- **AND** it reports the fixed `viewer-disconnect` subcheck as passed
- **AND** it MUST NOT forge relay lifecycle messages, bypass runtime `leave()`,
  reconnect peers, grant permissions, hide host visibility, start capture, send
  input, or bypass runtime authorization gates

#### Scenario: Viewer disconnect smoke subcheck fails closed

- **WHEN** the local viewer surface disconnect path is unavailable, rejects the
  fixed request, returns an unexpected response, times out, or cannot be
  reached after prior readiness checks
- **THEN** the smoke helper exits non-zero with the bounded
  `viewer-disconnect-not-ready` reason
- **AND** it stops any started child processes before returning control
- **AND** diagnostics MUST NOT expose mutation tokens, local surface URLs,
  ports, response bodies, raw child output, relay URLs, frame paths, audit
  paths, raw audit records, authorization ids, peer ids, raw input commands,
  pointer coordinates, key values, modifier values, pairing codes, credentials,
  private reasons, screen contents, input contents, clipboard contents,
  file-transfer contents, diagnostics dumps, or full secrets

#### Scenario: Ready helper aggregates viewer disconnect subcheck

- **WHEN** `npm run mvp:ready -- --include-smoke --json` consumes bounded smoke
  JSON containing the fixed `viewer-disconnect` subcheck
- **THEN** the ready helper accepts and reports that fixed subcheck for both
  default smoke and LAN-style smoke when included
- **AND** malformed, missing, duplicate, or unexpected viewer-disconnect
  subcheck metadata fails closed without exposing unsafe values

### Requirement: MVP smoke check verifies bounded local status readiness

The root MVP smoke check SHALL treat the loopback viewer surface `/status`
readiness check as successful only when the response is bounded sanitized JSON
with `ok=true`, active viewer state, `visibleToHost=true`,
`signalProbeAckReceived=true`, `inputPointerReady=true`, and
`inputKeyboardReady=true`. This check SHALL remain part of the fixed `signal`
smoke subcheck and SHALL fail closed with the existing bounded
`signal-not-ready` reason when status is missing, inactive, invisible, lacks
the expected readiness booleans, contains malformed metadata, or contains known
unsafe raw status fields. The helper MUST NOT print the raw status response,
surface URL, port, tokens, or child output in human or JSON diagnostics.

#### Scenario: Status readiness smoke subcheck passes

- **WHEN** the smoke workflow polls the local viewer surface `/status` after
  visible host authorization and signal acknowledgement
- **THEN** the response is accepted only if it reports active visible sanitized
  status with signal, pointer, and keyboard readiness booleans set to true
- **AND** accepting the status MUST NOT grant permissions, send input, start
  capture, reconnect peers, invoke host controls, hide host visibility, or
  bypass runtime authorization gates

#### Scenario: Status readiness smoke subcheck rejects unsafe metadata

- **WHEN** the local viewer surface `/status` response contains raw
  authorization ids, raw permission arrays, pairing codes, mutation tokens,
  relay tokens, raw signal payload markers, raw input commands, pointer
  coordinates, key values, modifier values, frame paths, frame bytes, audit
  paths, raw audit records, diagnostics dumps, child stdout or stderr, or full
  secrets
- **THEN** the smoke helper treats the fixed `signal` subcheck as not ready
- **AND** diagnostics MUST NOT expose the unsafe response values

#### Scenario: Status readiness smoke subcheck rejects incomplete readiness

- **WHEN** the local viewer surface `/status` response is missing, malformed,
  inactive, invisible, lacks `signalProbeAckReceived=true`, lacks
  `inputPointerReady=true`, or lacks `inputKeyboardReady=true`
- **THEN** the smoke helper treats the fixed `signal` subcheck as not ready
- **AND** it continues polling only until the bounded smoke deadline
- **AND** failure output uses only the bounded `signal-not-ready` reason and
  fixed smoke subcheck metadata

### Requirement: Generated pairing is full-plan only

The MVP command kit SHALL reject `--generate-pairing` when combined with any
`--only` target before generating a pairing code. Role-filtered command output
SHALL remain available with the default pairing value or with an explicit
operator-provided `--pairing` value. Full text and JSON session command plans
MAY continue using `--generate-pairing` to render one consistent pairing code
across the host and viewer commands in the same non-executing output.

#### Scenario: Role-filtered generated pairing is rejected

- **WHEN** a developer runs the command kit with `--generate-pairing` and
  `--only relay`, `--only host`, `--only viewer`, `--only browser`, or
  `--only preflight` in either flag order
- **THEN** the command kit rejects the input before rendering commands
- **AND** it does not generate, render, or log a pairing code
- **AND** the error output remains bounded and does not echo raw unsafe input,
  relay URLs, local paths, tokens, generated pairing codes, or command bodies

#### Scenario: Full generated pairing remains consistent

- **WHEN** a developer runs the full command kit with `--generate-pairing`
- **THEN** the host and viewer commands use the same generated pairing code in
  the single rendered output
- **AND** the helper remains non-executing and does not start relay, host,
  viewer, capture, input, or browser processes

#### Scenario: Role-filtered explicit pairing remains available

- **WHEN** a developer runs the command kit with `--only host --pairing
  234-567` or `--only viewer --pairing 234-567`
- **THEN** the selected bounded command block renders with that explicit
  pairing value
- **AND** the helper does not generate a separate pairing code

