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
screen-frame send/output, input sending, lifecycle revocation, and disconnect
or terminal lifecycle evidence. Before the smoke check reports the audit
subcheck as passed, it MUST require accepted audit outcomes for the fixed MVP
evidence flags in their expected local roles: host authorization approval, host
active visible authorization, host screen frame sent, host permission revoked,
host disconnect, host local session disconnected, or terminal lifecycle
evidence, viewer screen frame output, viewer input sent, and viewer disconnect
evidence. Denied, failed, missing, or wrong-role evidence MUST NOT satisfy
smoke audit readiness. Human and JSON output MUST NOT include audit paths, raw
audit lines, event ids, authorization ids, actor ids, target ids, detail
values, reasons, raw action strings, raw child output, tokens, pairing codes,
credentials, private reasons, screen contents, input contents, clipboard
contents, file-transfer contents, diagnostics dumps, or full secrets.

#### Scenario: Smoke JSON includes bounded audit summary

- **WHEN** the smoke workflow verifies relay, frame, surface, signal, input,
  strict role-bound audit evidence, and lifecycle readiness and is invoked
  with `--json`
- **THEN** the emitted JSON includes a fixed `auditSummary` object for host and
  viewer audit coverage
- **AND** the summary contains only bounded counts and fixed booleans
- **AND** it does not include raw audit record content or local audit file
  paths

#### Scenario: Wrong-role or partial smoke audit evidence fails closed

- **WHEN** the configured smoke audit files are parseable but host-required
  evidence appears only in the viewer log, viewer-required evidence appears
  only in the host log, disconnect evidence is missing for either role, or one
  or more required records are denied or failed
- **THEN** the smoke helper exits non-zero with bounded diagnostics
- **AND** it reports only the fixed `audit-not-ready` reason
- **AND** diagnostics MUST NOT expose raw logs, paths, record details,
  identifiers, frame bytes, input contents, command strings, or secrets

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

### Requirement: Command kit supports explicit ephemeral viewer surface port

The MVP command kit SHALL accept `--viewer-control-surface-port 0` as an
explicit ephemeral local viewer surface mode while preserving the default fixed
port `35987`. When the configured viewer surface port is `0`, the rendered
viewer command SHALL pass `--viewer-control-surface-port '0'`, and the rendered
browser step SHALL instruct the operator to open the loopback URL printed by
the viewer command log instead of printing a fabricated fixed URL. The command
kit MUST remain non-executing and MUST NOT start browsers, bind sockets, probe
ports, expose mutation tokens, or echo unsafe input.

#### Scenario: Default browser command remains fixed-port

- **WHEN** a developer runs the command kit without overriding the viewer
  surface port
- **THEN** the browser step remains `Start-Process
  'http://127.0.0.1:35987/'`
- **AND** the viewer command uses `--viewer-control-surface-port '35987'`

#### Scenario: Ephemeral browser step points to viewer log

- **WHEN** a developer runs the command kit with
  `--viewer-control-surface-port 0`
- **THEN** the viewer command uses `--viewer-control-surface-port '0'`
- **AND** the browser step instructs the operator to open the URL printed by
  the viewer command log
- **AND** output MUST NOT include a fabricated `http://127.0.0.1:0/` URL,
  mutation token, raw command output, credentials, screen contents, input
  contents, or full secrets

### Requirement: Role-filtered command output includes role-scoped ready reminders

The MVP command kit SHALL include a local role-scoped readiness reminder in
filtered text output for relay, host, viewer, and browser targets. Relay output
MUST remind the operator to run `npm run mvp:ready -- --role relay` on the relay
machine. Host output MUST remind the operator to run
`npm run mvp:ready -- --role host` on the host machine. Viewer output MUST
remind the operator to run `npm run mvp:ready -- --role viewer` on the viewer
machine. Browser output MUST use the viewer role reminder because the browser
surface runs on the viewer machine. The reminder MUST remain non-executing
text and MUST NOT start relay, host, viewer, browser, capture, input, socket,
HTTP, service, startup, unattended, privilege, credential, clipboard, file
transfer, diagnostics, AV/EDR evasion, Windows prompt bypass, or hidden-session
behavior.

#### Scenario: Filtered command reminders match the selected local role

- **WHEN** a developer renders `mvp:commands -- --only relay`, `host`,
  `viewer`, or `browser`
- **THEN** the selected text block includes the matching role-scoped
  `mvp:ready -- --role ...` reminder for the local machine
- **AND** the browser target uses the viewer role reminder
- **AND** the helper still only prints text and exits

#### Scenario: Ready validation requires the bounded role reminder

- **WHEN** `npm run mvp:ready` validates fixed role-filtered command output
- **THEN** each relay, host, viewer, and browser role-filter check requires the
  expected role-scoped reminder
- **AND** readiness output MUST NOT echo generated command strings, relay URLs,
  local URLs, local paths, pairing codes, tokens, token environment values,
  stdout, stderr, child output, credentials, screen contents, input contents,
  or full secrets

### Requirement: MVP smoke uses ephemeral viewer surface port by default

The root MVP smoke check SHALL pass `--viewer-control-surface-port 0` to the
viewer command by default and SHALL resolve the actual loopback viewer surface
URL from the bounded viewer child output before checking the surface HTML,
`/frame`, `/status`, `/input`, and `/disconnect` paths. The accepted viewer
surface URL MUST use `http://127.0.0.1:<port>/` with a valid non-zero TCP port,
root path, and no credentials, query, or fragment. The smoke check MAY retain
an explicit fixed `surfacePort` test hook for deterministic tests. Failure
diagnostics MUST NOT expose resolved ports, local surface URLs, mutation
tokens, frame paths, relay URLs, raw child output, pairing codes, credentials,
screen contents, input contents, or full secrets. The smoke check MUST remain
local and MUST NOT launch browsers, bind the viewer surface to LAN/public
interfaces, discover network addresses, probe remote hosts, open firewall
ports, use Windows capture, apply OS input, install services, configure startup
persistence, elevate privileges, run unattended, evade AV/EDR, bypass Windows
prompts, or hide the host visible-session state.

#### Scenario: Default smoke resolves the runtime viewer surface URL

- **WHEN** a developer runs `npm run mvp:smoke` without an explicit test-only
  surface port
- **THEN** the smoke viewer command uses `--viewer-control-surface-port 0`
- **AND** the smoke helper waits for the bounded viewer local control surface
  log marker
- **AND** it uses the resolved `127.0.0.1` URL internally for the existing
  surface, signal, guard, input, lifecycle, audit, and disconnect checks
- **AND** human and JSON output still include only fixed smoke subcheck
  metadata and bounded artifact/audit summary metadata

#### Scenario: Unsafe viewer surface URL markers fail closed

- **WHEN** the viewer child output is missing the surface URL marker, contains
  a malformed marker, or reports a URL with a non-loopback host, credentials,
  query, fragment, non-root path, port `0`, or invalid port
- **THEN** the smoke helper treats the surface as not ready
- **AND** diagnostics MUST NOT echo the unsafe marker, URL, port, child output,
  token, pairing code, credential, screen content, input content, or full secret

### Requirement: Ready helper validates ephemeral browser instruction

The root MVP ready helper SHALL include a default non-executing command-plan
validation for explicit ephemeral viewer surface mode by running the command kit
in bounded JSON mode with `--viewer-control-surface-port 0`. This validation
SHALL verify internally that the generated viewer command passes
`--viewer-control-surface-port '0'`, that the generated browser command is the
fixed instruction to open the local control surface URL printed by the viewer
command log, and that the command plan does not fabricate a
`http://127.0.0.1:0/` URL. The validation MUST stop after the first failure and
MUST report only fixed readiness check metadata and bounded reason codes. It
MUST NOT echo command strings, local URLs, ports, relay URLs, pairing codes,
token references, local paths, stdout, stderr, child output, mutation tokens,
credentials, screen contents, input contents, or full secrets. The validation
MUST remain non-executing and MUST NOT start relay, host, viewer, browser,
capture, input, sockets, HTTP listeners, services, startup persistence,
unattended access, privilege elevation, remote discovery, firewall changes,
AV/EDR evasion, Windows prompt bypass, or hidden-session behavior.

#### Scenario: Default ready accepts reviewed ephemeral browser instruction

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the helper validates the ordinary fixed-port command plan
- **AND** it validates the explicit ephemeral command plan
- **AND** the ephemeral validation passes only when the viewer command uses
  `--viewer-control-surface-port '0'`
- **AND** the browser command instructs the operator to open the URL printed by
  the viewer command log instead of using a fabricated port-zero URL

#### Scenario: Ephemeral command-plan drift fails closed

- **WHEN** the ephemeral command-plan output is missing the viewer port-zero
  flag, omits the fixed browser instruction, includes a fabricated
  `http://127.0.0.1:0/` URL, or contains malformed command-plan metadata
- **THEN** `mvp:ready` treats the `ephemeral-command-plan` check as failed
- **AND** output uses only fixed check status and bounded reason metadata
- **AND** diagnostics do not echo the unsafe command string, URL, port, token,
  pairing code, path, stdout, stderr, child output, credential, screen content,
  input content, or full secret

### Requirement: Ready helper validates ephemeral browser-only output

The root MVP ready helper SHALL include a default non-executing text validation
for `mvp:commands -- --only browser --viewer-control-surface-port 0`. This
validation SHALL verify that the browser-only output includes the viewer-role
ready reminder, includes only the browser command block, includes the fixed
instruction to open the local control surface URL printed by the viewer command
log, and does not include a fabricated `http://127.0.0.1:0/` URL. The
validation MUST stop after the first failure and MUST report only fixed
readiness check metadata and bounded reason codes. It MUST NOT echo generated
command strings, local URLs, ports, relay URLs, pairing codes, token
references, local paths, stdout, stderr, child output, mutation tokens,
credentials, screen contents, input contents, or full secrets. The validation
MUST remain non-executing and MUST NOT start relay, host, viewer, browser,
capture, input, sockets, HTTP listeners, services, startup persistence,
unattended access, privilege elevation, remote discovery, firewall changes,
AV/EDR evasion, Windows prompt bypass, or hidden-session behavior.

#### Scenario: Default ready accepts ephemeral browser-only output

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the helper validates the default browser role-filter output
- **AND** it validates the explicit ephemeral browser role-filter output
- **AND** the ephemeral browser output passes only when it instructs the
  operator to open the URL printed by the viewer command log
- **AND** the selected text block remains browser-only and non-executing

#### Scenario: Ephemeral browser-only drift fails closed

- **WHEN** the ephemeral browser-only output omits the fixed viewer-log
  instruction, includes `http://127.0.0.1:0/`, includes relay, host, or viewer
  runtime command blocks, or contains malformed role-filter metadata
- **THEN** `mvp:ready` treats the `ephemeral-role-filter-browser-command`
  check as failed
- **AND** output uses only fixed check status and bounded reason metadata
- **AND** diagnostics do not echo the unsafe command string, URL, port, token,
  pairing code, path, stdout, stderr, child output, credential, screen content,
  input content, or full secret

### Requirement: Viewer role ready includes ephemeral browser-only validation

The role-scoped viewer MVP ready helper SHALL validate the explicit ephemeral
browser-only command output in addition to the fixed viewer and browser
role-filter outputs. `npm run mvp:ready -- --role viewer` SHALL run the same
non-executing `mvp:commands -- --only browser --viewer-control-surface-port 0`
validation as the aggregate ready helper and SHALL fail closed with only fixed
check metadata when that output drifts. Relay and host role-scoped ready plans
MUST NOT add this viewer-browser check. The validation MUST NOT echo generated
command strings, local URLs, ports, relay URLs, pairing codes, token
references, local paths, stdout, stderr, child output, mutation tokens,
credentials, screen contents, input contents, or full secrets. It MUST remain
non-executing and MUST NOT start relay, host, viewer, browser, capture, input,
sockets, HTTP listeners, services, startup persistence, unattended access,
privilege elevation, remote discovery, firewall changes, AV/EDR evasion,
Windows prompt bypass, or hidden-session behavior.

#### Scenario: Viewer role ready covers ephemeral browser output

- **WHEN** a developer runs `npm run mvp:ready -- --role viewer`
- **THEN** the helper validates doctor, native preflight, viewer role-filter,
  browser role-filter, and ephemeral browser role-filter output
- **AND** output reports only bounded fixed status for those checks

#### Scenario: Relay and host role ready remain scoped

- **WHEN** a developer runs `npm run mvp:ready -- --role relay` or
  `npm run mvp:ready -- --role host`
- **THEN** the helper does not run the viewer ephemeral browser-only check
- **AND** it remains scoped to the local role's readiness checks

### Requirement: Relay role ready validates LAN relay-only bind output

The role-scoped relay MVP ready helper SHALL validate a representative LAN
relay-only command output in addition to the fixed localhost relay role-filter
output. `npm run mvp:ready -- --role relay` SHALL run the non-executing command
kit as `mvp:commands -- --only relay --relay-host 192.168.1.10` and SHALL
internally require the reviewed `WINBRIDGE_RELAY_BIND_HOST = '0.0.0.0'` relay
bind marker while preserving relay-only output validation. Host and viewer
role-scoped ready plans MUST NOT add this relay LAN-only check.

The validation MUST fail closed with only fixed check metadata when the output
drifts. It MUST NOT echo generated command strings, relay URLs, local URLs,
ports, pairing codes, token references, local paths, stdout, stderr, child
output, credentials, screen contents, input contents, or full secrets. It MUST
remain non-executing and MUST NOT start relay, host, viewer, browser, capture,
input, sockets, HTTP listeners, services, startup persistence, unattended
access, privilege elevation, LAN discovery, firewall changes, AV/EDR evasion,
Windows prompt bypass, or hidden-session behavior.

#### Scenario: Relay role ready covers LAN relay-only output

- **WHEN** a developer runs `npm run mvp:ready -- --role relay`
- **THEN** the helper validates doctor, localhost relay role-filter output,
  and LAN relay role-filter output
- **AND** the LAN relay validation passes only when the relay-only block
  includes the reviewed LAN bind marker
- **AND** output reports only bounded fixed status for those checks

#### Scenario: Host and viewer role ready remain scoped

- **WHEN** a developer runs `npm run mvp:ready -- --role host` or
  `npm run mvp:ready -- --role viewer`
- **THEN** the helper does not run the relay LAN-only check
- **AND** each role remains scoped to its local readiness checks

### Requirement: Host and viewer role ready validate LAN agent-only output

The role-scoped host and viewer MVP ready helpers SHALL validate
representative LAN agent-only command output in addition to the fixed localhost
role-filter output. `npm run mvp:ready -- --role host` SHALL run the
non-executing command kit as
`mvp:commands -- --only host --relay-host 192.168.1.10` and internally require
the representative `ws://192.168.1.10:8787/` relay URL shape while preserving
host-only output validation. `npm run mvp:ready -- --role viewer` SHALL do the
same for `mvp:commands -- --only viewer --relay-host 192.168.1.10` while
preserving viewer-only output validation. Relay role-scoped readiness MUST NOT
add host or viewer LAN agent-only checks.

The validation MUST fail closed with only fixed check metadata when the output
drifts. It MUST NOT echo generated command strings, relay URLs, local URLs,
ports, pairing codes, token references, local paths, stdout, stderr, child
output, credentials, screen contents, input contents, or full secrets. It MUST
remain non-executing and MUST NOT start relay, host, viewer, browser, capture,
input, sockets, HTTP listeners, services, startup persistence, unattended
access, privilege elevation, LAN discovery, firewall changes, AV/EDR evasion,
Windows prompt bypass, or hidden-session behavior.

#### Scenario: Host role ready covers LAN host-only output

- **WHEN** a developer runs `npm run mvp:ready -- --role host`
- **THEN** the helper validates doctor, native preflight, localhost host
  role-filter output, and LAN host role-filter output
- **AND** output reports only bounded fixed status for those checks

#### Scenario: Viewer role ready covers LAN viewer-only output

- **WHEN** a developer runs `npm run mvp:ready -- --role viewer`
- **THEN** the helper validates doctor, native preflight, localhost viewer
  role-filter output, LAN viewer role-filter output, browser role-filter
  output, and ephemeral browser role-filter output
- **AND** output reports only bounded fixed status for those checks

#### Scenario: Relay role ready remains scoped

- **WHEN** a developer runs `npm run mvp:ready -- --role relay`
- **THEN** the helper does not run host or viewer LAN agent-only checks
- **AND** relay readiness remains scoped to relay command validation

### Requirement: Host and viewer role ready validate token-env agent-only output

The role-scoped host and viewer MVP ready helpers SHALL validate token-env agent-only command output in addition to the fixed localhost and representative LAN role-filter output. `npm run mvp:ready -- --role host` SHALL run the non-executing command kit as `mvp:commands -- --only host --token-env WINBRIDGE_RELAY_SHARED_TOKEN` and internally require the reviewed `$env:WINBRIDGE_RELAY_SHARED_TOKEN` token reference while preserving host-only output validation. `npm run mvp:ready -- --role viewer` SHALL do the same for `mvp:commands -- --only viewer --token-env WINBRIDGE_RELAY_SHARED_TOKEN` while preserving viewer-only output validation. Relay role-scoped readiness MUST NOT add host or viewer token-env agent-only checks.

The validation MUST fail closed with only fixed check metadata when the output drifts. It MUST NOT echo generated command strings, relay URLs, local URLs, ports, pairing codes, token references, local paths, stdout, stderr, child output, credentials, screen contents, input contents, or full secrets. It MUST remain non-executing and MUST NOT start relay, host, viewer, browser, capture, input, sockets, HTTP listeners, services, startup persistence, unattended access, privilege elevation, LAN discovery, firewall changes, AV/EDR evasion, Windows prompt bypass, or hidden-session behavior.

#### Scenario: Host role ready covers token-env host-only output

- **WHEN** a developer runs `npm run mvp:ready -- --role host`
- **THEN** the helper validates doctor, native preflight, localhost host role-filter output, LAN host role-filter output, and token-env host role-filter output
- **AND** output reports only bounded fixed status for those checks

#### Scenario: Viewer role ready covers token-env viewer-only output

- **WHEN** a developer runs `npm run mvp:ready -- --role viewer`
- **THEN** the helper validates doctor, native preflight, localhost viewer role-filter output, LAN viewer role-filter output, token-env viewer role-filter output, browser role-filter output, and ephemeral browser role-filter output
- **AND** output reports only bounded fixed status for those checks

#### Scenario: Token-env role output drift fails closed

- **WHEN** the token-env role-filter output omits the expected bounded environment-variable reference, includes a raw token value instead, includes another role's runtime command block, or contains malformed role-filter metadata
- **THEN** `mvp:ready -- --role host` or `mvp:ready -- --role viewer` treats the matching token-env role-filter check as failed
- **AND** diagnostics do not echo the unsafe command string, token reference, token value, relay URL, pairing code, path, stdout, stderr, child output, credential, screen content, input content, or full secret

#### Scenario: Relay role ready remains token-env scoped

- **WHEN** a developer runs `npm run mvp:ready -- --role relay`
- **THEN** the helper does not run host or viewer token-env agent-only checks
- **AND** relay readiness remains scoped to relay command validation

### Requirement: Default ready validates token-env role-filter output

The default aggregate MVP ready helper SHALL validate host and viewer token-env role-filtered command output in addition to the full shared-token command-plan validation and fixed localhost role-filter command validation. `npm run mvp:ready` SHALL run the non-executing command kit as `mvp:commands -- --only host --token-env WINBRIDGE_RELAY_SHARED_TOKEN` and `mvp:commands -- --only viewer --token-env WINBRIDGE_RELAY_SHARED_TOKEN`, internally require the reviewed `$env:WINBRIDGE_RELAY_SHARED_TOKEN` token reference, and preserve host-only or viewer-only output validation for the selected target.

The validation MUST fail closed with only fixed check metadata when the output drifts. It MUST NOT echo generated command strings, relay URLs, local URLs, ports, pairing codes, token references, local paths, stdout, stderr, child output, credentials, screen contents, input contents, or full secrets. It MUST remain non-executing and MUST NOT start relay, host, viewer, browser, capture, input, sockets, HTTP listeners, services, startup persistence, unattended access, privilege elevation, LAN discovery, firewall changes, AV/EDR evasion, Windows prompt bypass, or hidden-session behavior.

#### Scenario: Default ready covers token-env host and viewer role filters

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the helper validates the full shared-token command plan
- **AND** it validates token-env host role-filter output
- **AND** it validates token-env viewer role-filter output
- **AND** output reports only bounded fixed status for those checks

#### Scenario: Default token-env role-filter drift fails closed

- **WHEN** the default token-env host or viewer role-filter output omits the expected bounded environment-variable reference, includes a raw token value instead, includes another role's runtime command block, or contains malformed role-filter metadata
- **THEN** `mvp:ready` treats the matching token-env role-filter check as failed
- **AND** diagnostics do not echo the unsafe command string, token reference, token value, relay URL, pairing code, path, stdout, stderr, child output, credential, screen content, input content, or full secret

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

### Requirement: Ready helper explicitly aggregates token-env smoke

The root MVP ready helper SHALL support an explicit `--include-token-smoke`
option in default aggregate mode. When provided, the helper SHALL run the root
MVP smoke check in bounded JSON mode with
`--token-env WINBRIDGE_RELAY_SHARED_TOKEN` after the default non-smoke
readiness checks and any explicitly requested default/LAN smoke checks. The
token-smoke readiness step MUST reuse the existing bounded smoke JSON parser
and report only fixed check metadata, safe failure reasons, and sanitized audit
summary metadata. Without `--include-token-smoke`, the default helper SHALL
mark token-smoke as explicitly skipped metadata only. Role-scoped readiness
MUST reject `--include-token-smoke`. The helper MUST stop on the first failed
check and MUST NOT expose raw token values, token environment values, child
command strings, child environment maps, relay URLs, pairing codes, stdout,
stderr, child output, credentials, screen contents, input contents, clipboard
contents, or full secrets in human or JSON output. The option MUST NOT change
relay, host, viewer, capture, input, authorization, consent, audit, service,
startup, privilege, unattended, AV/EDR evasion, Windows prompt bypass, or
hidden-session behavior.

#### Scenario: Token-smoke readiness runs only when explicitly requested

- **WHEN** a developer runs `npm run mvp:ready -- --include-token-smoke`
- **THEN** the helper runs the existing default readiness checks
- **AND** it runs a `token-smoke` step as
  `npm run mvp:smoke -- --json --token-env WINBRIDGE_RELAY_SHARED_TOKEN`
- **AND** readiness output reports only bounded fixed status and smoke
  subcheck metadata for `token-smoke`

#### Scenario: Token-smoke readiness can combine with default smoke

- **WHEN** a developer runs
  `npm run mvp:ready -- --include-smoke --include-token-smoke`
- **THEN** the helper runs default smoke, LAN-style smoke, and token-smoke
  after the default readiness checks
- **AND** each smoke result is parsed through the same bounded smoke JSON
  readiness path

#### Scenario: Token-smoke is skipped by default and rejected for roles

- **WHEN** a developer runs `npm run mvp:ready` without token-smoke
- **THEN** readiness output marks `token-smoke` as skipped metadata only
- **AND** it does not start relay, host, viewer, or smoke children
- **WHEN** a developer combines `--role relay`, `--role host`, or
  `--role viewer` with `--include-token-smoke`
- **THEN** the helper rejects the arguments before running checks
- **AND** diagnostics remain bounded and secret-safe

### Requirement: Ready helper explicitly aggregates LAN token-env smoke

The root MVP ready helper SHALL support an explicit
`--include-lan-token-smoke` option in default aggregate mode. When provided,
the helper SHALL run the root MVP smoke check in bounded JSON mode with
`--lan-relay --token-env WINBRIDGE_RELAY_SHARED_TOKEN` after the default
non-smoke readiness checks and any explicitly requested default, LAN-style, or
token smoke checks. The `lan-token-smoke` readiness step MUST reuse the
existing bounded smoke JSON parser and report only fixed check metadata, safe
failure reasons, and sanitized audit summary metadata. Without
`--include-lan-token-smoke`, the default helper SHALL mark `lan-token-smoke` as
explicitly skipped metadata only. Role-scoped readiness MUST reject
`--include-lan-token-smoke`.

The helper MUST stop on the first failed check and MUST NOT expose raw token
values, token environment values, child command strings, child environment
maps, relay URLs, pairing codes, stdout, stderr, child output, credentials,
screen contents, input contents, clipboard contents, or full secrets in human
or JSON output. The option MUST NOT change relay bind settings, host, viewer,
capture, input, authorization, consent, audit, service, startup, privilege,
unattended, AV/EDR evasion, Windows prompt bypass, or hidden-session behavior.

#### Scenario: LAN token-smoke readiness runs only when explicitly requested

- **WHEN** a developer runs
  `npm run mvp:ready -- --include-lan-token-smoke`
- **THEN** the helper runs the existing default readiness checks
- **AND** it runs a `lan-token-smoke` step as
  `npm run mvp:smoke -- --json --lan-relay --token-env WINBRIDGE_RELAY_SHARED_TOKEN`
- **AND** readiness output reports only bounded fixed status and smoke
  subcheck metadata for `lan-token-smoke`

#### Scenario: LAN token-smoke readiness composes with existing smoke flags

- **WHEN** a developer runs
  `npm run mvp:ready -- --include-smoke --include-token-smoke --include-lan-token-smoke`
- **THEN** the helper runs default smoke, LAN-style smoke, token-smoke, and
  LAN token-smoke after the default readiness checks
- **AND** each smoke result is parsed through the same bounded smoke JSON
  readiness path

#### Scenario: LAN token-smoke is skipped by default and rejected for roles

- **WHEN** a developer runs `npm run mvp:ready` without LAN token-smoke
- **THEN** readiness output marks `lan-token-smoke` as skipped metadata only
- **AND** it does not start relay, host, viewer, or smoke children
- **WHEN** a developer combines `--role relay`, `--role host`, or
  `--role viewer` with `--include-lan-token-smoke`
- **THEN** the helper rejects the arguments before running checks
- **AND** diagnostics remain bounded and secret-safe

#### Scenario: LAN token-smoke does not expose public relay behavior

- **WHEN** a developer includes LAN token-smoke readiness
- **THEN** the smoke workflow remains the reviewed same-machine LAN-style
  smoke path
- **AND** it does not configure LAN or public relay bind settings, discovery,
  firewall changes, services, startup persistence, unattended access, Windows
  capture, OS input application, browser automation, or hidden sessions

### Requirement: Ready helper explicitly aggregates all smoke variants

The root MVP ready helper SHALL support an explicit `--include-all-smoke`
option in default aggregate mode. When provided, the helper SHALL run all
existing smoke readiness variants after the default non-smoke readiness checks:
default smoke as `mvp:smoke -- --json`, LAN-style smoke as
`mvp:smoke -- --json --lan-relay`, token-protected smoke as
`mvp:smoke -- --json --token-env WINBRIDGE_RELAY_SHARED_TOKEN`, and LAN-style
token-protected smoke as
`mvp:smoke -- --json --lan-relay --token-env WINBRIDGE_RELAY_SHARED_TOKEN`.
Each smoke step MUST reuse the existing bounded smoke JSON parser and report
only fixed check metadata, safe failure reasons, and sanitized audit summary
metadata.

The helper MUST reject `--include-all-smoke` when combined with
`--include-smoke`, `--include-token-smoke`, `--include-lan-token-smoke`, or any
role-scoped readiness option before running checks. The helper MUST stop on the
first failed check and MUST NOT expose raw token values, token environment
values, child command strings, child environment maps, relay URLs, local URLs,
pairing codes, stdout, stderr, child output, credentials, screen contents,
input contents, clipboard contents, or full secrets in human or JSON output.
The option MUST NOT add or change relay bind settings, host, viewer, capture,
input, authorization, consent, audit, service, startup, privilege, unattended,
AV/EDR evasion, Windows prompt bypass, or hidden-session behavior.

#### Scenario: All-smoke readiness runs every existing smoke variant

- **WHEN** a developer runs `npm run mvp:ready -- --include-all-smoke`
- **THEN** the helper runs the existing default readiness checks
- **AND** it runs `smoke`, `lan-smoke`, `token-smoke`, and `lan-token-smoke`
  after those checks
- **AND** each smoke result is parsed through the same bounded smoke JSON
  readiness path
- **AND** readiness output reports only bounded fixed status and smoke subcheck
  metadata

#### Scenario: All-smoke rejects ambiguous combinations

- **WHEN** a developer combines `--include-all-smoke` with `--include-smoke`,
  `--include-token-smoke`, `--include-lan-token-smoke`, `--role relay`,
  `--role host`, or `--role viewer`
- **THEN** the helper rejects the arguments before running checks
- **AND** diagnostics do not echo raw unsafe input, token values, command
  strings, relay URLs, local URLs, pairing codes, stdout, stderr, child output,
  credentials, screen contents, input contents, clipboard contents, or full
  secrets

#### Scenario: Default readiness remains non-smoke unless explicitly requested

- **WHEN** a developer runs `npm run mvp:ready` without smoke flags
- **THEN** readiness output marks `smoke`, `lan-smoke`, `token-smoke`, and
  `lan-token-smoke` as skipped metadata only
- **AND** it does not start relay, host, viewer, browser, smoke children,
  capture, input, sockets, HTTP listeners, services, startup persistence,
  unattended access, privilege elevation, LAN discovery, firewall changes,
  AV/EDR evasion, Windows prompt bypass, or hidden-session behavior

### Requirement: Smoke helper does not inherit ambient relay token by default

The root MVP smoke helper MUST NOT implicitly configure the local relay with an
ambient `WINBRIDGE_RELAY_SHARED_TOKEN` value from the parent process unless the
smoke invocation explicitly includes `--token-env`. Default smoke and LAN-style
smoke MUST remain tokenless even when the parent shell has
`WINBRIDGE_RELAY_SHARED_TOKEN` set for other checks. Token-protected smoke MUST
continue to pass the resolved bounded token only when `--token-env` is
provided. Human and JSON smoke output MUST NOT expose raw token values, token
environment values, child command strings, child environment maps, relay URLs,
pairing codes, stdout, stderr, child output, credentials, screen contents,
input contents, clipboard contents, or full secrets.

#### Scenario: Default smoke ignores ambient relay token

- **WHEN** a developer runs `npm run mvp:smoke -- --json` from a shell where
  `WINBRIDGE_RELAY_SHARED_TOKEN` is set
- **THEN** the smoke helper starts its local relay without that shared-token
  configuration
- **AND** the existing tokenless host and viewer smoke children can connect
  through the local relay
- **AND** smoke output reports only bounded fixed check metadata

#### Scenario: Explicit token smoke still configures relay token

- **WHEN** a developer runs
  `npm run mvp:smoke -- --json --token-env WINBRIDGE_RELAY_SHARED_TOKEN`
- **THEN** the smoke helper starts its local relay with the resolved bounded
  shared-token value
- **AND** it passes the same token to host and viewer through their existing
  token option
- **AND** diagnostics remain bounded and secret-safe

### Requirement: Command kit prints all-smoke preflight gate

The MVP command kit SHALL include the all-smoke readiness gate in generated
full-session, preflight-only, and JSON command-plan output. Human output SHALL
show `npm run mvp:ready -- --include-all-smoke` as a local preflight command
for full smoke coverage before a two-PC trial. JSON output SHALL include a
fixed command entry named `preflight.ready-all-smoke`. The root ready helper's
command-plan validation SHALL require that fixed command entry in addition to
the existing preflight, relay, host, viewer, and browser command entries.

When the command kit is rendered with `--token-env <NAME>`, the all-smoke
preflight instruction MAY include an environment-reference assignment from
`$env:<NAME>` to `$env:WINBRIDGE_RELAY_SHARED_TOKEN`, but it MUST NOT print raw
token values or token environment values. The command kit MUST remain
non-executing and MUST NOT start relay, host, viewer, browser, smoke, capture,
input, sockets, HTTP listeners, services, startup persistence, unattended
access, privilege elevation, LAN discovery, firewall changes, AV/EDR evasion,
Windows prompt bypass, hidden sessions, clipboard access, file transfer, or
diagnostics collection.

#### Scenario: Full command plan prints all-smoke preflight

- **WHEN** a developer runs `npm run mvp:commands`
- **THEN** the full command plan includes `npm run mvp:ready -- --include-all-smoke`
  in the preflight section
- **AND** it indicates the gate is for full local smoke coverage
- **AND** the helper still prints commands only

#### Scenario: Token-env command plan keeps all-smoke secret-safe

- **WHEN** a developer runs
  `npm run mvp:commands -- --token-env WINBRIDGE_TEST_RELAY_TOKEN`
- **THEN** the all-smoke preflight instruction references
  `$env:WINBRIDGE_TEST_RELAY_TOKEN` and `$env:WINBRIDGE_RELAY_SHARED_TOKEN`
- **AND** it does not print a token value, command output, stdout, stderr,
  credential, screen content, input content, clipboard content, or full secret

#### Scenario: JSON command plan exposes fixed all-smoke entry

- **WHEN** a developer runs `npm run mvp:commands -- --json`
- **THEN** the JSON command list includes a fixed `preflight.ready-all-smoke`
  command entry
- **AND** `mvp:ready` command-plan validation requires that fixed entry
- **AND** readiness diagnostics do not echo the command string, token
  references, relay URLs, local URLs, local paths, pairing codes, stdout,
  stderr, child output, credentials, screen contents, input contents,
  clipboard contents, or full secrets

#### Scenario: Preflight-only output remains non-executing

- **WHEN** a developer runs `npm run mvp:commands -- --preflight-only`
- **THEN** the preflight-only output includes the all-smoke readiness gate
- **AND** it does not include relay, host, viewer, browser, capture, input,
  service, startup, privilege, unattended, or hidden-session commands

### Requirement: Command kit prints Windows control preflight gate

The MVP command kit SHALL include a fixed Windows control smoke readiness gate
in generated full-session, preflight-only, and JSON command-plan output. Human
output SHALL show `npm run mvp:ready -- --include-windows-control-smoke` as an
explicit native Windows control preflight command before a two-PC MVP trial.
JSON output SHALL include a fixed command entry named
`preflight.ready-windows-control-smoke` whose command is exactly
`npm run mvp:ready -- --include-windows-control-smoke`. The root ready helper's
command-plan validation SHALL require that fixed command entry in addition to
the existing preflight, relay, host, viewer, and browser command entries.

This command entry MUST remain non-executing command-plan output and MUST NOT
start relay, host, viewer, browser, smoke, capture, input, sockets, HTTP
listeners, services, startup persistence, unattended access, privilege
elevation, LAN discovery, firewall changes, AV/EDR evasion, Windows prompt
bypass, hidden sessions, clipboard access, file transfer, diagnostics
collection, credential access, or hidden capture/input activity. The entry MUST
remain separate from `--include-all-smoke`.

#### Scenario: Full command plan prints Windows control preflight

- **WHEN** a developer runs `npm run mvp:commands`
- **THEN** the full command plan includes
  `npm run mvp:ready -- --include-windows-control-smoke` in the preflight
  section
- **AND** it indicates the gate is explicit native Windows control smoke
  coverage
- **AND** the helper still prints commands only

#### Scenario: Preflight-only output prints Windows control preflight

- **WHEN** a developer runs `npm run mvp:commands -- --preflight-only`
- **THEN** the preflight-only output includes
  `npm run mvp:ready -- --include-windows-control-smoke`
- **AND** it does not include relay, host, viewer, browser, capture, input,
  service, startup, privilege, unattended, or hidden-session commands

#### Scenario: JSON command plan exposes fixed Windows control entry

- **WHEN** a developer runs `npm run mvp:commands -- --json`
- **THEN** the JSON command list includes a fixed
  `preflight.ready-windows-control-smoke` command entry
- **AND** `mvp:ready` command-plan validation requires that fixed entry
- **AND** readiness diagnostics do not echo generated command strings, token
  references, relay URLs, local URLs, local paths, pairing codes, stdout,
  stderr, child output, credentials, screen contents, input contents,
  clipboard contents, or full secrets

#### Scenario: Windows control preflight remains explicit

- **WHEN** a developer runs `npm run mvp:ready -- --include-all-smoke`
- **THEN** the ready helper still does not run the combined Windows control
  smoke
- **AND** no `mvp:smoke -- --windows-capture --windows-input` command is
  planned unless `--include-windows-control-smoke` is supplied explicitly

### Requirement: Preflight role filter emits bounded JSON

The MVP command kit SHALL support `--only preflight --json` as a bounded
machine-readable preflight command plan. The output SHALL be equivalent in
shape and command entries to `--preflight-only --json`, including `ok: true`,
`mode: "preflight"`, `nonExecuting: true`, fixed preflight command entries,
and bounded safety strings. The helper MUST remain non-executing and MUST NOT
start relay, host, viewer, browser, smoke, capture, input, sockets, HTTP
listeners, services, startup persistence, unattended access, privilege
elevation, LAN discovery, firewall changes, AV/EDR evasion, Windows prompt
bypass, hidden sessions, clipboard access, file transfer, diagnostics
collection, or credential access.

JSON role-filter output for `relay`, `host`, `viewer`, and `browser` SHALL
remain rejected. `--only preflight --json` SHALL remain incompatible with
`--preflight-only`, `--generate-pairing`, and session-specific command options.

#### Scenario: Preflight-only target prints preflight JSON

- **WHEN** a developer runs `npm run mvp:commands -- --only preflight --json`
- **THEN** the helper emits bounded JSON with `mode` set to `preflight`
- **AND** the command list includes the fixed preflight entries including
  `preflight.ready-all-smoke`
- **AND** the output does not include relay, host, viewer, browser, capture,
  input, service, startup, privilege, unattended, or hidden-session commands

#### Scenario: Runtime role filters remain text-only

- **WHEN** a developer runs `npm run mvp:commands -- --only host --json`
- **THEN** the helper fails with bounded usage text
- **AND** it does not echo unsafe raw values, secrets, command output, stdout,
  stderr, credentials, screen contents, input contents, clipboard contents, or
  full secrets

#### Scenario: Ready validates preflight JSON target drift

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the ready helper validates the non-executing
  `mvp:commands -- --only preflight --json` output
- **AND** it fails closed if the bounded preflight JSON shape or fixed command
  entries drift
- **AND** readiness diagnostics do not echo generated command strings, token
  references, local URLs, local paths, pairing codes, stdout, stderr, child
  output, credentials, screen contents, input contents, clipboard contents, or
  full secrets

### Requirement: Preflight command plans support token-env all-smoke readiness

The MVP command kit SHALL allow `--token-env <NAME>` with `--preflight-only`
and with `--only preflight --json`. When provided, the preflight-only text and
JSON command plans MUST render the `preflight.ready-all-smoke` instruction as an
environment-reference assignment from `$env:<NAME>` to
`$env:WINBRIDGE_RELAY_SHARED_TOKEN` followed by
`npm run mvp:ready -- --include-all-smoke`. The command kit MUST continue to
reject raw token values and MUST NOT print token values.

#### Scenario: Preflight-only text uses token environment reference

- **WHEN** a developer runs
  `npm run mvp:commands -- --preflight-only --token-env WINBRIDGE_TEST_RELAY_TOKEN`
- **THEN** the helper renders only the bounded preflight command set
- **AND** the all-smoke instruction references
  `$env:WINBRIDGE_TEST_RELAY_TOKEN`
- **AND** the helper does not render relay, host, viewer, browser, capture, or
  input commands

#### Scenario: Preflight JSON target uses token environment reference

- **WHEN** a developer runs
  `npm run mvp:commands -- --only preflight --json --token-env WINBRIDGE_TEST_RELAY_TOKEN`
- **THEN** the helper emits bounded JSON with `mode` set to `preflight`
- **AND** the command list includes `preflight.ready-all-smoke` with the
  reviewed token environment assignment
- **AND** the output remains non-executing

#### Scenario: Malformed token preflight options fail closed

- **WHEN** a developer combines preflight-only output with raw `--token`, a
  malformed token environment name, or session-specific options
- **THEN** the command kit rejects the input before rendering commands
- **AND** the usage output does not echo raw unsafe values

### Requirement: Ready validates token-env preflight JSON drift

The root MVP ready helper SHALL validate token-env preflight JSON output in the
default aggregate readiness plan. It SHALL run the non-executing command kit as
`mvp:commands -- --only preflight --json --token-env WINBRIDGE_RELAY_SHARED_TOKEN`
and MUST fail closed if the bounded JSON shape, fixed preflight command list, or
reviewed `preflight.ready-all-smoke` token environment assignment drifts.

#### Scenario: Default readiness validates token-env preflight JSON

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the helper validates the normal preflight JSON plan and the token-env
  preflight JSON plan
- **AND** it fails closed if the token-env preflight all-smoke command omits the
  reviewed `$env:WINBRIDGE_RELAY_SHARED_TOKEN` reference

### Requirement: MVP smoke check verifies viewer surface Host guard

The root MVP smoke check SHALL verify that the live loopback viewer local
control surface rejects a fixed mismatched `Host` header before treating the
surface as guard-ready. This Host guard probe MUST be part of the existing
`surface-guards` smoke subcheck and MUST fail closed with the bounded
`surface-guards-not-ready` reason when the mismatched Host request is accepted,
times out, returns malformed output, returns a server error, or returns any
unexpected shape. The probe and smoke output MUST NOT expose local URLs, ports,
origins, Host values, mutation tokens, frame bytes, authorization ids, command
bodies, child output, pairing codes, credentials, screen contents, input
contents, clipboard contents, or full secrets.

#### Scenario: Mismatched Host rejection is required for smoke readiness

- **WHEN** the root MVP smoke check reaches the local viewer surface guard step
- **THEN** it sends a fixed mismatched-Host request to the live local viewer
  surface
- **AND** the smoke check continues only when the surface returns bounded
  rejection metadata

#### Scenario: Host guard drift fails the surface guard subcheck

- **WHEN** the live local viewer surface accepts, errors, times out, or returns
  malformed output for the mismatched-Host probe
- **THEN** the smoke helper exits non-zero with the bounded
  `surface-guards-not-ready` reason
- **AND** JSON output marks only fixed smoke check names without exposing local
  URLs, ports, Host values, mutation tokens, frame bytes, commands, child
  output, credentials, input contents, or full secrets

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

### Requirement: MVP ready help describes default non-executing validation

The root MVP ready helper's usage text SHALL accurately describe the default
readiness validation categories. The help text MUST state that default mode
runs doctor and native preflight checks plus non-executing command-plan
validation for the reviewed command-plan, role-filter, LAN, token-env, and
ephemeral browser outputs. The help text MUST also state that smoke remains
explicitly opt-in. The help path MUST NOT run relay, host, viewer, browser,
smoke, capture, input, services, startup persistence, privilege elevation, or
remote assistance actions, and MUST NOT expose command output, child output,
relay URLs, tokens, pairing codes, local paths, frame bytes, input contents, or
diagnostics.

#### Scenario: Help text matches default readiness categories

- **WHEN** a developer asks for `npm run mvp:ready -- --help`
- **THEN** the helper prints static usage text that names doctor, native
  preflight, command-plan, role-filter, LAN, token-env, and ephemeral browser
  validation
- **AND** it does not claim that default mode runs only doctor and native
  preflight checks
- **AND** it states that smoke is explicit

### Requirement: MVP command kit prints token-env guidance for filtered commands

The MVP command kit SHALL include bounded token-env guidance in text output for
`--only relay`, `--only host`, `--only viewer`, and `--only browser` when
`--token-env <NAME>` is provided. The guidance MUST reference only the
environment variable name, MUST state that the raw token value is not printed,
and MUST NOT print token values, credentials, pairing codes, local paths,
command output, child output, frame bytes, input contents, diagnostics, or raw
input. The helper MUST remain non-executing.

#### Scenario: Relay role-filter output includes token-env guidance

- **WHEN** a developer requests `mvp:commands -- --only relay --token-env <NAME>`
- **THEN** the helper prints the relay-only command output plus bounded token-env
  guidance
- **AND** the output does not include a raw token value

### Requirement: MVP ready validates token-env relay role-filter output

The default and relay-scoped MVP ready helpers SHALL validate relay role-filter
command output generated with `--token-env WINBRIDGE_RELAY_SHARED_TOKEN`. The
readiness check MUST require relay-only role-filter markers and the reviewed
`$env:WINBRIDGE_RELAY_SHARED_TOKEN` reference. It MUST fail closed when the
reference is missing, malformed, replaced with a raw token literal, or combined
with host, viewer, or browser runtime blocks. Failure output MUST remain
bounded and MUST NOT echo command output, child output, relay URLs, token
values, pairing codes, credentials, local paths, frame bytes, input contents,
diagnostics, or raw input.

#### Scenario: Default ready validates token-env relay role-filter

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the helper runs a non-executing
  `mvp:commands -- --only relay --token-env WINBRIDGE_RELAY_SHARED_TOKEN`
  validation step
- **AND** it reports only bounded status metadata

#### Scenario: Relay-scoped ready validates token-env relay role-filter

- **WHEN** a developer runs `npm run mvp:ready -- --role relay`
- **THEN** the helper validates both localhost relay role-filter output and
  token-env relay role-filter output
- **AND** it does not run host, viewer, browser, capture, or input checks

### Requirement: Preflight token-env all-smoke omits self-assignment

The MVP command kit SHALL avoid redundant token-env self-assignment in
`preflight.ready-all-smoke` command output. When a preflight command plan is
rendered with `--token-env WINBRIDGE_RELAY_SHARED_TOKEN`, the all-smoke
preflight command MUST be the fixed non-assignment command
`npm run mvp:ready -- --include-all-smoke` and the text or JSON plan MUST still
include bounded token-mode guidance that references only `$env:<NAME>` and
states that the raw token value is not printed. When rendered with any other
bounded `--token-env <NAME>`, the command MAY keep the reviewed
environment-reference assignment from `$env:<NAME>` to
`$env:WINBRIDGE_RELAY_SHARED_TOKEN`. The command kit MUST NOT print raw token
values, command output, child output, relay URLs, local URLs, pairing codes,
credentials, local paths, frame bytes, input contents, clipboard contents,
diagnostics, or full secrets.

The root MVP ready helper SHALL accept the no-assignment
`preflight.ready-all-smoke` command only when validating the reviewed expected
token env `WINBRIDGE_RELAY_SHARED_TOKEN`; it MUST still fail closed if the
token-env preflight JSON command omits the fixed command entry, uses an
unexpected environment variable name in an assignment or bounded token-mode
guidance, includes a raw token literal, changes the preflight JSON shape, or
includes runtime command-plan drift.

#### Scenario: Reviewed token-env preflight command omits self-assignment

- **WHEN** a developer runs
  `npm run mvp:commands -- --preflight-only --token-env WINBRIDGE_RELAY_SHARED_TOKEN`
- **THEN** the all-smoke preflight instruction is
  `npm run mvp:ready -- --include-all-smoke`
- **AND** the output does not include
  `$env:WINBRIDGE_RELAY_SHARED_TOKEN = $env:WINBRIDGE_RELAY_SHARED_TOKEN`
- **AND** the output includes bounded token-mode guidance for
  `$env:WINBRIDGE_RELAY_SHARED_TOKEN`
- **AND** the helper remains non-executing and secret-safe

#### Scenario: Alternate token-env preflight command keeps assignment

- **WHEN** a developer runs
  `npm run mvp:commands -- --preflight-only --token-env WINBRIDGE_TEST_RELAY_TOKEN`
- **THEN** the all-smoke preflight instruction references
  `$env:WINBRIDGE_TEST_RELAY_TOKEN` and `$env:WINBRIDGE_RELAY_SHARED_TOKEN`
  through the reviewed environment-reference assignment
- **AND** it does not print a raw token value

#### Scenario: Ready accepts reviewed no-assignment token preflight JSON

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the token-env preflight JSON validation accepts the reviewed
  no-assignment all-smoke command for `WINBRIDGE_RELAY_SHARED_TOKEN`
- **AND** it requires bounded token-mode guidance for
  `$env:WINBRIDGE_RELAY_SHARED_TOKEN`
- **AND** readiness diagnostics report only bounded fixed status metadata

#### Scenario: Ready rejects alternate or raw token drift

- **WHEN** token-env preflight JSON output uses an unexpected token env
  assignment, omits bounded token-mode guidance, omits the all-smoke command,
  includes a raw token literal, or changes the preflight JSON shape
- **THEN** the ready helper fails closed
- **AND** diagnostics do not echo generated command strings, token references,
  token values, stdout, stderr, child output, credentials, screen contents,
  input contents, clipboard contents, or full secrets

### Requirement: MVP ready validates token-env browser role-filter output

The default and viewer-scoped MVP ready helpers SHALL validate browser
role-filter command output generated with
`--token-env WINBRIDGE_RELAY_SHARED_TOKEN`. The readiness check MUST run the
non-executing command kit as
`mvp:commands -- --only browser --token-env WINBRIDGE_RELAY_SHARED_TOKEN`,
require browser-only role-filter markers, require bounded token-mode guidance
for `$env:WINBRIDGE_RELAY_SHARED_TOKEN`, and reject output that is missing the
token guidance, replaces it with a raw token literal, adds `--token` runtime
arguments, or combines browser output with relay, host, viewer, or preflight
runtime blocks. Failure output MUST remain bounded and MUST NOT echo generated
command strings, local URLs, relay URLs, token values, token environment
values, pairing codes, credentials, local paths, frame bytes, input contents,
stdout, stderr, child output, diagnostics, or full secrets.

#### Scenario: Default ready validates token-env browser role-filter

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the helper runs a non-executing
  `mvp:commands -- --only browser --token-env WINBRIDGE_RELAY_SHARED_TOKEN`
  validation step
- **AND** it reports only bounded fixed status metadata

#### Scenario: Viewer-scoped ready validates token-env browser role-filter

- **WHEN** a developer runs `npm run mvp:ready -- --role viewer`
- **THEN** the helper validates viewer role-filter output, browser role-filter
  output, token-env viewer role-filter output, and token-env browser
  role-filter output
- **AND** it does not start a browser, relay, host, viewer, capture, or input
  process

#### Scenario: Browser token role-filter drift fails closed

- **WHEN** the token-env browser role-filter output omits token guidance, uses
  a wrong token environment name, includes a raw token literal, includes
  `--token`, or adds relay, host, viewer, or preflight runtime blocks
- **THEN** the ready helper fails closed
- **AND** diagnostics do not echo generated command strings, local URLs, relay
  URLs, token values, token environment values, pairing codes, credentials,
  local paths, frame bytes, input contents, stdout, stderr, child output,
  diagnostics, or full secrets

### Requirement: MVP ready validates token-env preflight role-filter output

The default MVP ready helper SHALL validate preflight role-filter text output
generated with `--token-env WINBRIDGE_RELAY_SHARED_TOKEN`. The readiness check
MUST run the non-executing command kit as
`mvp:commands -- --only preflight --token-env WINBRIDGE_RELAY_SHARED_TOKEN`,
require preflight-only role-filter markers, require bounded token-mode guidance
for `$env:WINBRIDGE_RELAY_SHARED_TOKEN`, and reject output that omits token
guidance, uses a wrong token environment name, includes raw token literals,
adds `--token` runtime arguments, or combines preflight output with relay,
host, viewer, browser, capture, input, service, startup, privilege, unattended,
or hidden-session command blocks. Failure output MUST remain bounded and MUST
NOT echo generated command strings, relay URLs, local URLs, token values, token
environment values, pairing codes, credentials, local paths, frame bytes, input
contents, stdout, stderr, child output, diagnostics, or full secrets.

#### Scenario: Default ready validates token-env preflight role-filter

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the helper runs a non-executing
  `mvp:commands -- --only preflight --token-env WINBRIDGE_RELAY_SHARED_TOKEN`
  validation step
- **AND** it reports only bounded fixed status metadata

#### Scenario: Preflight token role-filter drift fails closed

- **WHEN** the token-env preflight role-filter output omits token guidance, uses
  a wrong token environment name, includes a raw token literal, includes
  `--token`, or adds relay, host, viewer, browser, capture, input, service,
  startup, privilege, unattended, or hidden-session command blocks
- **THEN** the ready helper fails closed
- **AND** diagnostics do not echo generated command strings, relay URLs, local
  URLs, token values, token environment values, pairing codes, credentials,
  local paths, frame bytes, input contents, stdout, stderr, child output,
  diagnostics, or full secrets

### Requirement: MVP smoke supports explicit Windows capture mode

The MVP smoke helper SHALL support an explicit `--windows-capture` option that
uses the existing consent-bound host Windows capture source for the smoke frame
path. When enabled, the smoke plan MUST pass
`--dev-screen-frame-source windows-capture` to the host, MUST omit static frame
payload arguments, and MUST keep the existing explicit host approval, visible
session state, finite capture count, viewer surface, signal, guard, protocol
input, audit, revocation, and viewer disconnect checks. The helper MUST NOT
apply OS input, start browser automation, bind a public relay, install services,
configure startup persistence, request privilege elevation, enable unattended
access, bypass Windows prompts, or hide capture/session activity. Success and
failure output MUST remain bounded and MUST NOT echo frame bytes, screen
content, local paths, relay URLs, local URLs, token values, token environment
values, pairing codes, command strings, stdout, stderr, child output,
PowerShell diagnostics, credentials, input contents, clipboard contents, or
full secrets.

#### Scenario: Windows capture smoke is explicit and finite

- **WHEN** a developer runs `npm run mvp:smoke -- --windows-capture` on Windows
- **THEN** the smoke helper starts the existing local relay, host, and viewer
  smoke workflow with the host frame source set to `windows-capture`
- **AND** it verifies the existing bounded smoke checks without exposing frame
  data or command output

#### Scenario: Windows capture smoke fails closed before startup off Windows

- **WHEN** a developer runs `npm run mvp:smoke -- --windows-capture` on a
  non-Windows platform
- **THEN** the smoke helper fails before starting relay, host, viewer, browser,
  capture, input, services, startup persistence, or unattended behavior
- **AND** diagnostics report only bounded fixed reason metadata

#### Scenario: Windows capture smoke keeps OS input disabled

- **WHEN** the smoke helper builds a plan for `--windows-capture`
- **THEN** the host command omits `--host-apply-input true`
- **AND** the plan does not add any native OS input application step

### Requirement: MVP command kit renders host consent timeout

The MVP command kit SHALL support a bounded
`--host-consent-timeout-ms <milliseconds>` option for generated host commands
that use interactive host consent. When omitted, the command kit MUST render
the existing default timeout of `60000` ms explicitly. The timeout value MUST
be an integer from `1` through `2147483647`, MUST be rejected when malformed,
duplicate, blank, fractional, negative, zero, oversized, or unsafe, and MUST be
rejected before rendering relay, host, viewer, browser, preflight, JSON, or
role-filter commands. The helper MUST remain non-executing and MUST NOT start
relay, host, viewer, browser, capture, input, services, startup persistence,
unattended access, privilege elevation, Windows prompt bypass, hidden sessions,
or hidden capture. Diagnostics MUST remain bounded and MUST NOT echo raw unsafe
timeout input, generated command strings, relay URLs, local URLs, token values,
token environment values, pairing codes, local paths, stdout, stderr, child
output, frame bytes, input contents, clipboard contents, credentials, or full
secrets.

#### Scenario: Default host consent timeout is explicit

- **WHEN** a developer renders the default MVP session command plan
- **THEN** every generated host command that includes
  `--host-consent-prompt 'true'` also includes
  `--host-consent-timeout-ms '60000'`
- **AND** the command kit does not execute any generated command

#### Scenario: Custom host consent timeout is rendered

- **WHEN** a developer renders the MVP session command plan with
  `--host-consent-timeout-ms 30000`
- **THEN** generated host commands include
  `--host-consent-timeout-ms '30000'`
- **AND** the timeout does not grant permissions or bypass host consent

#### Scenario: Unsafe host consent timeout fails closed

- **WHEN** a developer supplies a blank, duplicate, fractional, negative, zero,
  oversized, non-numeric, or unsafe `--host-consent-timeout-ms` value
- **THEN** the command kit rejects the input before rendering commands
- **AND** diagnostics report only bounded usage metadata without echoing the
  raw unsafe value

### Requirement: MVP ready validates host consent timeout rendering

The root MVP ready helper SHALL validate that the reviewed non-executing
command plans render the host consent timeout argument for host commands that
use interactive consent. It MUST fail closed if localhost, LAN, token-env,
role-filter, or ephemeral browser command-plan validation observes a missing,
malformed, duplicated, or unexpected host consent timeout argument. Failure
output MUST remain bounded and MUST NOT echo generated command strings, relay
URLs, local URLs, token values, token environment values, pairing codes, local
paths, stdout, stderr, child output, frame bytes, input contents, clipboard
contents, credentials, diagnostics, or full secrets.

#### Scenario: Default readiness validates host timeout

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the helper validates that generated host command-plan output
  includes the reviewed `--host-consent-timeout-ms '60000'` argument
- **AND** readiness reports only bounded fixed status metadata

#### Scenario: Host timeout drift fails readiness

- **WHEN** command-plan output omits, duplicates, malforms, or changes the
  reviewed host consent timeout argument unexpectedly
- **THEN** the ready helper fails closed with bounded failure metadata
- **AND** diagnostics do not echo generated command text or unsafe values

### Requirement: MVP command kit includes post-run audit summary command

The MVP command kit SHALL include a bounded post-run audit summary command in
full session text output, preflight-only text output, full session JSON output,
and preflight-only JSON output. The command MUST invoke
`npm run mvp:audit-summary` with explicit host and viewer audit paths matching
the command kit's validated host/viewer audit log options and the explicit
`--require-mvp-evidence` flag, MUST be labeled as a post-run evidence step in
text output, and MUST remain non-executing during command generation. The
command kit MUST NOT read audit files, inspect runtime artifacts, start relay,
host, viewer, browser, capture, input, services, startup persistence,
unattended access, network listeners, privilege elevation, remote log
retrieval, log upload, hidden sessions, or Windows prompt bypass while
rendering this command.

#### Scenario: Full command plan includes post-run audit summary

- **WHEN** a developer runs `npm run mvp:commands`
- **THEN** the text output includes a post-run evidence section with the fixed
  `npm run mvp:audit-summary -- --host ... --viewer ... --require-mvp-evidence`
  command
- **AND** the section states that the command is read-only and runs after local
  host/viewer audit logs exist
- **AND** command generation does not read the audit files or start runtime
  processes

#### Scenario: JSON command plan includes audit summary metadata

- **WHEN** a developer runs `npm run mvp:commands -- --json`
- **THEN** the JSON `commands` array includes a bounded
  `preflight.audit-summary` command entry
- **AND** the command entry contains only the reviewed audit summary command
  text and no raw audit records, tokens, pairing codes, stdout, stderr, frame
  bytes, screen contents, input contents, credentials, or secrets

### Requirement: MVP ready validates post-run audit summary command drift

The MVP ready helper SHALL treat the preflight JSON command-plan output as
valid only when it includes the fixed `preflight.audit-summary` command entry
that invokes `npm run mvp:audit-summary` with explicit default host and viewer
audit log paths plus the explicit `--require-mvp-evidence` flag. Missing,
duplicate, malformed, non-strict, token-bearing, or unexpected audit summary
command metadata MUST make the command-plan readiness check fail closed with
bounded status only. The ready helper MUST NOT execute the audit summary
command, read audit files, retrieve logs remotely, upload logs, start runtime
processes, or expose raw command-plan values in failure output.

#### Scenario: Ready accepts reviewed audit summary command metadata

- **WHEN** `npm run mvp:ready` validates the bounded preflight command-plan JSON
- **THEN** it accepts a single `preflight.audit-summary` command whose command
  text matches the reviewed post-run audit summary invocation
- **AND** readiness remains non-executing

#### Scenario: Ready fails closed when audit summary command drifts

- **WHEN** the preflight command-plan JSON omits `preflight.audit-summary` or
  changes it to a non-strict, malformed, token-bearing, or unexpected command
- **THEN** `mvp:ready` fails the command-plan readiness check
- **AND** failure output uses bounded status metadata without echoing raw
  command text, paths, tokens, pairing codes, stdout, stderr, raw audit
  contents, frame bytes, screen contents, input contents, credentials, or
  secrets

### Requirement: MVP command kit includes host local control surface

The MVP command kit SHALL render generated host commands with an explicit
`--host-control-surface-port` option for the existing host-only loopback local
control surface. The default generated value MUST be `0`, causing the runtime
host process to bind only to `127.0.0.1` with an OS-assigned ephemeral port and
log the bounded local URL for the host operator. Custom host surface ports MUST
be accepted only when they are `0` or an integer from `1024` through `65535`.
Malformed, duplicate, blank, fractional, negative, privileged, oversized, or
unsafe host surface port inputs MUST be rejected before rendering relay, host,
viewer, browser, token, JSON, role-filter, or preflight commands. The helper
MUST remain non-executing and MUST NOT start listeners, launch host browsers,
approve sessions, grant permissions, capture the screen, apply input, install
services, configure startup persistence, elevate privileges, run unattended,
collect credentials, keylog, evade AV/EDR, bypass Windows prompts, or hide the
host active-session indicator.

#### Scenario: Default host command uses ephemeral host surface

- **WHEN** a developer renders the default MVP session command plan
- **THEN** the generated host command includes
  `--host-control-surface-port '0'`
- **AND** the text plan instructs the host operator to open the host local
  control surface URL printed by the host command log
- **AND** the helper does not fabricate `http://127.0.0.1:0/` or start a host
  browser

#### Scenario: Custom host surface port is rendered

- **WHEN** a developer renders the MVP session command plan with
  `--host-control-surface-port 35986`
- **THEN** the generated host command includes
  `--host-control-surface-port '35986'`
- **AND** the helper still prints commands only and does not start the host
  surface, host browser, relay, viewer, capture, or input

#### Scenario: Unsafe host surface port fails closed

- **WHEN** a developer supplies a blank, duplicate, fractional, negative,
  privileged, oversized, non-numeric, or unsafe
  `--host-control-surface-port` value
- **THEN** the command kit rejects the input before rendering commands
- **AND** diagnostics remain bounded and do not echo raw unsafe input,
  generated command strings, relay URLs, local URLs, token values, pairing
  codes, local paths, stdout, stderr, child output, frame bytes, input
  contents, credentials, or full secrets

### Requirement: MVP ready validates host local control surface rendering

The root MVP ready helper SHALL validate that reviewed non-executing command
plans render the host local control surface option for host commands. It MUST
fail closed if localhost, LAN, token-env, role-filter, or ephemeral
command-plan validation observes a missing, malformed, duplicated, or
unexpected host local control surface argument. Failure output MUST remain
bounded and MUST NOT echo generated command strings, relay URLs, local URLs,
token values, token environment values, pairing codes, local paths, stdout,
stderr, child output, frame bytes, input contents, clipboard contents,
credentials, diagnostics, or full secrets.

#### Scenario: Default readiness validates host local surface

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the helper validates that generated host command-plan output
  includes the reviewed `--host-control-surface-port '0'` argument
- **AND** readiness reports only bounded fixed status metadata

#### Scenario: Host surface drift fails readiness

- **WHEN** command-plan output omits, duplicates, malforms, or changes the
  reviewed host local surface argument unexpectedly
- **THEN** `mvp:ready` fails the command-plan readiness check
- **AND** diagnostics do not echo generated command text, local URLs, tokens,
  pairing codes, stdout, stderr, child output, frame bytes, input contents,
  clipboard contents, credentials, diagnostics, or full secrets

### Requirement: MVP smoke verifies host local surface readiness

The root MVP smoke check SHALL start the local smoke host with the existing
host-only local control surface enabled on ephemeral loopback port `0` and
verify a fixed `host-surface` subcheck before reporting success. The subcheck
MUST extract a single bounded `http://127.0.0.1:<port>/` host surface URL from
host output, fetch the host surface HTML and sanitized `/status` metadata, and
verify that status reports an active visible host session with a positive
permission count. The subcheck MUST reject missing, malformed, duplicate,
credential-bearing, query-bearing, fragment-bearing, path-bearing, non-loopback,
privileged-port, or non-HTTP host surface URLs. The smoke helper MUST NOT print
the host surface URL, mutation token, raw child output, generated command
strings, authorization ids, raw permission arrays, relay URLs, local paths,
tokens, pairing codes, credentials, screen contents, input contents,
clipboard contents, diagnostics dumps, or full secrets in success or failure
diagnostics.

#### Scenario: Host surface smoke subcheck passes

- **WHEN** the smoke host reaches active visible authorization and logs a
  bounded host local control surface URL
- **THEN** the smoke check fetches the host surface and sanitized status
- **AND** the smoke result includes the fixed `host-surface` subcheck as
  passed
- **AND** output remains bounded and does not expose the URL, mutation token,
  authorization id, permission list, child output, screen contents, input
  contents, credentials, or secrets

#### Scenario: Host surface URL drift fails closed

- **WHEN** host output omits the host surface URL, reports multiple different
  host surface URLs, or reports an unsafe host surface URL
- **THEN** the smoke check exits non-zero with the bounded
  `host-surface-not-ready` reason
- **AND** diagnostics include only fixed smoke subcheck metadata

### Requirement: MVP smoke verifies host local surface mutation guards

The root MVP smoke check SHALL verify fixed host local surface mutation guard
denials before reporting the `host-surface` subcheck as passed. The guard
verification MUST send only fixed negative probes for mismatched `Host`, missing
mutation token, foreign `Origin`, and unsafe content type. Each probe MUST be
rejected before host lifecycle controls are invoked or host authorization state
is read for mutation handling. The smoke check MUST NOT use the host surface to
approve sessions, grant permissions, pause, resume, revoke, terminate,
disconnect, capture the screen, apply input, reconnect peers, install services,
configure startup persistence, elevate privileges, run unattended, collect
credentials, keylog, evade AV/EDR, bypass Windows prompts, or hide the active
host session indicator.

#### Scenario: Host surface guard subcheck passes

- **WHEN** the smoke workflow has verified the host surface HTML and status
- **THEN** it sends fixed negative mutation probes to the host surface
- **AND** each probe is rejected with bounded metadata
- **AND** the smoke helper reports only the fixed `host-surface` subcheck
  metadata

#### Scenario: Host surface guard failure fails closed

- **WHEN** any fixed host surface guard probe is accepted, times out, or
  returns an unexpected unsafe result
- **THEN** the smoke helper exits non-zero with the bounded
  `host-surface-not-ready` reason
- **AND** it stops any started child processes before returning control
- **AND** diagnostics do not expose mutation tokens, URLs, response bodies,
  command contents, authorization ids, child output, pairing codes,
  credentials, screen contents, input contents, or full secrets

### Requirement: MVP ready accepts host surface smoke metadata

The root MVP ready helper SHALL accept bounded smoke JSON containing the fixed
`host-surface` subcheck for default, LAN-style, token, and LAN-token smoke
checks when those checks are explicitly included. It MUST fail closed when
smoke JSON omits `host-surface`, duplicates it, changes its shape, marks it
passed while another required subcheck is missing, or includes unexpected
subcheck names. Failure output MUST remain bounded and MUST NOT echo smoke
command output, child output, generated commands, host surface URLs, mutation
tokens, relay URLs, token values, token environment values, pairing codes,
credentials, local paths, frame bytes, input contents, diagnostics, or full
secrets.

#### Scenario: Ready preserves host surface subcheck

- **WHEN** `npm run mvp:ready -- --include-smoke --json` consumes bounded smoke
  JSON containing a passed `host-surface` subcheck
- **THEN** the ready helper accepts and reports that fixed subcheck for all
  included smoke variants
- **AND** ready output remains bounded and secret-safe

#### Scenario: Ready rejects missing host surface subcheck

- **WHEN** an included smoke result omits, duplicates, malforms, or renames the
  fixed `host-surface` subcheck
- **THEN** the ready helper treats the smoke output as malformed
- **AND** readiness diagnostics use only bounded fixed status metadata

### Requirement: MVP smoke supports explicit Windows input mode

The MVP smoke helper SHALL support an explicit `--windows-input` option that
uses the existing consent-bound host Windows input adapter for native input
application. When enabled, the smoke plan MUST pass `--host-apply-input true`
to the host, MUST preserve the existing host approval, visible session state,
host control surface, viewer control surface, signal, guard, frame, protocol
input, audit, revocation, and viewer disconnect checks, and MUST verify a fixed
`windows-input` subcheck from accepted host audit evidence for
`agent-shell.remote-interaction.input-event.applied`. The helper MUST NOT enable
OS input by default, start browser automation, bind a public relay, install
services, configure startup persistence, request privilege elevation, enable
unattended access, bypass Windows prompts, read credentials, read clipboard
contents, keylog, evade AV/EDR, or hide capture/session/input activity. Success
and failure output MUST remain bounded and MUST NOT echo input contents,
PowerShell diagnostics, generated command strings, child output, local paths,
relay URLs, local URLs, token values, token environment values, pairing codes,
authorization ids, credentials, clipboard contents, or full secrets.

#### Scenario: Windows input smoke is explicit and finite

- **WHEN** a developer runs `npm run mvp:smoke -- --windows-input` on Windows
- **THEN** the smoke helper starts the existing local relay, host, and viewer
  smoke workflow with host native input application enabled
- **AND** it verifies the fixed `windows-input` subcheck from bounded accepted
  host audit evidence
- **AND** diagnostics do not expose input payloads, command contents, child
  output, local paths, URLs, tokens, pairing codes, credentials, clipboard
  contents, PowerShell diagnostics, or secrets

#### Scenario: Windows input smoke rejects denied or failed evidence

- **WHEN** the host audit log contains only denied or failed
  `agent-shell.remote-interaction.input-event.applied` evidence
- **THEN** the smoke helper fails closed with bounded `windows-input-not-ready`
  diagnostics
- **AND** diagnostics do not expose input payloads, command contents, child
  output, local paths, URLs, tokens, pairing codes, credentials, clipboard
  contents, PowerShell diagnostics, or secrets

#### Scenario: Windows input smoke fails closed before startup off Windows

- **WHEN** a developer runs `npm run mvp:smoke -- --windows-input` on a
  non-Windows platform
- **THEN** the smoke helper fails before starting relay, host, viewer, browser,
  capture, input, services, startup persistence, privilege elevation, or
  unattended behavior
- **AND** diagnostics report only bounded fixed reason metadata

#### Scenario: Default smoke keeps OS input disabled

- **WHEN** the smoke helper builds a default plan or a `--windows-capture` plan
- **THEN** the host command omits `--host-apply-input true`
- **AND** the plan does not add the fixed `windows-input` subcheck

### Requirement: MVP ready supports explicit Windows input smoke gate

The MVP ready helper SHALL support an explicit
`--include-windows-input-smoke` option that runs the bounded smoke command
`mvp:smoke -- --json --windows-input` and accepts JSON only when it contains
the fixed `windows-input` subcheck in addition to every default smoke subcheck.
The helper MUST NOT include the Windows input smoke in default readiness,
role-scoped readiness, or `--include-all-smoke`. The helper MUST fail closed
when included Windows input smoke output omits, duplicates, malforms, renames,
or unexpectedly reports the `windows-input` subcheck. Failure output MUST
remain bounded and MUST NOT echo smoke command output, child output, generated
commands, input contents, PowerShell diagnostics, relay URLs, local URLs, token
values, token environment values, pairing codes, credentials, local paths,
frame bytes, clipboard contents, or full secrets.

#### Scenario: Ready runs explicit Windows input smoke

- **WHEN** a developer runs
  `npm run mvp:ready -- --include-windows-input-smoke --json`
- **THEN** the ready helper runs `mvp:smoke -- --json --windows-input`
- **AND** it accepts and reports the fixed `windows-input` subcheck when every
  required smoke subcheck passes

#### Scenario: Ready rejects malformed Windows input smoke metadata

- **WHEN** the included Windows input smoke result omits, duplicates, malforms,
  or renames the fixed `windows-input` subcheck
- **THEN** the ready helper treats the smoke output as malformed
- **AND** readiness diagnostics use only bounded fixed status metadata

#### Scenario: Ready all-smoke keeps OS input disabled

- **WHEN** a developer runs `npm run mvp:ready -- --include-all-smoke`
- **THEN** the ready helper does not run the Windows input smoke
- **AND** no `mvp:smoke -- --windows-input` command is planned unless
  `--include-windows-input-smoke` is supplied explicitly

### Requirement: MVP ready supports explicit Windows control smoke gate

The MVP ready helper SHALL support an explicit
`--include-windows-control-smoke` option that runs the bounded smoke command
`mvp:smoke -- --json --windows-capture --windows-input`. The helper MUST accept
that step only when smoke JSON contains every default smoke subcheck plus the
fixed `windows-input` subcheck, because the command itself is the reviewed
evidence that the frame subcheck used the Windows capture source. The helper
MUST NOT include this combined native smoke in default readiness, role-scoped
readiness, or `--include-all-smoke`. Failure output MUST remain bounded and
MUST NOT echo smoke command output, child output, generated commands, frame
bytes, screen contents, input contents, PowerShell diagnostics, relay URLs,
local URLs, token values, token environment values, pairing codes,
credentials, local paths, clipboard contents, or full secrets.

#### Scenario: Ready runs explicit Windows control smoke

- **WHEN** a developer runs
  `npm run mvp:ready -- --include-windows-control-smoke --json`
- **THEN** the ready helper runs
  `mvp:smoke -- --json --windows-capture --windows-input`
- **AND** it accepts and reports the fixed `windows-input` subcheck when every
  required smoke subcheck passes

#### Scenario: Ready rejects malformed Windows control smoke metadata

- **WHEN** the included Windows control smoke result omits, duplicates,
  malforms, or renames the fixed `windows-input` subcheck
- **THEN** the ready helper treats the smoke output as malformed
- **AND** readiness diagnostics use only bounded fixed status metadata

#### Scenario: Ready all-smoke keeps combined native control disabled

- **WHEN** a developer runs `npm run mvp:ready -- --include-all-smoke`
- **THEN** the ready helper does not run the combined Windows control smoke
- **AND** no `mvp:smoke -- --windows-capture --windows-input` command is
  planned unless `--include-windows-control-smoke` is supplied explicitly

### Requirement: MVP smoke composes explicit Windows capture and input modes

The MVP smoke helper SHALL allow the existing explicit `--windows-capture` and
`--windows-input` options to be supplied together so the same local smoke
session uses the consent-bound host Windows capture source and the
consent-bound host Windows input adapter. When both options are supplied, the
host command MUST include `--dev-screen-frame-source windows-capture` and
`--host-apply-input true`, MUST keep explicit host approval, visible session
state, audit logging, finite capture count, revocation, and viewer disconnect,
and MUST preserve the fixed `windows-input` smoke JSON subcheck. Off Windows,
the helper MUST fail closed before starting relay, host, viewer, browser,
capture, input, services, startup persistence, privilege elevation, or
unattended behavior. Diagnostics MUST remain bounded and MUST NOT echo frame
bytes, screen contents, input contents, PowerShell diagnostics, generated
command strings, child output, local paths, relay URLs, local URLs, token
values, token environment values, pairing codes, credentials, clipboard
contents, or full secrets.

#### Scenario: Combined Windows control smoke plan is explicit

- **WHEN** the smoke helper builds a plan with both `--windows-capture` and
  `--windows-input`
- **THEN** the host command uses the Windows capture frame source and enables
  host native input application
- **AND** default, LAN, token, LAN-token, capture-only, and input-only smoke
  plans remain unchanged

#### Scenario: Combined Windows control smoke fails closed off Windows

- **WHEN** a developer runs
  `npm run mvp:smoke -- --windows-capture --windows-input` on a non-Windows
  platform
- **THEN** the smoke helper fails before starting child processes or native
  adapters
- **AND** diagnostics report only bounded fixed reason metadata

### Requirement: Default ready validates tokenized LAN role-filter output

The default aggregate MVP ready helper SHALL validate tokenized LAN
role-filtered command output for relay, host, and viewer roles in addition to
the full LAN command-plan validation and existing localhost/token role-filter
validation. It SHALL run the non-executing command kit as
`mvp:commands -- --only relay --relay-host 192.168.1.10 --token-env WINBRIDGE_RELAY_SHARED_TOKEN`,
`mvp:commands -- --only host --relay-host 192.168.1.10 --token-env WINBRIDGE_RELAY_SHARED_TOKEN`,
and
`mvp:commands -- --only viewer --relay-host 192.168.1.10 --token-env WINBRIDGE_RELAY_SHARED_TOKEN`.
The relay check MUST require relay-only output plus the reviewed
`WINBRIDGE_RELAY_BIND_HOST = '0.0.0.0'` marker. The host and viewer checks MUST
require role-only agent output, the representative `ws://192.168.1.10:8787/`
relay URL shape, and the reviewed `$env:WINBRIDGE_RELAY_SHARED_TOKEN` token
reference. The helper MUST fail closed on missing, duplicated, malformed, or
cross-role output. Failure output MUST remain bounded and MUST NOT echo
generated command strings, relay URLs, local URLs, ports, token references,
token values, token environment values, pairing codes, local paths, stdout,
stderr, child output, credentials, frame bytes, screen contents, input
contents, clipboard contents, or full secrets. The checks MUST remain
non-executing and MUST NOT start relay, host, viewer, browser, capture, input,
sockets, HTTP listeners, services, startup persistence, unattended access,
privilege elevation, LAN discovery, firewall changes, AV/EDR evasion, Windows
prompt bypass, or hidden-session behavior.

#### Scenario: Default ready covers tokenized LAN role filters

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the helper validates tokenized LAN relay role-filter output
- **AND** it validates tokenized LAN host role-filter output
- **AND** it validates tokenized LAN viewer role-filter output
- **AND** output reports only bounded fixed status for those checks

#### Scenario: Default LAN role-filter drift fails closed

- **WHEN** a default tokenized LAN role-filter output omits the expected LAN
  relay shape, omits the token env reference, includes raw token values,
  includes another role's runtime command block, or contains malformed
  role-filter metadata
- **THEN** `mvp:ready` treats the matching LAN role-filter check as failed
- **AND** diagnostics do not echo the unsafe command string, token reference,
  token value, relay URL, pairing code, path, stdout, stderr, child output,
  credential, screen content, input content, or full secret

#### Scenario: Role-scoped LAN checks remain unchanged

- **WHEN** a developer runs `npm run mvp:ready -- --role relay`, `--role host`,
  or `--role viewer`
- **THEN** role-scoped readiness keeps its existing local role's LAN
  role-filter coverage
- **AND** it does not add unrelated roles' LAN role-filter checks

### Requirement: MVP ready validates native control command-plan markers

The default aggregate MVP ready helper SHALL validate that every full session
JSON command-plan it accepts preserves the reviewed native Windows control
command path. For default localhost, representative LAN, token-env, and
ephemeral browser command-plan checks, the helper MUST require the host command
to include exactly one `--host-apply-input true` marker and exactly one
`--dev-screen-frame-source windows-capture` marker, and MUST require the viewer
command to include the reviewed `screen:view,input:pointer,input:keyboard`
request plus the reviewed latest-frame output path. The validation MUST remain
non-executing and MUST NOT start relay, host, viewer, browser, capture, input,
sockets, HTTP listeners, services, startup persistence, unattended access,
privilege elevation, LAN discovery, firewall changes, AV/EDR evasion, Windows
prompt bypass, or hidden-session behavior. Failure output MUST remain bounded
and MUST NOT echo generated command strings, relay URLs, local URLs, ports,
token references, token values, token environment values, pairing codes, local
paths, stdout, stderr, child output, credentials, frame bytes, screen contents,
input contents, clipboard contents, or full secrets.

#### Scenario: Default ready accepts reviewed native control path

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the helper accepts the non-executing command-plan checks only when
  the host command preserves the reviewed Windows capture and host input
  markers
- **AND** the viewer command preserves the reviewed screen/input request and
  latest-frame output markers
- **AND** output reports only bounded fixed status metadata for those checks

#### Scenario: Native control command-plan drift fails closed

- **WHEN** a full session command-plan omits, duplicates, or changes the
  reviewed host input marker, host Windows capture marker, viewer screen/input
  request marker, or viewer latest-frame output marker
- **THEN** `mvp:ready` treats the matching command-plan check as failed
- **AND** diagnostics do not echo the unsafe command string, relay URL, local
  URL, token reference, token value, pairing code, path, stdout, stderr, child
  output, credential, screen content, input content, or full secret

#### Scenario: Native control validation stays non-executing

- **WHEN** `mvp:ready` validates default, LAN, token, or ephemeral
  command-plan JSON
- **THEN** it only parses the command kit JSON output
- **AND** it does not execute the generated relay, host, viewer, browser,
  capture, or input commands

### Requirement: MVP ready validates native control role-filter markers

The default aggregate MVP ready helper SHALL validate that accepted
host/viewer role-filtered command output preserves the reviewed native Windows
control command path. Host role-filter output MUST include the reviewed
`--host-apply-input true` marker and `--dev-screen-frame-source windows-capture`
marker. Viewer role-filter output MUST include the reviewed
`screen:view,input:pointer,input:keyboard` request marker and the reviewed
latest-frame output path marker. The validation MUST apply to default,
token-env, and representative LAN host/viewer role-filter checks, MUST remain
non-executing, and MUST NOT start relay, host, viewer, browser, capture, input,
sockets, HTTP listeners, services, startup persistence, unattended access,
privilege elevation, LAN discovery, firewall changes, AV/EDR evasion, Windows
prompt bypass, or hidden-session behavior. Failure output MUST remain bounded
and MUST NOT echo generated command strings, relay URLs, local URLs, ports,
token references, token values, token environment values, pairing codes, local
paths, stdout, stderr, child output, credentials, frame bytes, screen contents,
input contents, clipboard contents, or full secrets.

#### Scenario: Default ready accepts reviewed role-filter native control path

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the host role-filter checks accept output only when it preserves the
  reviewed host input and Windows capture markers
- **AND** the viewer role-filter checks accept output only when it preserves
  the reviewed screen/input request and latest-frame output markers
- **AND** output reports only bounded fixed status metadata for those checks

#### Scenario: Role-filter native control drift fails closed

- **WHEN** a host or viewer role-filter output omits or changes the reviewed
  host input marker, host Windows capture marker, viewer screen/input request
  marker, or viewer latest-frame output marker
- **THEN** `mvp:ready` treats the matching role-filter check as failed
- **AND** diagnostics do not echo the unsafe command string, relay URL, local
  URL, token reference, token value, pairing code, path, stdout, stderr, child
  output, credential, screen content, input content, or full secret

#### Scenario: Role-filter validation stays non-executing

- **WHEN** `mvp:ready` validates default, LAN, or token-env host/viewer
  role-filter output
- **THEN** it only parses the command kit text output
- **AND** it does not execute the generated relay, host, viewer, browser,
  capture, or input commands

### Requirement: MVP trial helper prints a two-PC operator workflow

The project SHALL provide a root `npm run mvp:trial` helper that prints a
bounded, non-executing two-PC development MVP operator workflow. The helper
MUST include fixed relay, host, viewer, and post-run evidence sections that
reference the existing role-scoped `mvp:ready` gates, the existing
role-filtered `mvp:commands` outputs, and the strict
`mvp:audit-summary -- --require-mvp-evidence` post-run gate. The helper MUST
support text output by default and bounded JSON output with `--json`. It MUST
support `--role relay`, `--role host`, `--role viewer`, and `--role evidence`
filters without changing the default full workflow. Plan output MUST remain
bounded and MUST NOT echo raw relay URLs, pairing codes, token values, token
environment values, generated command strings, local URLs, local paths,
stdout, stderr, audit records, frame bytes, screen contents, input contents,
clipboard contents, credentials, diagnostics dumps, or full secrets. The helper
MUST NOT start relay, host, viewer, browser, capture, input, sockets, HTTP
listeners, services, startup persistence, unattended access, privilege
elevation, remote discovery, firewall changes, AV/EDR evasion, Windows prompt
bypass, or hidden-session behavior.

#### Scenario: Default trial plan prints every role

- **WHEN** a developer runs `npm run mvp:trial`
- **THEN** the helper prints bounded relay, host, viewer, and evidence
  workflow sections
- **AND** the output references the existing readiness, command-plan, and
  strict audit-summary gates without executing them

#### Scenario: Trial plan JSON remains bounded

- **WHEN** a developer runs `npm run mvp:trial -- --json`
- **THEN** the helper emits machine-readable metadata containing only `ok`,
  fixed workflow role records, fixed safety reminders, and fixed command
  references
- **AND** the JSON omits generated command strings, relay URLs, pairing codes,
  tokens, token environment values, local URLs, local paths, audit records,
  frame bytes, screen contents, input contents, credentials, stdout, stderr,
  diagnostics, and full secrets

#### Scenario: Trial plan filters one role

- **WHEN** a developer runs `npm run mvp:trial -- --role host`
- **THEN** the helper prints only the bounded host workflow section
- **AND** it does not print relay, viewer, browser, or evidence runtime command
  blocks

#### Scenario: Trial plan rejects malformed options

- **WHEN** a developer supplies duplicate, unknown, blank, unsafe, or
  unsupported trial-plan options
- **THEN** the helper exits non-zero with bounded fixed diagnostics before
  printing workflow sections
- **AND** it does not echo unsafe option values or execute runtime commands

### Requirement: MVP trial helper accepts bounded relay host planning

The root `npm run mvp:trial` helper SHALL support an optional plan-mode
`--relay-host <host>` argument that validates the relay host shortcut using the
same bounded LAN-host rules as the MVP command kit and substitutes that value
only into the fixed `mvp:commands -- --only ... --relay-host <host>
--token-env WINBRIDGE_RELAY_SHARED_TOKEN` command-reference strings. When
omitted, the helper MUST preserve the existing `<relay-pc-lan-ip>` placeholder
output. The argument MUST be rejected when duplicated, blank, malformed,
loopback, unspecified, secret-bearing, or supplied in evidence mode. The helper
MUST remain non-executing and MUST NOT start relay, host, viewer, browser,
capture, input, sockets, HTTP listeners, services, startup persistence,
unattended access, privilege elevation, LAN discovery, firewall changes,
AV/EDR evasion, Windows prompt bypass, or hidden-session behavior. Trial output
MUST NOT echo generated runtime commands, relay URLs, pairing codes, token
values, local control URLs, audit records, frame bytes, screen contents, input
contents, clipboard contents, credentials, diagnostics dumps, stdout, stderr,
child output, or full secrets.

#### Scenario: Trial plan references a concrete relay host

- **WHEN** a developer runs
  `npm run mvp:trial -- --relay-host 192.168.1.10`
- **THEN** the helper prints bounded relay, host, and viewer
  command-reference steps that include `--relay-host 192.168.1.10`
- **AND** it still does not print generated relay, host, viewer, or browser
  runtime commands
- **AND** it does not print a relay URL, pairing code, token value, local URL,
  audit path contents, frame bytes, screen contents, input contents, or secret

#### Scenario: Role-filtered trial plan references the relay host

- **WHEN** a developer runs
  `npm run mvp:trial -- --role viewer --relay-host support-relay.lan --json`
- **THEN** the helper emits bounded JSON with only the viewer workflow section
  and fixed command-reference steps using `--relay-host support-relay.lan`
- **AND** the JSON remains non-executing bounded metadata only

#### Scenario: Unsafe trial relay host fails closed

- **WHEN** a developer supplies a duplicate, blank, malformed, loopback,
  unspecified, secret-bearing, or evidence-mode `--relay-host` value
- **THEN** `mvp:trial` exits non-zero with bounded usage metadata
- **AND** diagnostics do not echo the unsafe relay host, generated commands,
  relay URLs, local URLs, pairing codes, token values, stdout, stderr, child
  output, credentials, or secrets

### Requirement: MVP LAN probe verifies relay pairing readiness

The project SHALL provide a root `npm run mvp:lan-probe` helper that performs
a bounded live relay/session reachability probe for a two-PC MVP trial before
authorization, capture, input, browser, or audit evidence workflows are
started. The helper MUST require an explicit `--role host|viewer`, relay URL,
session id, pairing code, peer id, device id, and bounded timeout. It MUST
connect one operator-run peer to the relay, send only a schema-valid
`join-session` envelope for that role, wait until the relay reports paired room
readiness for the local peer, close its own socket, and exit. It MUST support a
shared relay token only through `--token-env <ENV_NAME>` and MUST read only that
environment variable value without printing it. The helper MUST support bounded
text output and bounded JSON output with fixed check names and reason codes.

The helper MUST fail closed on malformed or duplicate arguments, unsafe relay
URLs, missing token environment values, token denial, wrong pairing, relay
errors, timeout, socket close before readiness, or unexpected protocol
messages. Diagnostics MUST NOT echo raw relay URLs, token values, token
environment values, pairing codes, protocol payloads, WebSocket close reasons,
exception messages, stdout, stderr, child output, credentials, local file
paths, frame bytes, screen contents, input contents, clipboard contents,
diagnostics dumps, or full secrets.

The helper MUST NOT send `hello`, host consent, authorization, signal,
screen-frame, input-event, session-control, permission revocation, audit-event,
clipboard, file-transfer, diagnostics, service, startup, persistence,
privilege, browser, or local-control messages. It MUST NOT approve sessions,
grant permissions, activate host visibility, start capture, apply input, open
HTTP listeners, launch browsers, install services, configure startup
persistence, run unattended, elevate privileges, perform firewall changes,
evade AV/EDR, bypass Windows prompts, or hide sessions.

#### Scenario: Opposite roles reach paired readiness

- **WHEN** a host probe and a viewer probe connect to the same relay with the
  same session id and pairing code before their bounded timeouts expire
- **THEN** each helper observes relay readiness for its local peer with a
  paired room
- **AND** each exits successfully after closing its own socket
- **AND** output reports only bounded probe status metadata

#### Scenario: Probe fails closed on missing peer

- **WHEN** a single host or viewer probe connects but the opposite role does
  not join before the bounded timeout
- **THEN** the helper exits non-zero with a fixed timeout reason
- **AND** output does not include relay URLs, pairing codes, tokens, close
  reasons, protocol payloads, stdout, stderr, or secrets

#### Scenario: Probe fails closed on malformed or unauthorized setup

- **WHEN** a developer supplies malformed arguments, an unsafe relay URL, a
  missing token environment variable, a rejected token, or a wrong pairing code
- **THEN** the helper exits non-zero before reporting paired readiness
- **AND** diagnostics remain bounded and secret-safe

#### Scenario: Probe remains non-authorizing

- **WHEN** the LAN probe succeeds
- **THEN** it has sent only a join message and consumed relay readiness
- **AND** it has not requested consent, granted authorization, activated host
  visibility, sent frames, sent input, written audit records, started control
  surfaces, opened a browser, or changed Windows state

### Requirement: MVP ready validates trial helper plan output

The root MVP ready helper SHALL validate the two-PC trial helper plan output as
part of default aggregate readiness and role-scoped readiness. Default
readiness MUST run the non-executing `mvp:trial -- --json` plan and accept it
only when the bounded JSON reports `ok=true`, `mode=plan`,
`nonExecuting=true`, fixed relay, host, viewer, and evidence role records, and
the reviewed safety reminders. Relay, host, and viewer role-scoped readiness
MUST run the matching non-executing
`mvp:trial -- --role <role> --json` plan and accept it only when exactly that
role record is present. Readiness MUST fail closed on missing, duplicated,
malformed, renamed, extra, evidence-mode, or cross-role trial metadata. Failure
output MUST remain bounded and MUST NOT echo generated commands, relay URLs,
local URLs, token values, token environment values, pairing codes, local paths,
audit paths, audit records, frame bytes, screen contents, input contents,
stdout, stderr, child output, credentials, diagnostics, or full secrets. The
validation MUST remain non-executing and MUST NOT start relay, host, viewer,
browser, capture, input, sockets, HTTP listeners, services, startup
persistence, unattended access, privilege elevation, LAN discovery, firewall
changes, AV/EDR evasion, Windows prompt bypass, or hidden-session behavior.

#### Scenario: Default ready validates full trial plan

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the helper validates bounded `mvp:trial -- --json` output
- **AND** it accepts only the fixed relay, host, viewer, and evidence workflow
  records with reviewed safety reminders
- **AND** readiness output reports only bounded fixed status metadata

#### Scenario: Role ready validates matching trial plan

- **WHEN** a developer runs `npm run mvp:ready -- --role host`
- **THEN** the helper validates bounded
  `mvp:trial -- --role host --json` output
- **AND** it fails closed if relay, viewer, evidence, or malformed role
  metadata is present

#### Scenario: Trial readiness drift fails closed

- **WHEN** trial helper JSON omits required safety reminders, changes mode,
  reports evidence mode, includes duplicate roles, or omits the requested role
- **THEN** `mvp:ready` treats the matching trial-plan check as failed
- **AND** diagnostics do not echo command strings, URLs, paths, audit records,
  stdout, stderr, child output, credentials, frame bytes, input contents, or
  secrets

### Requirement: MVP doctor validates trial helper script alignment

`npm run mvp:doctor` SHALL require the root `mvp:trial` script to preserve the
reviewed `node scripts/mvp-trial.mjs` entrypoint. If the root script is
missing, renamed, reordered into an unsafe wrapper, or points to another
entrypoint, doctor MUST fail closed with bounded `script-misaligned` or
`missing-root-script` metadata. Diagnostics MUST NOT echo raw script bodies,
package JSON content, local paths, tokens, pairing codes, credentials, stdout,
stderr, child output, frame bytes, screen contents, input contents, or full
secrets. The alignment check MUST NOT execute the trial helper, relay, host,
viewer, browser, capture, input, services, startup persistence, unattended
access, privilege elevation, sockets, HTTP listeners, AV/EDR evasion, Windows
prompt bypass, or hidden-session behavior.

#### Scenario: Doctor accepts reviewed trial script

- **WHEN** the root package script maps `mvp:trial` to
  `node scripts/mvp-trial.mjs`
- **THEN** `npm run mvp:doctor` accepts the scripts check
- **AND** doctor output remains bounded metadata only

#### Scenario: Doctor rejects trial script drift

- **WHEN** the root `mvp:trial` script is missing or no longer points to the
  reviewed helper entrypoint
- **THEN** doctor exits non-zero with bounded script failure metadata
- **AND** diagnostics do not echo raw script bodies, package JSON content,
  paths, stdout, stderr, child output, credentials, or secrets
