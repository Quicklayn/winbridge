## MODIFIED Requirements

### Requirement: Agent shell viewer writes consent-bound screen frames to an explicit output file

The agent shell CLI SHALL expose an explicit viewer-only latest-frame file
output for development MVP checks. The output path MUST be configured through
the validated `--viewer-screen-frame-output` option, the viewer MUST request
`screen:view`, and the viewer MUST configure local audit persistence before the
runtime starts. The runtime MUST persist a metadata-only
`agent-shell.remote-interaction.screen-frame.output-requested` record only
after inbound `screen-frame` sender role, target peer, authorization id, active
visible unexpired authorization, and `screen:view` permission gates pass.
Failure to persist that pre-write record MUST block frame output.

Each latest-frame update MUST create the configured output directory
recursively before publishing complete frame bytes by writing to a
same-directory temporary file and then replacing the configured output path.
Only after the output sink succeeds may the runtime persist the matching
trusted `agent-shell.remote-interaction.screen-frame.output-written` record.
Sink failure MUST NOT produce accepted output-written evidence. The local
viewer surface MUST NOT be able to read a partially written frame as trusted
current state. Output writes, logs, local events, HTTP responses, and audit
records MUST NOT expose raw frame bytes, encoded frame data, screenshots,
screen contents, credentials, tokens, pairing codes, private reasons, or full
secrets.

#### Scenario: Viewer writes a complete latest frame

- **WHEN** a viewer with configured latest-frame output receives an authorized
  inbound `screen-frame` and metadata-only output-requested audit succeeds
- **THEN** it creates the configured output directory recursively before
  writing decoded frame bytes to a temporary file in that directory
- **AND** it replaces the configured latest-frame path only after the full
  frame write succeeds
- **AND** it then writes matching metadata-only output-written audit
- **AND** the configured path contains either the previous complete frame or
  the new complete frame, never a partially written frame
- **AND** diagnostics and audit remain metadata-only

#### Scenario: Output-requested audit fails

- **WHEN** the authorized viewer cannot persist metadata-only
  output-requested audit
- **THEN** it rejects before invoking the frame output sink or writing trusted
  output-written evidence
- **AND** diagnostics remain bounded and frame-content-free

#### Scenario: Latest-frame replacement fails

- **WHEN** the runtime cannot create the configured output directory, write the
  temporary frame file, or replace the configured latest-frame path
- **THEN** it fails closed before treating the new frame as published
- **AND** it MUST NOT write accepted output-written evidence, send protocol
  messages, grant permissions, reconnect peers, start capture, send input, hide
  the host session, bypass consent, or expose raw frame bytes, encoded frame
  data, screenshots, screen contents, credentials, tokens, pairing codes,
  private reasons, or full secrets

#### Scenario: Output-written audit fails after sink success

- **WHEN** the sink publishes a complete frame but persistence of matching
  output-written audit fails
- **THEN** the runtime reports bounded failure and MUST NOT emit a trusted
  received runtime event or claim strict output-written evidence
- **AND** diagnostics remain metadata-only and secret-safe

### Requirement: Agent shell applies inbound Windows input only after explicit host opt-in

The agent shell SHALL expose a host-only opt-in runtime configuration for
applying accepted inbound `input-event` messages through the Windows input
adapter. The runtime MUST keep native input application disabled by default. On
an opted-in host, native input MUST be invoked only after the inbound
`input-event` passes existing sender role, sender peer id, session id, target
peer id, authorization id, visible active unexpired authorization state, and
required `input:pointer` or `input:keyboard` permission checks.

Before invoking the Windows adapter, the runtime MUST persist a metadata-only
`agent-shell.remote-interaction.input-event.application-requested` audit record
bound to the current session, authorization, event id, and sequence. Failure to
persist that pre-adapter record MUST block native input. The runtime MUST
persist the trusted
`agent-shell.remote-interaction.input-event.applied` audit record only after
the Windows adapter succeeds. Adapter rejection or failure MUST NOT produce an
accepted `input-event.applied` record.

#### Scenario: Host applies authorized pointer input

- **WHEN** an opted-in host runtime with local audit configuration receives a
  pointer `input-event` from the observed viewer for the active visible
  unexpired authorization that grants `input:pointer`
- **THEN** the runtime writes metadata-only input-application-requested audit
  before invoking the Windows input adapter
- **AND** the adapter receives a grant snapshot bound to the current
  authorization, visibility, permissions, expiry, and connected viewer state
- **AND** after adapter success the runtime writes matching metadata-only
  input-applied audit
- **AND** local events, logs, audit records, thrown errors, and status output
  MUST NOT expose pointer coordinates, button values, raw input payloads,
  credentials, tokens, pairing codes, private reasons, command output, or full
  secrets

#### Scenario: Host applies authorized keyboard input

- **WHEN** an opted-in host runtime with local audit configuration receives a
  keyboard `input-event` from the observed viewer for the active visible
  unexpired authorization that grants `input:keyboard`
- **THEN** the runtime writes metadata-only input-application-requested audit
  before invoking the Windows input adapter
- **AND** after adapter success the runtime writes matching metadata-only
  input-applied audit
- **AND** local events, logs, audit records, thrown errors, and status output
  MUST NOT expose key values, code values, modifier values, raw input payloads,
  keylogging buffers, credentials, tokens, pairing codes, private reasons,
  command output, or full secrets

#### Scenario: Host input application is not opted in

- **WHEN** a host runtime receives an otherwise authorized `input-event` while
  native input application is disabled
- **THEN** the runtime keeps existing metadata-only inbound observation
  behavior and MUST NOT write input-application-requested or input-applied
  audit, invoke the Windows input adapter, inject OS input, reconnect peers,
  hide the session, or bypass consent

#### Scenario: Host input application lacks local audit

- **WHEN** a host runtime is configured to apply inbound input without a local
  audit sink
- **THEN** runtime creation or startup fails closed before opening a relay
  connection, receiving input, invoking the Windows input adapter, injecting
  OS input, reconnecting peers, hiding the session, or bypassing consent

#### Scenario: Input application audit fails

- **WHEN** an opted-in host is otherwise authorized to apply an inbound
  `input-event` but metadata-only application-requested audit persistence fails
- **THEN** the runtime rejects before invoking the Windows input adapter,
  injecting OS input, writing trusted applied metadata, reconnecting peers,
  hiding the session, or bypassing consent
- **AND** diagnostics MUST NOT expose pointer coordinates, button values, key
  values, modifier values, raw input payloads, keylogging buffers,
  credentials, tokens, pairing codes, private reasons, command output, or full
  secrets

#### Scenario: Authorization is lost before input application

- **WHEN** a host receives an `input-event` after authorization is paused,
  revoked, terminated, expired, invisible, disconnected, missing, mismatched,
  or missing the required input permission
- **THEN** the runtime rejects or ignores the event before
  input-application-requested audit, Windows input adapter invocation, trusted
  input-applied audit, trusted received event emission, injected OS input,
  reconnection, hidden session behavior, or consent bypass

#### Scenario: Windows input adapter fails

- **WHEN** an opted-in host passes an authorized inbound input event to the
  Windows input adapter and the adapter rejects or fails
- **THEN** the runtime reports only bounded generic failure metadata
- **AND** the runtime MUST NOT write accepted `input-event.applied` evidence
- **AND** it MUST NOT expose pointer coordinates, button values, key values,
  modifier values, raw input payloads, keylogging buffers, credentials, tokens,
  pairing codes, private reasons, command output, or full secrets

#### Scenario: Input applied audit fails after adapter success

- **WHEN** the Windows input adapter succeeds but persistence of the matching
  input-applied audit record fails
- **THEN** the runtime reports bounded generic failure and MUST NOT emit a
  trusted applied runtime event or claim strict applied evidence
- **AND** diagnostics remain metadata-only and secret-safe

#### Scenario: Host input application remains scoped

- **WHEN** a host enables inbound Windows input application
- **THEN** the process MUST NOT capture input, keylog, read clipboard data,
  sync clipboard, transfer files, collect diagnostics, install services,
  configure startup persistence, elevate privileges, run unattended, collect
  credentials, evade AV/EDR, bypass Windows prompts, hide the active host
  session indicator, or suppress host pause, revoke, terminate, or disconnect
  controls

## ADDED Requirements

### Requirement: Agent shell audit correlates one consented native lifecycle

The agent shell SHALL persist bounded authorization correlation metadata needed
to prove one consented native lifecycle. Accepted host authorization approval,
active authorization, screen capture request, post-adapter capture completion,
frame sent, input application
request, input applied, permission revocation, and disconnect or terminal
lifecycle records MUST carry the current session id and authorization id in
their schema-like audit fields. Capture request/completion/send records MUST
retain matching frame id and sequence metadata; input request/applied records MUST retain matching
event id and sequence metadata. No such audit record may include frame bytes,
screen content, pointer coordinates, button values, key values, raw input
content, private reasons, tokens, pairing codes, credentials, clipboard data,
command output, or full secrets.

#### Scenario: Approved lifecycle remains correlated

- **WHEN** the host approves and activates a visible authorization, performs
  opted-in capture/input, revokes permission, and disconnects
- **THEN** accepted metadata-only records for those actions carry one bounded
  session and authorization correlation
- **AND** capture and input records retain only their bounded matching ids and
  sequence metadata

#### Scenario: Native capture success is recorded after the adapter

- **WHEN** authorized Windows capture succeeds
- **THEN** the runtime writes matching metadata-only capture completion after
  the adapter returns and before sending the frame
- **AND** adapter failure or capture-completion audit failure MUST NOT produce
  accepted completion or frame-sent evidence

#### Scenario: Revoked authorization cannot produce later native success

- **WHEN** permission is revoked or the authorization becomes terminal before
  a capture or input action
- **THEN** the runtime MUST reject the native action before accepted native
  success audit is written
- **AND** it MUST NOT reconnect, create a replacement authorization, hide the
  session, or bypass host consent

#### Scenario: Correlation metadata remains local and redacted

- **WHEN** the runtime writes correlated consent/native audit records
- **THEN** status output and bounded helper diagnostics MUST NOT echo session,
  authorization, frame, or event identifiers
- **AND** no network, installer, startup, service, privilege, credential, or
  hidden-session behavior is added

### Requirement: Viewer local leave emits bounded disconnect evidence

The agent shell SHALL attempt to persist a metadata-only
`agent-shell.session.disconnected` record when an authorized viewer invokes
local `leave()`. The record MUST be bound to the current session and observed
authorization. The runtime MUST capture the bounded metadata, complete local
socket closure, and schedule one best-effort audit attempt so the leave
operation resolves before the audit sink is invoked. Missing, slow, or failed
audit persistence MUST NOT block, delay, retry, or reverse the viewer's local
leave operation, and MUST NOT reconnect the viewer.

#### Scenario: Authorized viewer leaves locally

- **WHEN** a viewer with an observed authorization invokes local `leave()`
- **THEN** the runtime attempts one accepted local disconnect audit record with
  bounded authorization status, visibility, and permission-count metadata
- **AND** it closes the local runtime before running the audit sink and without exposing session or authorization
  identifiers in status or diagnostic output

#### Scenario: Viewer leave audit fails

- **WHEN** local disconnect audit persistence rejects during viewer `leave()`
- **THEN** the runtime reports the failure best-effort and still completes the
  local disconnect immediately
- **AND** it MUST NOT retry, reconnect, keep the session open, expose raw audit
  errors, or suppress host visibility and controls

#### Scenario: Viewer leave audit sink is slow

- **WHEN** local disconnect audit persistence performs slow synchronous I/O
- **THEN** the viewer connection is already closed and the leave operation is
  already resolved before that sink is invoked
- **AND** the runtime MUST NOT retry, reconnect, or delay local revocation
