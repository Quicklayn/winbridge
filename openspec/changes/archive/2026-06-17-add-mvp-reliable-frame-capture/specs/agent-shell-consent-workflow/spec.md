## MODIFIED Requirements

### Requirement: Agent shell CLI sends consent-bound Windows capture frames

The agent shell CLI SHALL expose a host-only development screen-frame source
that captures the Windows primary screen through the reviewed Windows capture
adapter and sends the resulting frame through the dedicated runtime
screen-frame method. Native capture MUST be invoked only inside the host runtime
after internal active visible unexpired authorization grants `screen:view`, peer
routing is available, the local socket is open, the remote peer is connected,
and metadata-only local audit for the capture attempt has been persisted.

#### Scenario: Host sends a captured Windows frame

- **WHEN** a host CLI process is started with the Windows capture screen-frame source and later has active visible unexpired `screen:view` authorization
- **THEN** the runtime writes metadata-only local capture audit before invoking the Windows capture adapter
- **AND** it sends the captured JPEG or PNG through the existing `sendScreenFrame()` path with the protocol MIME type that matches the adapter-reported frame format
- **AND** existing screen-frame send authorization, routing, audit-before-send, socket, and redaction gates still apply

#### Scenario: Capture source lacks authorization

- **WHEN** the host CLI capture source fires before active visible unexpired `screen:view` authorization exists
- **THEN** it waits without invoking native capture, writing capture audit, sending screen frames, opening native adapters, reconnecting peers, hiding the session, or bypassing consent

#### Scenario: Authorization is lost during capture stream

- **WHEN** a finite Windows capture frame stream has sent fewer than the configured count and authorization becomes paused, revoked, terminated, expired, invisible, disconnected, or no longer grants `screen:view`
- **THEN** it stops before further capture audit, native capture, accepted-send audit, socket write, local sent event emission, reconnection, hidden session behavior, or consent bypass

#### Scenario: Capture audit fails

- **WHEN** the runtime is otherwise authorized to capture a Windows frame but metadata-only local capture audit persistence fails
- **THEN** the runtime rejects before invoking native capture, sending a frame, writing accepted-send audit, or exposing raw screen contents

#### Scenario: Capture adapter fails

- **WHEN** the Windows capture adapter rejects or returns invalid output
- **THEN** the CLI reports only bounded generic failure metadata
- **AND** it MUST NOT expose raw frame bytes, encoded frame data, screenshots, screen contents, credentials, tokens, pairing codes, private reasons, command output, or full secrets

#### Scenario: Capture source configuration is malformed

- **WHEN** a host or viewer CLI process is started with malformed Windows capture source configuration such as role mismatch, static frame payload options mixed with capture source, unsafe count, missing interval for multi-frame streaming, or unsafe frame ids
- **THEN** it exits through bounded usage handling before opening native capture, sending protocol messages, writing audit records, reconnecting peers, hiding the session, or bypassing consent

#### Scenario: Capture source remains scoped to viewing

- **WHEN** a host uses the Windows capture screen-frame source
- **THEN** the process MUST NOT render a viewer desktop, inject OS input, sync clipboard, transfer files, collect diagnostics, install services, configure startup persistence, elevate privileges, run unattended, collect credentials, keylog, evade AV/EDR, bypass Windows prompts, or hide capture from the host

### Requirement: Local viewer surface displays only the configured latest frame

The local viewer surface SHALL serve frame bytes only from the already
validated `--viewer-screen-frame-output` path after the viewer runtime has
persisted authorized inbound frame bytes there during the current local surface
run. The surface MUST clear the configured latest-frame path during startup or
fail closed, and it MUST return not-ready until the current run has a persisted
frame. It MUST NOT accept path parameters, browse directories, read arbitrary
files, cache stale frames as trusted state, or expose raw frame bytes through
logs or diagnostics. The
surface MUST choose a bounded `image/jpeg` or `image/png` content type from
recognized JPEG/PNG byte signatures before falling back to the configured file
extension.

#### Scenario: Local surface returns persisted frame bytes

- **WHEN** the viewer surface receives a frame request after an authorized
  inbound `screen-frame` has been persisted to the configured latest-frame path
- **THEN** it returns that file with a bounded image content type matching a recognized JPEG or PNG byte signature when present and no-store cache headers
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

#### Scenario: Local surface sees a pre-existing frame file

- **WHEN** the local viewer surface starts and the configured latest-frame path
  already contains bytes from a previous run
- **THEN** it clears that file or fails closed before opening the listener
- **AND** frame requests return not-ready until a current-run authorized inbound
  `screen-frame` has been persisted to the configured path

### Requirement: Local viewer surface sends only explicit consent-bound input

The local viewer surface SHALL accept only bounded exact viewer control input
commands and MUST route accepted commands through the existing viewer runtime
input-event method. The surface MUST verify that the current viewer status is
active, visible, and bound to an authorization id before requesting the runtime
send. The runtime remains authoritative for required permission, peer routing,
audit-before-send, socket state, local/remote disconnect state, pause, revoke,
expiration, and redaction. The surface MUST generate an unguessable per-run
mutation token for the visible local page and MUST reject input or disconnect
POST requests before reading request bodies, reading viewer authorization
state, sending input, or leaving the viewer when the token is missing or
incorrect, the `Origin` header is missing or foreign, or the `Content-Type` is
not JSON.

#### Scenario: Local surface sends pointer input

- **WHEN** the local viewer surface receives a bounded valid pointer command
  from the generated same-origin page with the current per-run mutation token
  while the viewer status is active and visible for the current authorization
- **THEN** it sends exactly one pointer `input-event` through
  `runtime.sendInputEvent()`
- **AND** the HTTP response, CLI logs, local events, and audit records MUST NOT
  expose pointer coordinates, button values, raw request bodies, tokens, pairing
  codes, private reasons, credentials, or full secrets

#### Scenario: Local surface rejects a forged mutation request

- **WHEN** the local viewer surface receives an input or disconnect POST request
  without the current per-run token, without the local same-origin `Origin`, with
  a foreign `Origin`, or with a non-JSON content type
- **THEN** it rejects before reading the request body, reading viewer
  authorization state, sending input, disconnecting, writing accepted-send audit,
  invoking native adapters, reconnecting peers, hiding the session, or bypassing
  consent

#### Scenario: Local surface input is malformed

- **WHEN** the local viewer surface receives malformed, oversized,
  whitespace-padded, suffixed, macro-shaped, raw-JSON-shaped,
  free-form-text-shaped, unsupported-button, duplicate-modifier, unsafe
  coordinate, or unsafe wheel-delta input from the generated same-origin page
  with the current per-run mutation token
- **THEN** it rejects the request before reading viewer authorization state,
  sending input, writing accepted-send audit, invoking native adapters,
  reconnecting peers, hiding the session, or bypassing consent
- **AND** diagnostics MUST NOT echo the raw input body or any raw command text
