## ADDED Requirements

### Requirement: Agent shell host serves a loopback local control surface

The agent shell CLI SHALL expose an opt-in host-only local control surface that
binds only to `127.0.0.1` on an explicitly configured port, including
ephemeral port `0`, and stops with CLI runtime shutdown. The generated page
SHALL serve only bounded host status metadata and visible host lifecycle
controls for status, pause, resume, revoke `screen:view`, revoke
`input:pointer`, revoke `input:keyboard`, terminate, and disconnect. The
surface MUST NOT serve screen frames, capture the screen, send viewer input,
read clipboard data, transfer files, collect diagnostics dumps, expose a remote
shell, bind to LAN interfaces, start hidden browser processes, install
services, configure startup persistence, elevate privileges, run unattended,
collect credentials, keylog, evade AV/EDR, bypass Windows prompts, hide the
active host session indicator, or suppress existing host terminal controls.

#### Scenario: Host surface starts on loopback

- **WHEN** a host CLI process is started with the host local control surface option
- **THEN** the local surface listens only on `127.0.0.1` with the configured or OS-assigned TCP port
- **AND** the CLI logs only the bounded loopback URL for the operator to open
- **AND** logs MUST NOT expose mutation tokens, authorization ids, permission lists, pairing codes, credentials, private reasons, command bodies, screen contents, input contents, clipboard contents, diagnostics dumps, or full secrets

#### Scenario: Viewer role cannot start host surface

- **WHEN** a viewer CLI process is started with the host local control surface option
- **THEN** parsing fails before relay startup, protocol messages, listener creation, capture, input, authorization changes, persistence, or consent bypass

#### Scenario: Host surface remains development-scoped

- **WHEN** the host local control surface is rendered or receives a request
- **THEN** it MUST NOT approve sessions, grant permissions, capture the screen, send input, reconnect peers, expose a remote shell, read clipboard data, transfer files, collect diagnostics dumps, install services, configure startup persistence, elevate privileges, run unattended, collect credentials, keylog, evade AV/EDR, bypass Windows prompts, or hide the active host session indicator

### Requirement: Host local surface protects local mutations

The host local control surface SHALL generate an unguessable per-run mutation
token for the visible local page and SHALL reject every mutating request before
reading host authorization state or invoking lifecycle controls unless the
request uses the exact resolved loopback `Host` value, same-origin `Origin`,
JSON `Content-Type`, and the correct mutation token header. Rejection responses
MUST be bounded and MUST NOT expose mutation tokens, authorization ids,
permission names, raw command bodies, requested host names, credentials,
private reasons, local file paths, diagnostics dumps, or full secrets.

#### Scenario: Token-protected pause is accepted

- **WHEN** the generated host page posts a valid pause command with exact loopback `Host`, same-origin `Origin`, JSON content type, and the per-run token
- **THEN** the surface invokes the existing host runtime pause operation
- **AND** the response includes only bounded action metadata

#### Scenario: Missing mutation guard is rejected before control

- **WHEN** a pause, resume, revoke, terminate, or disconnect request is missing the token, has a wrong token, missing or foreign `Origin`, mismatched or missing `Host`, or non-JSON content type
- **THEN** the surface rejects the request before invoking host lifecycle controls or reading host authorization state
- **AND** the response MUST NOT expose command contents, permission names, mutation tokens, requested host names, authorization ids, pairing codes, credentials, private reasons, diagnostics dumps, or full secrets

#### Scenario: Malformed command is rejected safely

- **WHEN** a mutation body is malformed, oversized, contains an unknown command, or contains an unsafe revoke permission
- **THEN** the surface rejects the request before invoking host lifecycle controls
- **AND** it MUST NOT grant permissions, send protocol messages, start capture, send input, reconnect peers, hide host visibility, or bypass consent

### Requirement: Host local surface reports bounded status and closes after terminal actions

The host local control surface SHALL return sanitized host status through a
fixed `GET /status` endpoint and SHALL serve generated no-store/nosniff HTML
with a nonce-based Content Security Policy. Status responses and visible page
text MAY include bounded lifecycle metadata such as state, visible-to-host
flag, permission count, authorization status, expiry, bounded viewer device
metadata, inactive cause, and remote disconnect reason code. They MUST NOT
expose mutation tokens, raw permission arrays, raw protocol payloads, raw
command bodies, pairing codes, credentials, private reasons, screen contents,
input contents, clipboard contents, file-transfer contents, diagnostics dumps,
or full secrets. After an accepted `terminate` or `disconnect` mutation, the
local surface SHALL stop accepting further requests.

#### Scenario: Status returns bounded host state

- **WHEN** a local browser requests `GET /status` with the exact resolved loopback `Host`
- **THEN** the response contains sanitized host status metadata only
- **AND** it MUST NOT expose mutation tokens, raw permission arrays, raw protocol payloads, pairing codes, credentials, private reasons, screen contents, input contents, clipboard contents, diagnostics dumps, or full secrets

#### Scenario: Mismatched Host is rejected before status

- **WHEN** a request for `/` or `/status` uses a missing or mismatched `Host` value
- **THEN** the surface rejects the request before serving HTML or reading host status
- **AND** the response does not expose mutation tokens, authorization ids, permission names, requested host names, credentials, private reasons, diagnostics dumps, or full secrets

#### Scenario: Terminal lifecycle action closes the surface

- **WHEN** the host local control surface accepts `terminate` or `disconnect`
- **THEN** it invokes the matching existing runtime operation and then stops the local listener
- **AND** shutdown MUST NOT reconnect peers, keep a background listener alive, start capture, send input, install persistence, hide the host active-session indicator, or bypass consent
