## MODIFIED Requirements

### Requirement: Local viewer surface sends only explicit consent-bound input

The local viewer surface SHALL accept only bounded exact viewer control input
commands and MUST route accepted commands through the existing viewer runtime
input-event method. The generated local page MAY expose explicit on-screen
keyboard buttons for a bounded set of protocol-supported keys; each keyboard
button MUST send exactly one key-down command and exactly one key-up command
through the same local `/input` path as manual commands. The generated local
page MAY expose visible pointer interactions on the frame, but page-originated
pointer movement, wheel, and button events MUST be disabled by default and MUST
require an explicit visible same-page pointer arming action before they can send
pointer input. Browser-native context menu and image drag defaults MAY be
suppressed for the displayed remote frame only and MUST NOT be suppressed through
document-level or window-level pointer capture. The surface MUST verify that the
current viewer status is active, visible, and bound to an authorization id
before requesting the runtime send. The runtime remains authoritative for
required permission, peer routing, audit-before-send, socket state, local/remote
disconnect state, pause, revoke, expiration, and redaction. The surface MUST
generate an unguessable per-run mutation token for the visible local page and
MUST reject input or disconnect POST requests before reading request bodies,
reading viewer authorization state, sending input, or leaving the viewer when
the token is missing or incorrect, the `Origin` header is missing or foreign, or
the `Content-Type` is not JSON. The surface MUST NOT install document-level
keyboard capture, buffer typed text, create macros, read clipboard data, or send
keys except through an explicit same-page button click or a bounded exact manual
command.

#### Scenario: Local surface sends pointer input

- **WHEN** the local viewer surface receives a bounded valid pointer command
  from the generated same-origin page with the current per-run mutation token
  while the viewer status is active and visible for the current authorization
- **THEN** it sends exactly one pointer `input-event` through
  `runtime.sendInputEvent()`
- **AND** the HTTP response, CLI logs, local events, and audit records MUST NOT
  expose pointer coordinates, button values, raw request bodies, tokens, pairing
  codes, private reasons, credentials, or full secrets

#### Scenario: Local surface requires pointer arming

- **WHEN** the generated local viewer page is loaded or the latest-frame image
  is not ready
- **THEN** browser pointer movement, wheel, and pointer button handlers are not
  armed to send remote input
- **AND** pointer handlers can send only after the viewer user uses the visible
  same-page pointer arming control
- **AND** arming state changes MUST NOT send pointer input, grant permissions,
  bypass runtime authorization gates, install global pointer listeners, or hide
  the host active-session indicator

#### Scenario: Local surface suppresses only frame browser defaults

- **WHEN** the generated local viewer page is loaded
- **THEN** browser-native context menu and image drag default behavior MAY be
  prevented on the displayed remote frame element
- **AND** the page MUST NOT install document-level or window-level pointer
  capture, keyboard capture, clipboard access, macro handlers, hidden input
  listeners, persistence, elevation, or Windows prompt bypass

#### Scenario: Local surface sends keyboard button input

- **WHEN** the local viewer surface user clicks a generated same-page keyboard
  button while the viewer status is active and visible for the current
  authorization
- **THEN** the page sends one `key-down` command and one `key-up` command
  through the existing token-protected `/input` endpoint
- **AND** the runtime receives two ordered keyboard `input-event` sends through
  the existing `runtime.sendInputEvent()` path
- **AND** HTTP responses, CLI logs, local events, and audit records MUST NOT
  expose key values, modifier values, raw request bodies, tokens, pairing codes,
  private reasons, credentials, or full secrets

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

#### Scenario: Local surface does not capture keyboard input

- **WHEN** the generated local viewer page is loaded
- **THEN** it MUST NOT install document-level keyboard capture, hidden hotkeys,
  typed-text buffers, macros, clipboard reads, file-transfer commands,
  diagnostics collection, background input listeners, persistence, elevation, or
  Windows prompt bypass
