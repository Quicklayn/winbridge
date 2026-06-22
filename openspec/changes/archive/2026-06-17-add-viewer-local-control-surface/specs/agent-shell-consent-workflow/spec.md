## ADDED Requirements

### Requirement: Agent shell viewer serves a loopback local control surface

The agent shell CLI SHALL expose an opt-in viewer-only local control surface
that binds only to `127.0.0.1`, requires an explicit validated port, requires
the existing explicit viewer screen-frame output path, and stops with the
viewer CLI process. The surface MUST NOT be reachable on wildcard, LAN, or
public interfaces and MUST NOT start before CLI option validation succeeds.

#### Scenario: Viewer starts local control surface
- **WHEN** a viewer CLI process is started with valid local control surface
  options, `screen:view` request permission, local audit configuration, and a
  valid viewer screen-frame output path
- **THEN** it binds the local control surface only to `127.0.0.1` on the
  configured port
- **AND** startup diagnostics MUST expose only the loopback URL and bounded
  metadata, not tokens, pairing codes, private reasons, frame bytes, screen
  contents, input contents, credentials, or full secrets

#### Scenario: Local control surface options are malformed
- **WHEN** a host process, viewer process without `screen:view`, viewer process
  without local audit, viewer process without an explicit screen-frame output
  path, or process with an unsafe local control surface port attempts to start
  the local control surface
- **THEN** CLI option parsing fails closed before opening a relay connection,
  starting HTTP listeners, reading frame files, sending protocol messages,
  writing audit records, rendering frames, sending input, invoking native
  adapters, reconnecting peers, hiding the session, or bypassing consent

### Requirement: Local viewer surface displays only the configured latest frame

The local viewer surface SHALL serve frame bytes only from the already
validated `--viewer-screen-frame-output` path after the viewer runtime has
persisted authorized inbound frame bytes there. It MUST NOT accept path
parameters, browse directories, read arbitrary files, cache stale frames as
trusted state, or expose raw frame bytes through logs or diagnostics.

#### Scenario: Local surface returns persisted frame bytes
- **WHEN** the viewer surface receives a frame request after an authorized
  inbound `screen-frame` has been persisted to the configured latest-frame path
- **THEN** it returns that file with a bounded image content type and no-store
  cache headers
- **AND** local events, logs, HTTP metadata, and audit records MUST NOT expose
  raw frame bytes, encoded frame data, screenshots, screen contents, tokens,
  pairing codes, private reasons, credentials, or full secrets

#### Scenario: Local surface has no frame yet
- **WHEN** the viewer surface receives a frame request before an authorized
  frame has been persisted
- **THEN** it returns a bounded not-ready response without reading any other
  path, sending protocol messages, starting capture, rendering hidden content,
  reconnecting peers, granting permissions, hiding the session, or bypassing
  consent

### Requirement: Local viewer surface sends only explicit consent-bound input

The local viewer surface SHALL accept only bounded exact viewer control input
commands and MUST route accepted commands through the existing viewer runtime
input-event method. The surface MUST verify that the current viewer status is
active, visible, and bound to an authorization id before requesting the runtime
send. The runtime remains authoritative for required permission, peer routing,
audit-before-send, socket state, local/remote disconnect state, pause, revoke,
expiration, and redaction.

#### Scenario: Local surface sends pointer input
- **WHEN** the local viewer surface receives a bounded valid pointer command
  while the viewer status is active and visible for the current authorization
- **THEN** it sends exactly one pointer `input-event` through
  `runtime.sendInputEvent()`
- **AND** the HTTP response, CLI logs, local events, and audit records MUST NOT
  expose pointer coordinates, button values, raw request bodies, tokens, pairing
  codes, private reasons, credentials, or full secrets

#### Scenario: Local surface sends keyboard input
- **WHEN** the local viewer surface receives a bounded valid keyboard command
  while the viewer status is active and visible for the current authorization
- **THEN** it sends exactly one keyboard `input-event` through
  `runtime.sendInputEvent()`
- **AND** the surface MUST NOT buffer typed text, record keystrokes, capture
  keyboard input outside the visible local page, create macros, read clipboard
  data, or expose key values, modifiers, raw request bodies, tokens, pairing
  codes, private reasons, credentials, or full secrets in diagnostics

#### Scenario: Local surface input lacks authorization
- **WHEN** the local viewer surface receives otherwise valid input while
  authorization is missing, inactive, paused, revoked, terminated, expired,
  invisible, disconnected, or no longer grants the required input permission
- **THEN** it fails closed before accepted-send audit, socket write, local sent
  event emission, host input side effects, native adapter invocation,
  reconnection, hidden session behavior, or consent bypass

#### Scenario: Local surface input is malformed
- **WHEN** the local viewer surface receives malformed, oversized,
  whitespace-padded, suffixed, macro-shaped, raw-JSON-shaped,
  free-form-text-shaped, unsupported-button, duplicate-modifier, unsafe
  coordinate, or unsafe wheel-delta input
- **THEN** it rejects the request before reading viewer authorization state,
  sending input, writing accepted-send audit, invoking native adapters,
  reconnecting peers, hiding the session, or bypassing consent
- **AND** diagnostics MUST NOT echo the raw input body or any raw command text

### Requirement: Local viewer surface remains development-scoped

The local viewer surface SHALL remain a visible, opt-in development MVP helper.
It MUST NOT approve sessions, grant permissions, hide the host active-session
indicator, suppress host pause/revoke/terminate/disconnect controls, run
unattended, install services, configure startup persistence, elevate
privileges, collect credentials, read clipboard data, transfer files, collect
diagnostics dumps, evade AV/EDR, bypass Windows prompts, or expose a remote
administration shell.

#### Scenario: Local surface is stopped with viewer shutdown
- **WHEN** the viewer CLI is interrupted, terminated, or otherwise shuts down
- **THEN** the local control surface listener is closed with the rest of the CLI
  handles
- **AND** shutdown MUST NOT reconnect peers, keep a background listener alive,
  install persistence, continue sending input, continue serving frames, hide the
  session, or bypass consent
