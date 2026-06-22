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
require both an explicit visible same-page pointer arming action and a currently
ready latest-frame image before they can send pointer input. Browser-native
context menu and image drag defaults MAY be suppressed for the displayed remote
frame only and MUST NOT be suppressed through document-level or window-level
pointer capture. The surface MUST verify that the current viewer status is
active, visible, and bound to an authorization id before requesting the runtime
send. The runtime remains authoritative for required permission, peer routing,
audit-before-send, socket state, local/remote disconnect state, pause, revoke,
expiration, and redaction. The surface MUST generate an unguessable per-run
mutation token for the visible local page and MUST reject input or disconnect
POST requests before reading request bodies, reading viewer authorization state,
sending input, or leaving the viewer when the token is missing or incorrect, the
`Origin` header is missing or foreign, or the `Content-Type` is not JSON. The
surface MUST NOT install document-level keyboard capture, buffer typed text,
create macros, read clipboard data, or send keys except through an explicit
same-page button click or a bounded exact manual command.

#### Scenario: Local surface requires pointer arming

- **WHEN** the generated local viewer page is loaded, the latest-frame image is
  loading, or the latest-frame image is not ready
- **THEN** browser pointer movement, wheel, and pointer button handlers are not
  armed to send remote input
- **AND** the visible pointer arming control is disabled until the latest-frame
  image is ready
- **AND** pointer handlers can send only after the viewer user uses the visible
  same-page pointer arming control while the latest-frame image is ready
- **AND** arming state changes MUST NOT send pointer input, grant permissions,
  bypass runtime authorization gates, install global pointer listeners, or hide
  the host active-session indicator
