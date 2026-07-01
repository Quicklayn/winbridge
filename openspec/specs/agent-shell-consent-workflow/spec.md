# agent-shell-consent-workflow Specification

## Purpose
Defines the non-native agent shell workflow for exercising consent, visible activation, and revocation protocol behavior without implementing remote actions.
## Requirements
### Requirement: Managed agent shell lifecycle
The agent shell SHALL expose a managed runtime with explicit start and stop operations for tests and CLI use. It SHALL send `join-session` when the socket opens. It SHALL reject duplicate active `start()` calls while the same runtime already has a connecting, open, or closing WebSocket. It SHALL send `hello` only after the relay indicates a two-peer room or after receiving an accepted opposite-role peer `hello`, and MUST NOT send `hello` before a relay recipient is available.

#### Scenario: Agent shell starts
- **WHEN** the agent shell runtime starts
- **THEN** it connects to the relay and sends a join message using the same implementation as the CLI

#### Scenario: Relay token remains local to connection setup
- **WHEN** the managed agent shell connects to a token-protected development relay with a configured relay token
- **THEN** local runtime logs and emitted runtime event records MUST NOT include the raw relay token, credentials, pairing codes, protocol payloads, private reasons, keystrokes, screenshots, screen contents, or input contents

#### Scenario: Duplicate active start is rejected
- **WHEN** caller code invokes `start()` while the same managed runtime already has a connecting, open, or closing WebSocket
- **THEN** the runtime rejects the duplicate start before opening another WebSocket, sending join, hello, authorization, lifecycle, signal, control, or audit messages, emitting local protocol events, granting permissions, activating host visibility, reconnecting peers, changing authorization lifecycle state, or bypassing consent workflows

#### Scenario: Start after closed runtime remains valid
- **WHEN** a managed runtime's prior WebSocket is fully closed or stopped
- **THEN** a later explicit `start()` MAY open a fresh relay connection through the normal startup path and reset only connection-scoped local state

#### Scenario: Hello waits for recipient
- **WHEN** the relay returns `relay-ready` with room size 1
- **THEN** the shell MUST NOT send `hello`

#### Scenario: Hello sent when room is paired
- **WHEN** the relay returns `relay-ready` with room size 2 or the shell receives an accepted opposite-role peer `hello`
- **THEN** it sends exactly one `hello` for its local peer before later workflow messages that depend on peer presence
- **AND** sending `hello` MUST NOT approve authorization, activate a visible session, grant permissions, start capture, send input, reconnect a peer, suppress host visibility, or bypass consent workflows

### Requirement: Hello capability metadata remains canonical
The agent shell SHALL rely on shared protocol validation for generated, inbound, and public-send `hello` capability metadata. `hello` capability metadata that is blank, untrimmed, duplicate after trimming, contains ASCII control characters, or contains Unicode bidirectional or zero-width formatting controls including `U+FEFF` MUST be rejected before it can create peer presence, authorize public sends, emit trusted local `received` or `sent` events, or trigger consent workflow messages.

#### Scenario: Inbound untrimmed capability is rejected
- **WHEN** the runtime receives a `hello`-shaped payload whose capability entry has leading or trailing whitespace
- **THEN** the runtime rejects it before local `received` protocol event emission or peer presence handling

#### Scenario: Inbound unsafe capability is rejected
- **WHEN** the runtime receives a `hello`-shaped payload whose capability entry contains an ASCII control character or Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** the runtime rejects it before local `received` protocol event emission or peer presence handling

#### Scenario: Inbound trim-duplicate capability is rejected
- **WHEN** the runtime receives a `hello`-shaped payload with capability entries that duplicate after trimming
- **THEN** the runtime rejects it before local `received` protocol event emission or peer presence handling

#### Scenario: Public hello with untrimmed capability is blocked
- **WHEN** caller code invokes public runtime `send()` with a same-session `hello` whose capability entry has leading or trailing whitespace
- **THEN** the runtime rejects the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked hello

#### Scenario: Public hello with unsafe capability is blocked
- **WHEN** caller code invokes public runtime `send()` with a same-session `hello` whose capability entry contains an ASCII control character or Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** the runtime rejects the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked hello

#### Scenario: Rejected capability diagnostics remain secret-safe
- **WHEN** the runtime rejects a `hello` because of malformed capability metadata
- **THEN** thrown errors, runtime events, and logs MUST NOT expose raw capability values, protocol payloads, display names, tokens, pairing codes, private reasons, keystrokes, screenshots, screen contents, or input contents

### Requirement: Agent shell display names remain canonical
The agent shell SHALL reject CLI, direct runtime, inbound `hello`, and public-send `hello` display-name values that are empty, whitespace-only, untrimmed, oversized, contain ASCII control characters, or contain Unicode bidirectional or zero-width formatting controls before opening a relay connection, sending `join-session`, sending `hello`, emitting trusted local protocol events, or running consent workflow handling.

#### Scenario: CLI display name is untrimmed
- **WHEN** the agent shell is started with a `--name` value that has leading or trailing whitespace
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: CLI display name contains ASCII control characters
- **WHEN** the agent shell is started with a `--name` value that contains an ASCII control character
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: CLI display name contains Unicode formatting controls
- **WHEN** the agent shell is started with a `--name` value that contains a Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Direct runtime display name is untrimmed
- **WHEN** caller code creates a managed runtime with a display name that has leading or trailing whitespace
- **THEN** runtime creation fails before opening a relay connection or sending any protocol message

#### Scenario: Direct runtime display name contains ASCII control characters
- **WHEN** caller code creates a managed runtime with a display name that contains an ASCII control character
- **THEN** runtime creation fails before opening a relay connection or sending any protocol message

#### Scenario: Direct runtime display name contains Unicode formatting controls
- **WHEN** caller code creates a managed runtime with a display name that contains a Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** runtime creation fails before opening a relay connection or sending any protocol message

#### Scenario: Inbound untrimmed hello display name is rejected
- **WHEN** the runtime receives a `hello`-shaped payload whose display name has leading or trailing whitespace
- **THEN** the runtime rejects it before local `received` protocol event emission or peer presence handling

#### Scenario: Inbound control-character hello display name is rejected
- **WHEN** the runtime receives a `hello`-shaped payload whose display name contains an ASCII control character
- **THEN** the runtime rejects it before local `received` protocol event emission or peer presence handling

#### Scenario: Inbound format-control hello display name is rejected
- **WHEN** the runtime receives a `hello`-shaped payload whose display name contains a Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** the runtime rejects it before local `received` protocol event emission or peer presence handling

#### Scenario: Public hello with untrimmed display name is blocked
- **WHEN** caller code invokes public runtime `send()` with a same-session `hello` whose display name has leading or trailing whitespace
- **THEN** the runtime rejects the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked hello

#### Scenario: Public hello with control-character display name is blocked
- **WHEN** caller code invokes public runtime `send()` with a same-session `hello` whose display name contains an ASCII control character
- **THEN** the runtime rejects the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked hello

#### Scenario: Public hello with format-control display name is blocked
- **WHEN** caller code invokes public runtime `send()` with a same-session `hello` whose display name contains a Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** the runtime rejects the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked hello

#### Scenario: Rejected display-name diagnostics remain secret-safe
- **WHEN** the runtime rejects display-name metadata because it is malformed
- **THEN** thrown errors, runtime events, and logs MUST NOT expose raw display names, protocol payloads, tokens, pairing codes, private reasons, keystrokes, screenshots, screen contents, or input contents

### Requirement: Inbound self-hello boundary
The agent shell SHALL ignore decoded inbound `hello` messages whose `peerId` equals the local runtime peer before emitting local `received` protocol events or running peer presence workflow handling.

#### Scenario: Self-hello is ignored
- **WHEN** a host shell receives a decoded `hello` message whose `peerId` equals the local host peer id
- **THEN** the shell MUST NOT send a local `hello` because of that message
- **AND** the shell MUST NOT emit a local `received` protocol event for that ignored message

#### Scenario: Ignored self-hello input remains secret-safe
- **WHEN** the shell ignores a decoded `hello` message that identifies the local peer
- **THEN** local events and logs expose only redacted summary metadata such as byte length
- **AND** they MUST NOT expose raw protocol payloads, session ids, peer ids, display names, capability strings, tokens, pairing codes, private reasons, signal payloads, keystrokes, screenshots, screen contents, or input contents

### Requirement: Inbound same-role hello boundary
The agent shell SHALL ignore decoded inbound `hello` messages whose `role` equals the local runtime role before emitting local `received` protocol events, recording recipient availability, or running peer presence workflow handling.

#### Scenario: Same-role hello is ignored
- **WHEN** a viewer shell receives a decoded `hello` message with role `viewer` from a different peer id in the same session
- **THEN** the shell MUST NOT send a local `hello` because of that message
- **AND** the shell MUST NOT emit a local `received` protocol event for that ignored message
- **AND** the shell MUST NOT treat that message as recipient availability for public runtime `send()`

#### Scenario: Opposite-role hello remains valid presence
- **WHEN** a host shell receives a decoded `hello` message with role `viewer` from a different peer id in the same session
- **THEN** the shell MAY treat that message as peer presence and send exactly one local `hello`

#### Scenario: Ignored same-role hello input remains secret-safe
- **WHEN** the shell ignores a decoded `hello` message that declares the local runtime role
- **THEN** local events and logs expose only redacted summary metadata such as byte length
- **AND** they MUST NOT expose raw protocol payloads, session ids, peer ids, roles, display names, capability strings, tokens, pairing codes, private reasons, signal payloads, keystrokes, screenshots, screen contents, or input contents

### Requirement: Inbound relay-ready peer boundary
The agent shell SHALL ignore decoded inbound `relay-ready` messages whose `peerId` does not match the local runtime peer before emitting local `received` protocol events or using room metadata for presence or authorization request workflow handling.

#### Scenario: Foreign relay-ready is ignored
- **WHEN** a viewer shell receives a decoded `relay-ready` whose `peerId` does not equal the local viewer peer id
- **THEN** the shell MUST NOT send `hello` or `session-authorization-request` because of that message
- **AND** the shell MUST NOT emit a local `received` protocol event for that ignored message

#### Scenario: Ignored foreign relay-ready input remains secret-safe
- **WHEN** the shell ignores a decoded `relay-ready` that identifies a different peer
- **THEN** local events and logs expose only redacted summary metadata such as byte length
- **AND** they MUST NOT expose raw protocol payloads, session ids, peer ids, tokens, pairing codes, private reasons, signal payloads, keystrokes, screenshots, screen contents, or input contents

### Requirement: Managed runtime option validation
The managed agent shell runtime SHALL validate direct runtime options before opening a relay connection or sending any protocol message. Invalid role, relay URL, relay token, identifiers, display name, requested permissions, revoke permission, visible session flag, host decision, host consent provider, host consent timeout, authorization TTL, lifecycle workflow timer delays, or blank, untrimmed, oversized, ASCII control-character, or Unicode bidirectional or zero-width formatting-control workflow reason options MUST fail closed before relay startup. Session id, peer id, and device id values MUST NOT contain secret-bearing protocol identifier metadata including token, credential, password, passphrase, secret, pairing code, API key, access key, cookie, private key, SSH key, authorization, authorization header, auth header, or proxy authorization marker families. Display name values MUST be non-blank, already trimmed, 120 characters or less, contain no ASCII control characters, and contain no Unicode bidirectional or zero-width formatting controls. Host consent timeout values MUST be exact positive integers from `1` through the safe timer delay bound and MUST only be configured when an interactive host decision provider is configured. Authorization TTL values MUST be positive integers from `1` through the safe timer delay bound. Lifecycle workflow timer delays MUST remain bounded integers from `0` through the safe timer delay bound. Workflow reason values MUST contain no ASCII control characters and no Unicode bidirectional or zero-width formatting controls including `U+FEFF`. Relay runtime token values MUST be non-blank, already trimmed, 1024 UTF-8 bytes or less, contain no ASCII control characters, contain no Unicode bidirectional formatting controls, and contain no zero-width formatting controls including `U+FEFF`. Relay URLs MUST NOT carry embedded credentials, canonical `token` query parameters, or case-variant `token` query parameters; relay shared tokens MUST use the dedicated runtime token path.

#### Scenario: Malformed runtime options fail before relay startup
- **WHEN** caller code creates a managed runtime with an invalid relay URL, session id, pairing code, peer id, device id, display name, requested permission, revoke permission, visible session flag, host decision, host consent provider, host consent timeout, authorization TTL, lifecycle workflow timer delay, or workflow reason
- **THEN** runtime creation fails before opening a relay connection
- **AND** it MUST NOT send join, authorization, lifecycle, signal, or audit messages

#### Scenario: Secret-bearing runtime session or peer id fails before relay startup
- **WHEN** caller code creates a managed runtime with a syntactically valid `sessionId` or `peerId` that contains secret-bearing protocol identifier metadata
- **THEN** runtime creation fails before opening a relay connection or sending any protocol message
- **AND** thrown errors, runtime events, and logs MUST NOT expose the raw session id or peer id

#### Scenario: Secret-bearing runtime device id fails before relay startup
- **WHEN** caller code creates a managed runtime with a syntactically valid `deviceId` that contains secret-bearing protocol identifier metadata
- **THEN** runtime creation fails before opening a relay connection or sending any protocol message
- **AND** thrown errors, runtime events, and logs MUST NOT expose the raw device id

#### Scenario: Malformed host consent timeout fails before relay startup
- **WHEN** caller code creates a managed runtime with a zero, fractional, negative, non-finite, timer-unsafe, or providerless host consent timeout value
- **THEN** runtime creation fails before opening a relay connection or sending any protocol message

#### Scenario: Zero runtime authorization TTL fails before relay startup
- **WHEN** caller code creates a managed runtime with `authorizationTtlMs: 0`
- **THEN** runtime creation fails before opening a relay connection, sending any protocol message, or scheduling workflow timers

#### Scenario: Zero runtime lifecycle delay remains valid
- **WHEN** caller code creates a managed runtime with `hostRevokeAfterMs`, `hostPauseAfterMs`, `hostResumeAfterMs`, `hostTerminateAfterMs`, or `hostDisconnectAfterMs` set to `0`
- **THEN** runtime creation succeeds without weakening the authorization TTL requirement

#### Scenario: Untrimmed runtime workflow reason fails before relay startup
- **WHEN** caller code creates a managed runtime with a workflow reason option containing leading or trailing whitespace
- **THEN** runtime creation fails before opening a relay connection or sending any protocol message

#### Scenario: Control-character runtime workflow reason fails before relay startup
- **WHEN** caller code creates a managed runtime with a workflow reason option containing an ASCII control character
- **THEN** runtime creation fails before opening a relay connection or sending any protocol message

#### Scenario: Format-control runtime workflow reason fails before relay startup
- **WHEN** caller code creates a managed runtime with a workflow reason option containing a Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** runtime creation fails before opening a relay connection or sending any protocol message

#### Scenario: Untrimmed runtime display name fails before relay startup
- **WHEN** caller code creates a managed runtime with a display name that has leading or trailing whitespace
- **THEN** runtime creation fails before opening a relay connection or sending any protocol message

#### Scenario: Control-character runtime display name fails before relay startup
- **WHEN** caller code creates a managed runtime with a display name that contains an ASCII control character
- **THEN** runtime creation fails before opening a relay connection or sending any protocol message

#### Scenario: Format-control runtime display name fails before relay startup
- **WHEN** caller code creates a managed runtime with a display name that contains a Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** runtime creation fails before opening a relay connection or sending any protocol message

#### Scenario: Relay URL credentials are rejected
- **WHEN** caller code creates a managed runtime with a relay URL containing a username, password, empty userinfo marker, canonical `token` query parameter, or case-variant `token` query parameter
- **THEN** runtime creation fails before opening a relay connection
- **AND** the runtime requires relay shared tokens to be provided through the dedicated token option instead of the URL

#### Scenario: Malformed runtime token is rejected
- **WHEN** caller code creates a managed runtime with an empty, whitespace-only, untrimmed, control-character, Unicode bidirectional formatting control, zero-width formatting control including `U+FEFF`, oversized, or non-string relay token
- **THEN** runtime creation fails before opening a relay connection

### Requirement: Sent runtime events are secret-safe
The agent shell SHALL emit local `sent` runtime events using a validated and redacted protocol event view that does not expose raw secrets.

#### Scenario: Sent join-session pairing code is redacted
- **WHEN** the managed runtime sends a `join-session` protocol message
- **THEN** the local `sent` runtime event MUST NOT expose the raw pairing code

#### Scenario: Sent audit event detail is redacted
- **WHEN** the managed runtime sends an `audit-event` whose detail contains sensitive keys such as tokens or credentials
- **THEN** the local `sent` runtime event exposes the redacted detail and MUST NOT expose the raw sensitive values

#### Scenario: Invalid outbound message emits no sent event
- **WHEN** the managed runtime is asked to send a malformed protocol message
- **THEN** it rejects the send before emitting a local `sent` runtime event

### Requirement: Public send session binding
The agent shell SHALL reject public managed runtime `send()` calls before socket write and before local `sent` event emission when the outbound protocol envelope `sessionId` does not match the local runtime session.

#### Scenario: Cross-session public request send is blocked
- **WHEN** caller code invokes public runtime `send()` with a protocol request envelope whose `sessionId` differs from the local runtime session
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked envelope

#### Scenario: Cross-session authorized signal send is blocked
- **WHEN** caller code invokes public runtime `send()` with a `signal` envelope whose `sessionId` differs from the local runtime session
- **AND** the runtime has active visible `screen:view` authorization
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked signal

#### Scenario: Same-session public send gates remain available
- **WHEN** caller code invokes public runtime `send()` with an envelope whose `sessionId` matches the local runtime session
- **THEN** the runtime MAY continue to apply later workflow-authority, signal routing, signal authorization, socket, and protocol validation gates

#### Scenario: Blocked cross-session send diagnostics are secret-safe
- **WHEN** the runtime blocks a public send because its `sessionId` differs from the local runtime session
- **THEN** thrown errors, runtime events, and logs MUST NOT expose raw protocol payloads, message types, session ids, peer ids, signal payloads, signal payload keys, tokens, pairing codes, private reasons, keystrokes, screenshots, screen contents, or input contents

### Requirement: Public send authority binding
The agent shell SHALL reject public managed runtime `send()` calls before socket write and before local `sent` event emission when the outbound protocol envelope is join-only, relay-originated, spoofs the local peer identity or role, or sends viewer-originated request messages from a non-viewer runtime or on behalf of another viewer peer.

#### Scenario: Public join and relay lifecycle sends are blocked
- **WHEN** caller code invokes public runtime `send()` with `join-session`, `relay-ready`, or `peer-disconnected`
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked envelope

#### Scenario: Public spoofed hello is blocked
- **WHEN** caller code invokes public runtime `send()` with a `hello` whose `peerId` or `role` differs from the local runtime peer id or role
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked hello

#### Scenario: Public role-mismatched viewer request is blocked
- **WHEN** caller code invokes public runtime `send()` with `host-consent-required` or `session-authorization-request`
- **AND** the local runtime role is not `viewer` or the request `viewerPeerId` differs from the local runtime peer id
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked request

#### Scenario: Same-viewer public request remains available
- **WHEN** caller code invokes public runtime `send()` from a viewer runtime with a same-session `host-consent-required` or `session-authorization-request` whose `viewerPeerId` equals the local runtime peer id
- **THEN** the public-send authority gate MUST NOT treat that request as a grant or decision
- **AND** that request MUST NOT approve authorization, activate visibility, grant permissions, start capture, send input, reconnect a peer, suppress host visibility, or bypass consent workflows

#### Scenario: Blocked public-send authority diagnostics are secret-safe
- **WHEN** the runtime blocks a public send because of join-only, relay-originated, spoofed identity, or role-mismatched request authority
- **THEN** thrown errors, runtime events, and logs MUST NOT expose raw protocol payloads, message types, session ids, peer ids, roles, display names, permission scopes, signal payloads, tokens, pairing codes, private reasons, keystrokes, screenshots, screen contents, or input contents

### Requirement: Public send recipient binding
The agent shell SHALL reject public managed runtime `send()` calls for peer-directed protocol messages before socket write and before local `sent` event emission until the runtime has observed a recipient peer through an accepted paired `relay-ready` message or an accepted inbound opposite-role peer `hello`. Recipient availability SHALL be connection-scoped and SHALL be cleared after a trusted remote peer disconnect notice.

#### Scenario: Public hello waits for recipient
- **WHEN** caller code invokes public runtime `send()` with a same-session `hello` whose peer id and role match the local runtime
- **AND** the runtime has not observed a paired room or peer `hello`
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked hello

#### Scenario: Public viewer request waits for recipient
- **WHEN** caller code invokes public runtime `send()` from a viewer runtime with a same-session `host-consent-required` or `session-authorization-request` whose `viewerPeerId` equals the local runtime peer id
- **AND** the runtime has not observed a paired room or peer `hello`
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked request

#### Scenario: Public peer sends fail after remote disconnect
- **WHEN** the runtime has observed a recipient peer
- **AND** the runtime receives a trusted remote `peer-disconnected` notice
- **THEN** later public peer-message sends MUST fail before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for those blocked sends

#### Scenario: Paired public viewer request remains available
- **WHEN** caller code invokes public runtime `send()` from a viewer runtime with a same-session `host-consent-required` or `session-authorization-request` whose `viewerPeerId` equals the local runtime peer id
- **AND** the runtime has observed a recipient peer
- **THEN** the recipient gate MUST NOT treat that request as a grant or decision
- **AND** that request MUST NOT approve authorization, activate visibility, grant permissions, start capture, send input, reconnect a peer, suppress host visibility, or bypass consent workflows

#### Scenario: Blocked public-send recipient diagnostics are secret-safe
- **WHEN** the runtime blocks a public send because no recipient peer has been observed
- **THEN** thrown errors, runtime events, and logs MUST NOT expose raw protocol payloads, message types, session ids, peer ids, display names, permission scopes, signal payloads, tokens, pairing codes, private reasons, keystrokes, screenshots, screen contents, or input contents

### Requirement: Sent signal runtime events are secret-safe
The agent shell SHALL emit local `sent` runtime events for `signal` messages without exposing raw signal payload contents, tokens, pairing codes, credentials, parser details, protocol payload fragments, keystrokes, screenshots, screen contents, or input contents.

#### Scenario: Sent signal payload is redacted
- **WHEN** the managed runtime sends a valid `signal` protocol message
- **THEN** the local `sent` runtime event MUST identify the signal message and peer routing metadata but MUST NOT expose the raw signal payload contents

#### Scenario: Sent signal event keeps safe diagnostics
- **WHEN** the managed runtime emits a local `sent` event for a `signal` message
- **THEN** the event MAY expose secret-safe metadata such as original payload byte length

### Requirement: Outbound signal peer binding
The agent shell SHALL reject public managed runtime `send()` calls for `signal` messages before socket write and before local `sent` event emission when the signal sender does not identify the local runtime peer or when an explicit signal target does not identify the authorized remote peer for the active authorization.

#### Scenario: Spoofed signal sender is blocked
- **WHEN** caller code invokes public runtime `send()` with a `signal` whose `fromPeerId` differs from the local runtime peer id
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked signal

#### Scenario: Self-targeted signal is blocked
- **WHEN** caller code invokes public runtime `send()` with a `signal` whose explicit `toPeerId` equals the local runtime peer id
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked signal

#### Scenario: Third-peer signal target is blocked
- **WHEN** caller code invokes public runtime `send()` with a `signal` whose explicit `toPeerId` identifies a peer other than the authorized remote peer
- **AND** the runtime has active visible `screen:view` authorization
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked signal

#### Scenario: Authorized signal routing remains available
- **WHEN** caller code invokes public runtime `send()` with a `signal` whose `fromPeerId` equals the local runtime peer id and whose explicit `toPeerId`, when present, equals the authorized remote peer
- **AND** the runtime has active visible `screen:view` authorization
- **THEN** the signal MAY be written to the socket
- **AND** the local `sent` event MUST continue to redact the signal payload contents

#### Scenario: Blocked outbound signal routing diagnostics are secret-safe
- **WHEN** the runtime blocks a public `signal` send because the sender is spoofed, the explicit target is the local runtime peer, or the explicit target is not the authorized remote peer
- **THEN** thrown errors, runtime events, and logs MUST NOT expose raw signal payloads, signal payload keys, tokens, pairing codes, authorization reasons, peer ids, keystrokes, screenshots, screen contents, or input contents

### Requirement: Viewer signal authorization gate
The agent shell SHALL block viewer-originated `signal` sends before socket write and before local `sent` event emission unless the viewer has observed a host-originated active, visible, unexpired authorization state that grants `screen:view`.

#### Scenario: Viewer signal is blocked before authorization
- **WHEN** a viewer runtime is connected and attempts to send a `signal` message before receiving an active visible authorization state with `screen:view`
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked signal

#### Scenario: Viewer signal is allowed after active visible grant
- **WHEN** a viewer runtime receives an active `session-authorization-state` with `visibleToHost: true`, unexpired `expiresAt`, and `screen:view`
- **THEN** a viewer-originated `signal` message MAY be sent through the runtime send path
- **AND** the local `sent` event MUST continue to redact the signal payload contents

#### Scenario: Viewer signal fails closed after revoke control, revocation, pause, termination, or expiration
- **WHEN** a viewer runtime has previously observed an active visible `screen:view` state
- **AND** it then observes a bound revoke-permission `session-control` for `screen:view`, a permission revocation that removes `screen:view`, a pause control, a state whose status is not `active`, or the authorization expires
- **THEN** later viewer-originated `signal` sends MUST be rejected before socket write and local `sent` event emission

#### Scenario: Blocked viewer signal diagnostics are secret-safe
- **WHEN** the runtime blocks a viewer-originated `signal` send because active visible `screen:view` authorization is missing
- **THEN** thrown errors, runtime events, and logs MUST NOT expose raw signal payloads, signal payload keys, tokens, pairing codes, authorization reasons, keystrokes, screenshots, screen contents, or input contents

### Requirement: Viewer authorization authority binding
The agent shell SHALL bind viewer-side authorization lifecycle state to the observed host authority from a `session-authorization-decision` addressed to the local viewer before using lifecycle messages to authorize viewer-originated `signal` sends. The viewer runtime MUST ignore inbound `session-authorization-decision` messages before local `received` protocol event emission when the decision's `hostPeerId` does not match the already observed opposite-role host peer. The viewer runtime MUST ignore inbound `audit-event` messages before local `received` protocol event emission when the event's `actorPeerId` does not match the already observed opposite-role host peer. Viewer-side `session-control` messages MUST match both the bound host authority and the current authorization id before they can change local authorization state. The viewer runtime MUST ignore inbound legacy `host-consent-decision` messages before local `received` protocol event emission and MUST NOT treat them as authorization decisions.

#### Scenario: Viewer ignores authorization state without bound decision
- **WHEN** a viewer runtime receives a decoded `session-authorization-state` before it has received a `session-authorization-decision` for the local viewer and matching authorization id
- **THEN** the runtime MUST ignore that state before local `received` protocol event emission
- **AND** later viewer-originated `signal` sends MUST still be rejected before socket write and local `sent` event emission

#### Scenario: Viewer ignores decision before observing host authority
- **WHEN** a viewer runtime receives a decoded `session-authorization-decision` for the local viewer before observing an opposite-role host peer with the same peer id as the decision's `hostPeerId`
- **THEN** the runtime MUST ignore that decision before local `received` protocol event emission
- **AND** the ignored decision MUST NOT bind host authority, grant permissions, activate visibility, authorize viewer-originated `signal` sends, start capture, send input, suppress host visibility, or bypass consent workflows

#### Scenario: Viewer ignores decision from mismatched observed host
- **WHEN** a viewer runtime has observed one opposite-role host peer and later receives a decoded `session-authorization-decision` for the local viewer from a different `hostPeerId`
- **THEN** the runtime MUST ignore that decision before local `received` protocol event emission
- **AND** the mismatched decision MUST NOT replace host authority, grant permissions, activate visibility, authorize viewer-originated `signal` sends, start capture, send input, suppress host visibility, or bypass consent workflows

#### Scenario: Viewer accepts decision from observed host authority
- **WHEN** a viewer runtime has observed an opposite-role host peer and receives a `session-authorization-decision` for the local viewer whose `hostPeerId` matches that observed host
- **THEN** the runtime MAY bind that host authority for the decision's authorization id without starting capture, sending input, reconnecting, hiding host visibility, or bypassing consent workflows

#### Scenario: Viewer ignores audit event before observing host authority
- **WHEN** a viewer runtime receives a decoded `audit-event` before observing an opposite-role host peer with the same peer id as the event's `actorPeerId`
- **THEN** the runtime MUST ignore that audit event before local `received` protocol event emission
- **AND** the ignored audit event MUST NOT create trusted local workflow metadata, bind host authority, grant permissions, authorize viewer-originated `signal` sends, start capture, send input, suppress host visibility, or bypass consent workflows

#### Scenario: Viewer ignores audit event from mismatched observed host
- **WHEN** a viewer runtime has observed one opposite-role host peer and later receives a decoded `audit-event` from a different `actorPeerId`
- **THEN** the runtime MUST ignore that audit event before local `received` protocol event emission
- **AND** the mismatched audit event MUST NOT replace host authority, create trusted local workflow metadata, grant permissions, authorize viewer-originated `signal` sends, start capture, send input, suppress host visibility, or bypass consent workflows

#### Scenario: Viewer accepts audit event from observed host authority
- **WHEN** a viewer runtime has observed an opposite-role host peer and receives an `audit-event` whose `actorPeerId` matches that observed host
- **THEN** the runtime MAY emit the redacted local received audit event without starting capture, sending input, reconnecting, hiding host visibility, granting permissions, or bypassing consent workflows

#### Scenario: Viewer ignores mismatched authorization authority
- **WHEN** a viewer runtime has received a `session-authorization-decision` for the local viewer from one observed host authority
- **AND** it then receives `session-authorization-state`, `permission-revoked`, or `session-control` from a different actor authority for the same session
- **THEN** the runtime MUST ignore the mismatched lifecycle message before local `received` protocol event emission
- **AND** the mismatched message MUST NOT grant, restore, pause, revoke, terminate, or otherwise alter viewer signal-send authorization

#### Scenario: Viewer ignores mismatched session-control authorization id
- **WHEN** a viewer runtime has received a host decision and active visible state for one authorization id
- **AND** it then receives `session-control` from the bound host authority with a different authorization id
- **THEN** the runtime MUST ignore the mismatched control before local `received` protocol event emission
- **AND** the mismatched control MUST NOT pause, resume, terminate, revoke, restore, or otherwise alter viewer signal-send authorization

#### Scenario: Viewer ignores legacy host consent decision
- **WHEN** a viewer runtime receives a decoded legacy `host-consent-decision` addressed to the local viewer
- **THEN** the runtime MUST ignore that legacy decision before local `received` protocol event emission
- **AND** the ignored legacy decision MUST NOT bind host authority, grant permissions, activate visibility, authorize viewer-originated `signal` sends, start capture, send input, suppress host visibility, or bypass consent workflows

#### Scenario: Viewer ignores decisions for another viewer
- **WHEN** a viewer runtime receives a `session-authorization-decision` whose `viewerPeerId` does not identify the local viewer
- **THEN** the runtime MUST ignore that decision before local `received` protocol event emission
- **AND** the ignored decision MUST NOT bind host authority or authorize viewer-originated `signal` sends

#### Scenario: Viewer denied decision remains fail-closed
- **WHEN** a viewer runtime receives a denied `session-authorization-decision` for the local viewer from the observed host authority
- **AND** it later receives an active `session-authorization-state` or `session-control` for the same authorization id and host authority
- **THEN** the runtime MUST ignore the lifecycle message before local `received` protocol event emission
- **AND** later viewer-originated `signal` sends MUST still be rejected before socket write and local `sent` event emission

#### Scenario: Viewer restart clears authorization authority binding
- **WHEN** a viewer runtime object is stopped and started again after previously observing active visible `screen:view` authorization
- **THEN** the restarted runtime MUST NOT treat the prior connection's decision, host authority, or authorization state as active
- **AND** viewer-originated `signal` sends MUST be rejected until the restarted runtime receives a new observed-host local-viewer decision and matching active visible state

#### Scenario: Ignored viewer authorization authority diagnostics are secret-safe
- **WHEN** the viewer runtime ignores an unbound or mismatched authorization lifecycle message, ignores a decision from an unobserved or mismatched host, ignores an audit event from an unobserved or mismatched host, or ignores a legacy host consent decision
- **THEN** local events and logs expose only redacted summary metadata such as byte length
- **AND** they MUST NOT expose raw protocol payloads, session ids, peer ids, authorization ids, actor ids, audit ids, audit actions, audit details, signal payloads, tokens, pairing codes, private reasons, grant scopes, keystrokes, screenshots, screen contents, or input contents

### Requirement: Host inbound signal authorization gate
The agent shell SHALL ignore inbound `signal` messages at the host before local `received` event emission or received signal summary logging unless the host runtime has locally emitted an active, visible, unexpired authorization state that grants `screen:view`.

#### Scenario: Host ignores inbound signal before active visible authorization
- **WHEN** a host runtime receives a decoded inbound `signal` before it has emitted active visible `screen:view` authorization
- **THEN** the runtime MUST NOT emit a local `received` protocol event for that signal
- **AND** the runtime MUST NOT log a received signal summary for that signal

#### Scenario: Host accepts inbound signal after active visible grant
- **WHEN** a host runtime has emitted an active `session-authorization-state` with `visibleToHost: true`, unexpired `expiresAt`, and `screen:view`
- **THEN** a correctly addressed inbound `signal` from the remote viewer MAY emit a local `received` event
- **AND** that received event MUST continue to redact the signal payload contents

#### Scenario: Host inbound signal fails closed after pause, revocation, termination, or expiration
- **WHEN** a host runtime has previously emitted an active visible `screen:view` state
- **AND** the local workflow then pauses, removes `screen:view`, terminates, or expires that authorization
- **THEN** later inbound `signal` messages MUST be ignored before local `received` event emission and received signal summary logging

#### Scenario: Host restart clears inbound signal authorization
- **WHEN** a host runtime object is stopped and started again after previously emitting active visible `screen:view` authorization
- **THEN** the restarted runtime MUST NOT treat the prior connection's authorization as active for inbound `signal` messages
- **AND** inbound `signal` messages MUST be ignored until the restarted runtime emits a new active visible `screen:view` state

#### Scenario: Ignored host inbound signal diagnostics are secret-safe
- **WHEN** the host runtime ignores an inbound `signal` because authorization is missing, inactive, invisible, expired, or no longer grants `screen:view`
- **THEN** local events and logs expose only redacted summary metadata such as byte length
- **AND** they MUST NOT expose raw protocol payloads, session ids, peer ids, signal payloads, signal payload keys, tokens, pairing codes, private reasons, keystrokes, screenshots, screen contents, or input contents

### Requirement: Host signal send authorization gate
The agent shell SHALL block host-originated public runtime `signal` sends before socket write and before local `sent` event emission unless the host runtime has locally emitted an active, visible, unexpired authorization state that grants `screen:view`.

#### Scenario: Host signal is blocked before authorization
- **WHEN** a host runtime is connected and caller code invokes public `send()` with a `signal` message before the host has emitted active visible `screen:view` authorization
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked signal

#### Scenario: Host signal is allowed after active visible grant
- **WHEN** a host runtime has emitted an active `session-authorization-state` with `visibleToHost: true`, unexpired `expiresAt`, and `screen:view`
- **THEN** a host-originated public runtime `signal` message MAY be sent through the runtime send path
- **AND** the local `sent` event MUST continue to redact the signal payload contents

#### Scenario: Host signal fails closed after pause, revocation, termination, or expiration
- **WHEN** a host runtime has previously emitted an active visible `screen:view` state
- **AND** the local workflow then pauses, removes `screen:view`, terminates, or expires that authorization
- **THEN** later host-originated public runtime `signal` sends MUST be rejected before socket write and local `sent` event emission

#### Scenario: Host signal lifecycle callbacks observe updated authorization
- **WHEN** host workflow emits a local `sent` event for active authorization state, pause, permission revocation, termination, or expiration
- **THEN** synchronous caller code running inside that local event callback MUST observe the updated authorization state for host-originated public runtime `signal` send checks
- **AND** it MUST NOT be able to send `signal` using stale authorization after pause, permission revocation, termination, or expiration

#### Scenario: Host restart clears signal send authorization
- **WHEN** a host runtime object is stopped and started again after previously emitting active visible `screen:view` authorization
- **THEN** the restarted runtime MUST NOT treat the prior connection's authorization as active for host-originated public runtime `signal` sends
- **AND** host-originated public runtime `signal` sends MUST be rejected until the restarted runtime emits a new active visible `screen:view` state

#### Scenario: Blocked host signal diagnostics are secret-safe
- **WHEN** the runtime blocks a host-originated public runtime `signal` because authorization is missing, inactive, invisible, expired, or no longer grants `screen:view`
- **THEN** thrown errors, runtime events, and logs MUST NOT expose raw signal payloads, signal payload keys, tokens, pairing codes, authorization reasons, keystrokes, screenshots, screen contents, or input contents

### Requirement: Public workflow-authority send gate
The agent shell SHALL reject public managed runtime `send()` calls for workflow-authority protocol messages before socket write and before local `sent` event emission. Workflow-authority protocol messages include `host-consent-decision`, `session-authorization-decision`, `session-authorization-state`, `permission-revoked`, `session-control`, and `audit-event`.

#### Scenario: Public legacy host consent decision send is blocked
- **WHEN** caller code invokes public runtime `send()` with a legacy `host-consent-decision`
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked legacy decision

#### Scenario: Public authorization decision send is blocked
- **WHEN** caller code invokes public runtime `send()` with a `session-authorization-decision`
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked decision

#### Scenario: Public authorization lifecycle send is blocked
- **WHEN** caller code invokes public runtime `send()` with `session-authorization-state`, `permission-revoked`, or `session-control`
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked lifecycle message

#### Scenario: Public workflow audit send is blocked
- **WHEN** caller code invokes public runtime `send()` with an `audit-event`
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked audit event

#### Scenario: Public legacy host consent request remains a request
- **WHEN** caller code invokes public runtime `send()` with a legacy `host-consent-required`
- **THEN** the workflow-authority gate MUST NOT treat that request as a grant or decision
- **AND** that request MUST NOT approve authorization, activate visibility, grant permissions, start capture, send input, reconnect a peer, suppress host visibility, or bypass consent workflows

#### Scenario: Internal explicit workflow sends still work
- **WHEN** the host workflow has explicit host decision configuration and visible activation, revocation, pause, resume, termination, or expiration configuration
- **THEN** the internal workflow MAY emit matching authorization, lifecycle, and development audit-event messages through its internal send path
- **AND** those internal sends MUST still preserve existing consent, visibility, revocation, timeout, peer-disconnect, and audit safety gates

#### Scenario: Blocked workflow-authority diagnostics are secret-safe
- **WHEN** the runtime blocks a public workflow-authority send
- **THEN** thrown errors, runtime events, and logs MUST NOT expose raw protocol payloads, payload keys, tokens, pairing codes, authorization reasons, audit-event details, keystrokes, screenshots, screen contents, or input contents

### Requirement: Runtime event reasons are secret-safe
The agent shell SHALL emit local `sent` and `received` runtime events without exposing raw protocol `reason` text from authorization, permission, lifecycle, control, or other reason-bearing protocol messages.

#### Scenario: Sent protocol reason is redacted
- **WHEN** the managed runtime sends a protocol message with a `reason` field
- **THEN** the local `sent` runtime event MUST preserve the message type and consent workflow metadata but MUST NOT expose the raw reason text

#### Scenario: Received protocol reason is redacted
- **WHEN** the managed runtime receives a valid protocol message with a `reason` field
- **THEN** the local `received` runtime event MUST preserve the message type and consent workflow metadata but MUST NOT expose the raw reason text

#### Scenario: Wire behavior is unchanged
- **WHEN** the managed runtime sends or handles reason-bearing protocol messages
- **THEN** reason redaction MUST apply only to the local runtime event view and MUST NOT change protocol validation, socket send behavior, relay forwarding, or internal workflow handling

### Requirement: Inbound workflow self-authority boundary
The agent shell SHALL ignore decoded inbound legacy consent decisions, authorization lifecycle messages, and audit workflow messages that identify the local runtime peer as the authority actor before emitting local `received` protocol events or received workflow summary logs.

#### Scenario: Self-origin legacy host consent decision is ignored
- **WHEN** a host shell receives a decoded legacy `host-consent-decision` whose `hostPeerId` equals the local host peer id
- **THEN** the shell MUST NOT emit a local `received` protocol event for that ignored message
- **AND** the shell MUST NOT log a received workflow summary for that ignored message

#### Scenario: Self-origin authorization decision is ignored
- **WHEN** a host shell receives a decoded `session-authorization-decision` whose `hostPeerId` equals the local host peer id
- **THEN** the shell MUST NOT emit a local `received` protocol event for that ignored message
- **AND** the shell MUST NOT log a received workflow summary for that ignored message

#### Scenario: Self-origin actor workflow messages are ignored
- **WHEN** a host shell receives a decoded `session-authorization-state`, `session-control`, `permission-revoked`, or `audit-event` whose `actorPeerId` equals the local host peer id
- **THEN** the shell MUST NOT emit a local `received` protocol event for that ignored message
- **AND** the shell MUST NOT log a received workflow summary for that ignored message

#### Scenario: Ignored self-authority input remains secret-safe
- **WHEN** the shell ignores a decoded inbound workflow authority message because of local peer authority metadata
- **THEN** local events and logs expose only redacted summary metadata such as byte length
- **AND** they MUST NOT expose raw protocol payloads, session ids, peer ids, authorization ids, audit ids, workflow actions, tokens, pairing codes, private reasons, signal payloads, keystrokes, screenshots, screen contents, or input contents

### Requirement: Inbound session boundary
The agent shell SHALL ignore decoded inbound protocol messages whose `sessionId` does not match the local runtime session before emitting local `received` protocol events or running consent workflow handling.

#### Scenario: Cross-session authorization request is ignored
- **WHEN** a host shell receives a decoded `session-authorization-request` for a different session id
- **THEN** the shell MUST NOT send a host authorization decision, authorization state update, or workflow audit-event for that request
- **AND** the shell MUST NOT emit a local `received` protocol event for that cross-session request

#### Scenario: Cross-session input remains secret-safe
- **WHEN** the shell ignores a decoded inbound protocol message for a different session id
- **THEN** local events and logs expose only redacted summary metadata such as byte length
- **AND** they MUST NOT expose raw protocol payloads, session ids, tokens, pairing codes, private reasons, signal payloads, keystrokes, screenshots, screen contents, or input contents

### Requirement: Inbound self-authority boundary
The agent shell SHALL ignore decoded inbound authorization requests that identify the local peer as the remote viewer before emitting local `received` protocol events or running consent workflow handling.

#### Scenario: Self-referential authorization request is ignored
- **WHEN** a host shell receives a decoded `session-authorization-request` whose `viewerPeerId` equals the local host peer id
- **THEN** the shell MUST NOT send a host authorization decision, authorization state update, or workflow audit-event for that request
- **AND** the shell MUST NOT emit a local `received` protocol event for that ignored request

#### Scenario: Ignored self-authority input remains secret-safe
- **WHEN** the shell ignores a decoded authorization request that identifies the local peer as the requester
- **THEN** local events and logs expose only redacted summary metadata such as byte length
- **AND** they MUST NOT expose raw protocol payloads, peer ids, tokens, pairing codes, private reasons, signal payloads, keystrokes, screenshots, screen contents, or input contents

### Requirement: Received signal runtime events are secret-safe
The agent shell SHALL emit local `received` runtime events for `signal` messages without exposing raw signal payload contents, tokens, pairing codes, credentials, parser details, protocol payload fragments, keystrokes, screenshots, screen contents, or input contents.

#### Scenario: Received signal payload is redacted
- **WHEN** the managed runtime receives a valid `signal` protocol message
- **THEN** the local `received` runtime event MUST identify the signal message and peer routing metadata but MUST NOT expose the raw signal payload contents

#### Scenario: Received signal event keeps safe diagnostics
- **WHEN** the managed runtime emits a local `received` event for a `signal` message
- **THEN** the event MAY expose secret-safe metadata such as original payload byte length

### Requirement: Canonical signal event byte-length metadata
The agent shell SHALL calculate redacted sent and received `signal` runtime event byte-length metadata using the shared canonical JSON byte length, and inherited `toJSON` hooks or prototype pollution MUST NOT alter that metadata.

#### Scenario: Sent signal byte length ignores inherited toJSON hooks
- **WHEN** the managed runtime emits a local `sent` event for a valid `signal` while an inherited `toJSON` hook is present
- **THEN** the event payload remains redacted
- **AND** the event byte length equals the canonical JSON byte length of the signal payload
- **AND** the event MUST NOT expose raw signal payload contents or fields injected by inherited `toJSON` hooks

#### Scenario: Received signal byte length ignores inherited toJSON hooks
- **WHEN** the managed runtime emits a local `received` event for a valid `signal` while an inherited `toJSON` hook is present
- **THEN** the event payload remains redacted
- **AND** the event byte length equals the canonical JSON byte length of the signal payload
- **AND** the event MUST NOT expose raw signal payload contents or fields injected by inherited `toJSON` hooks

### Requirement: Inbound signal peer boundary
The agent shell SHALL ignore decoded inbound `signal` messages that are not addressed to the local runtime peer or that identify the local runtime peer as the sender before emitting local `received` protocol events or received signal summary logs.

#### Scenario: Signal for another peer is ignored
- **WHEN** a host shell receives a decoded `signal` whose `toPeerId` does not equal the local host peer id
- **THEN** the shell MUST NOT emit a local `received` protocol event for that ignored message
- **AND** the shell MUST NOT log a received signal summary for that ignored message

#### Scenario: Self-origin signal is ignored
- **WHEN** a host shell receives a decoded `signal` whose `fromPeerId` equals the local host peer id
- **THEN** the shell MUST NOT emit a local `received` protocol event for that ignored message
- **AND** the shell MUST NOT log a received signal summary for that ignored message

#### Scenario: Ignored signal input remains secret-safe
- **WHEN** the shell ignores a decoded inbound `signal` because of peer routing metadata
- **THEN** local events and logs expose only redacted summary metadata such as byte length
- **AND** they MUST NOT expose raw protocol payloads, session ids, peer ids, signal payloads, signal payload keys, tokens, pairing codes, private reasons, keystrokes, screenshots, screen contents, or input contents

### Requirement: Raw runtime events are secret-safe
The agent shell SHALL emit local `raw` runtime events without exposing raw non-protocol inbound text, parser details, tokens, pairing codes, credentials, keystrokes, screenshots, screen contents, or input contents.

#### Scenario: Non-protocol inbound text is redacted
- **WHEN** the managed runtime receives inbound text that cannot be decoded as a protocol envelope
- **THEN** the local `raw` runtime event MUST expose only secret-safe metadata such as byte length and MUST NOT expose the original text

#### Scenario: Relay parser details are not exposed
- **WHEN** the managed runtime receives a relay rejection or other malformed inbound text that includes parser details or raw payload fragments
- **THEN** the local `raw` runtime event MUST NOT expose those details or fragments

### Requirement: Canonical raw inbound byte metadata
The agent shell SHALL calculate non-protocol and ignored unsafe inbound message `byteLength` metadata from the actual WebSocket payload bytes before text conversion, while continuing to redact raw payload contents from local events and logs.

#### Scenario: Binary non-protocol byte length is accurate
- **WHEN** the managed runtime receives a binary or invalid UTF-8 WebSocket message that cannot be decoded as a protocol envelope
- **THEN** the local `raw` event `byteLength` equals the original WebSocket payload byte length
- **AND** the local log includes that byte length only as summary metadata
- **AND** neither the event nor the log exposes the raw payload contents

#### Scenario: Ignored unsafe inbound byte metadata does not grant access
- **WHEN** the managed runtime emits byte metadata for an ignored unsafe inbound message
- **THEN** that metadata MUST NOT approve authorization, activate a visible session, grant permissions, start capture, send input, reconnect the peer, suppress host visibility, or bypass consent workflows

### Requirement: Closed runtime events are secret-safe
The agent shell SHALL emit local `closed` runtime events without exposing raw WebSocket close reasons, tokens, pairing codes, credentials, parser details, protocol payload fragments, keystrokes, screenshots, screen contents, or input contents.

#### Scenario: WebSocket close reason is redacted
- **WHEN** the managed runtime receives a WebSocket close frame with a reason
- **THEN** the local `closed` runtime event MUST expose only secret-safe metadata such as close code and reason byte length and MUST NOT expose the raw reason text

#### Scenario: Disconnect log remains summary-only
- **WHEN** the managed runtime logs a WebSocket disconnect
- **THEN** the log MUST include only summary metadata and MUST NOT include the raw close reason text

### Requirement: Canonical close reason byte metadata
The agent shell SHALL calculate redacted WebSocket close event and disconnect log `reasonBytes` metadata as the actual UTF-8 byte length of the close reason, while continuing to redact the raw close reason text.

#### Scenario: Multi-byte close reason metadata is accurate
- **WHEN** the managed runtime receives a WebSocket close reason containing multi-byte text
- **THEN** the local `closed` event `reasonBytes` equals the UTF-8 byte length of the close reason
- **AND** the local disconnect log includes that byte length only as summary metadata
- **AND** neither the event nor the log exposes the raw close reason text

#### Scenario: Close reason metadata does not grant access
- **WHEN** the managed runtime emits close reason byte metadata
- **THEN** that metadata MUST NOT approve authorization, activate a visible session, grant permissions, start capture, send input, reconnect the peer, suppress host visibility, or bypass consent workflows

### Requirement: Public sends fail closed after local socket close
The managed agent shell SHALL record local peer disconnected state when its WebSocket close event fires. After that close state is recorded and until a fresh runtime `start()` resets connection-scoped state, public `send()` calls MUST fail before protocol validation, socket write, and local `sent` event emission. This failure MUST NOT grant permissions, activate visibility, start capture, send input, reconnect a peer, suppress host visibility, or bypass consent workflows.

#### Scenario: Public send after socket close is blocked first
- **WHEN** a runtime has emitted a local `closed` event after WebSocket close
- **AND** caller code invokes public `send()` with a peer message that contains private protocol payload markers
- **THEN** the runtime rejects the send with a bounded local-disconnect error before socket write
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked message

#### Scenario: Socket-close send diagnostics are secret-safe
- **WHEN** the runtime blocks a public send because the local socket has closed
- **THEN** thrown errors, runtime events, and logs MUST NOT expose raw protocol payloads, signal payloads, message types, session ids, peer ids, tokens, pairing codes, private reasons, keystrokes, screenshots, screen contents, or input contents

#### Scenario: Runtime restart clears local socket close state
- **WHEN** a runtime object is started again after a previous local socket close
- **THEN** the restarted connection MUST NOT inherit the previous local disconnected state
- **AND** public sends remain subject to the normal recipient, authority, authorization, and socket-open gates for the new connection

### Requirement: Runtime error diagnostics are secret-safe

The agent shell SHALL surface runtime, startup, and socket failures without exposing raw exception messages, raw diagnostic logger error text, tokens, pairing codes, credentials, protocol payload fragments, private reason text, file paths, keystrokes, screenshots, screen contents, or input contents in local runtime events or logs. Runtime, startup, and socket diagnostic logger failures MUST be best-effort observability failures only and MUST NOT grant permissions, activate host visibility, start capture, send input, reconnect peers, send protocol messages other than the normal startup join message that would have been sent without the logger failure, hide the session from the host, or bypass consent workflows. Startup informational capability logs SHALL use static metadata-only wording that does not claim the development MVP viewer surface or explicit host input path are unavailable after those features are configured elsewhere in the runtime.

#### Scenario: Startup capability log describes the development MVP path

- **WHEN** the agent shell WebSocket opens during runtime startup
- **THEN** the startup informational logs include static bounded wording for the development MVP viewer surface and explicit host input path
- **AND** those logs MUST NOT include relay tokens, pairing codes, credentials, protocol payload fragments, local file paths, screen contents, input contents, or full secrets

### Requirement: Agent shell CLI unexpected errors are secret-safe
The agent shell CLI SHALL report unexpected startup and shutdown failures without exposing raw exception messages, stack traces, local file paths, relay tokens, pairing codes, credentials, protocol payload fragments, private workflow reason text, keystrokes, screenshots, screen contents, or input contents.

#### Scenario: Unexpected startup failure output is metadata-only
- **WHEN** the agent shell CLI reports an unexpected startup failure
- **THEN** stderr output MUST include a generic agent-shell error diagnostic with summary metadata such as raw message byte length
- **AND** stderr output MUST NOT include the raw exception message or stack trace

#### Scenario: Unexpected shutdown failure output is metadata-only
- **WHEN** the agent shell CLI reports an unexpected shutdown failure
- **THEN** stderr output MUST include a generic agent-shell error diagnostic with summary metadata such as raw message byte length
- **AND** stderr output MUST NOT include the raw exception message or stack trace

#### Scenario: Usage errors remain bounded
- **WHEN** the agent shell CLI rejects malformed arguments with a usage error
- **THEN** stderr output MAY include the static usage text
- **AND** stderr output MUST NOT include raw user-provided argument values

### Requirement: Agent shell CLI argument validation
The agent shell SHALL reject malformed, unknown, or ambiguous CLI arguments before starting the runtime, including duplicate requested permissions and requested permission entries that are not exact canonical permission tokens. Relay URLs MUST NOT contain embedded credentials/userinfo, canonical `token` query parameters, or case-variant `token` query parameters, and relay shared-token values MUST be supplied through `--token` rather than embedded in `--relay` URLs. CLI session, peer, and device identifier values MUST NOT contain secret-bearing protocol identifier metadata including token, credential, password, passphrase, secret, pairing code, API key, access key, cookie, private key, SSH key, authorization, authorization header, auth header, or proxy authorization marker families. CLI display name values MUST be non-blank, already trimmed, 120 characters or less, contain no ASCII control characters, and contain no Unicode bidirectional or zero-width formatting controls. CLI token values MUST be non-blank, already trimmed, 1024 UTF-8 bytes or less, contain no ASCII control characters, contain no Unicode bidirectional formatting controls, and contain no zero-width formatting controls including `U+FEFF`. CLI and environment audit log path values MUST be non-blank, already trimmed, 1024 UTF-8 bytes or less, contain no ASCII control characters, contain no Unicode bidirectional formatting controls, contain no zero-width formatting controls, contain no Windows reserved device path segments, contain no Windows alternate data stream path segments except an initial Windows drive prefix segment such as `C:`, and not start with Windows device namespace prefixes such as `\\.\`, `\\?\`, `//./`, or `//?/`. CLI workflow reason values MUST be non-blank, already trimmed, 240 characters or less, contain no ASCII control characters, and contain no Unicode bidirectional or zero-width formatting controls including `U+FEFF`. Authorization TTL validation SHALL require `--authorization-ttl-ms` values to be positive integers from `1` through the safe timer delay bound. Host consent timeout validation SHALL require `--host-consent-timeout-ms` values to be exact positive integers from `1` through the safe timer delay bound and only allow them with `--host-consent-prompt true`. Lifecycle workflow timer validation SHALL allow `--revoke-after-ms`, `--pause-after-ms`, `--resume-after-ms`, `--terminate-after-ms`, and `--disconnect-after-ms` values from `0` through the safe timer delay bound.

#### Scenario: Malformed host consent timeout option is rejected
- **WHEN** the agent shell is started with a zero, fractional, negative, non-finite, timer-unsafe, or prompt-disabled `--host-consent-timeout-ms` value
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Unknown CLI option is rejected
- **WHEN** the agent shell is started with an option name that is not part of the documented CLI
- **THEN** it exits through bounded usage handling before connecting to the relay

#### Scenario: Invalid relay URL option is rejected
- **WHEN** the agent shell is started with a malformed, relative, or non-WebSocket `--relay` URL
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Relay URL credentials are rejected
- **WHEN** the agent shell is started with a `--relay` value containing username or password/userinfo credentials
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Relay URL token query is rejected
- **WHEN** the agent shell is started with a `--relay` value containing a canonical `token` query parameter or a case-variant `token` query parameter such as `Token` or `TOKEN`
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Visible session value is explicit
- **WHEN** the agent shell is started with `--visible-session`
- **THEN** the value MUST be either `true` or `false`

#### Scenario: Invalid permission option is rejected
- **WHEN** the agent shell is started with an invalid requested or revocation permission value
- **THEN** it exits through bounded usage handling before sending any protocol message

#### Scenario: Whitespace-padded requested permission is rejected
- **WHEN** the agent shell is started with `--request` containing a requested permission entry with leading or trailing whitespace
- **THEN** it exits through bounded usage handling before connecting to the relay or sending a session authorization request

#### Scenario: Duplicate requested permission is rejected
- **WHEN** the agent shell is started with the same requested permission more than once
- **THEN** it exits through bounded usage handling before connecting to the relay or sending a session authorization request

#### Scenario: Invalid identifier option is rejected
- **WHEN** the agent shell is started with a malformed `--session`, `--peer`, or `--device` identifier
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Secret-bearing session or peer identifier option is rejected
- **WHEN** the agent shell is started with a syntactically valid `--session` or `--peer` value that contains secret-bearing protocol identifier metadata
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message
- **AND** usage handling MUST NOT expose the raw session id or peer id

#### Scenario: Secret-bearing device id option is rejected
- **WHEN** the agent shell is started with a syntactically valid `--device` value that contains secret-bearing protocol identifier metadata
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message
- **AND** usage handling MUST NOT expose the raw device id

#### Scenario: Invalid display name option is rejected
- **WHEN** the agent shell is started with an empty, whitespace-only, untrimmed, control-character, Unicode bidirectional formatting control, zero-width formatting control including `U+FEFF`, or oversized `--name` value
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Malformed token option is rejected
- **WHEN** the agent shell is started with an empty, whitespace-only, untrimmed, control-character, Unicode bidirectional formatting control, zero-width formatting control including `U+FEFF`, or oversized `--token` value
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Zero authorization TTL option is rejected
- **WHEN** the agent shell is started with `--authorization-ttl-ms 0`
- **THEN** it exits through bounded usage handling before connecting to the relay, sending any protocol message, or scheduling workflow timers

#### Scenario: Oversized workflow timer option is rejected
- **WHEN** the agent shell is started with `--authorization-ttl-ms`, `--revoke-after-ms`, `--pause-after-ms`, `--resume-after-ms`, `--terminate-after-ms`, or `--disconnect-after-ms` above the safe timer delay bound
- **THEN** it exits through bounded usage handling before connecting to the relay or scheduling workflow timers

#### Scenario: Zero lifecycle simulation delay remains valid
- **WHEN** the agent shell is started with `--revoke-after-ms 0`, `--pause-after-ms 0`, `--resume-after-ms 0`, `--terminate-after-ms 0`, or `--disconnect-after-ms 0`
- **THEN** it constructs matching bounded runtime lifecycle delay options without weakening the authorization TTL requirement

#### Scenario: Invalid lifecycle reason option is rejected
- **WHEN** the agent shell is started with a blank, untrimmed, oversized, ASCII control-character, or Unicode bidirectional or zero-width formatting-control lifecycle reason option including `U+FEFF`
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Control-character CLI workflow reason is rejected
- **WHEN** the agent shell is started with a workflow reason option containing an ASCII control character
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Format-control CLI workflow reason is rejected
- **WHEN** the agent shell is started with a workflow reason option containing a Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Blank audit log path option is rejected
- **WHEN** the agent shell is started with an empty or whitespace-only `--audit-log` value
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Untrimmed audit log path option is rejected
- **WHEN** the agent shell is started with a `--audit-log` value containing leading or trailing whitespace
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Control-character audit log path option is rejected
- **WHEN** the agent shell is started with a `--audit-log` value containing an ASCII control character or `WINBRIDGE_AGENT_AUDIT_LOG_PATH` contains an ASCII control character
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message
- **AND** stderr output MUST NOT include the raw configured path value

#### Scenario: Format-control audit log path option is rejected
- **WHEN** the agent shell is started with a `--audit-log` value containing a Unicode bidirectional or zero-width formatting control or `WINBRIDGE_AGENT_AUDIT_LOG_PATH` contains a Unicode bidirectional or zero-width formatting control
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message
- **AND** stderr output MUST NOT include the raw configured path value

#### Scenario: Oversized audit log path option is rejected
- **WHEN** the agent shell is started with a `--audit-log` value whose UTF-8 byte length exceeds 1024 bytes or `WINBRIDGE_AGENT_AUDIT_LOG_PATH` exceeds 1024 UTF-8 bytes
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message
- **AND** stderr output MUST NOT include the raw configured path value

#### Scenario: Windows reserved device audit log path option is rejected
- **WHEN** the agent shell is started with `--audit-log` targeting a Windows reserved device path segment or `WINBRIDGE_AGENT_AUDIT_LOG_PATH` targets a Windows reserved device path segment
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message
- **AND** stderr output MUST NOT include the raw configured path value

#### Scenario: Windows alternate data stream audit log path option is rejected
- **WHEN** the agent shell is started with `--audit-log` targeting a Windows alternate data stream path segment or `WINBRIDGE_AGENT_AUDIT_LOG_PATH` targets a Windows alternate data stream path segment
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message
- **AND** stderr output MUST NOT include the raw configured path value

#### Scenario: Windows device namespace audit log path option is rejected
- **WHEN** the agent shell is started with `--audit-log` using a Windows device namespace prefix or `WINBRIDGE_AGENT_AUDIT_LOG_PATH` uses a Windows device namespace prefix
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message
- **AND** stderr output MUST NOT include the raw configured path value

#### Scenario: Windows drive audit log path option remains valid
- **WHEN** the agent shell is started with `--audit-log C:\logs\agent-audit.jsonl` or `WINBRIDGE_AGENT_AUDIT_LOG_PATH=D:/logs/agent-audit.jsonl`
- **THEN** it constructs the matching audit log path option when all other CLI requirements pass

#### Scenario: Valid omitted options keep safe defaults
- **WHEN** the agent shell is started with only a valid role
- **THEN** omitted consent-sensitive options keep fail-closed defaults such as no requested permissions, no host decision, and no visible session

#### Scenario: CLI parses disconnect simulation delay
- **WHEN** the agent shell is started with a valid `--disconnect-after-ms` value
- **THEN** it constructs a matching bounded runtime disconnect delay option

### Requirement: Canonical agent-shell workflow reasons
The agent shell SHALL reject CLI and direct runtime workflow reason options when they are blank, oversized, not already trimmed, contain ASCII control characters, or contain Unicode bidirectional or zero-width formatting controls including `U+FEFF`. Rejection MUST occur before relay connection, socket write, local trusted `sent` event emission, or host workflow simulation, and MUST NOT weaken consent, visibility, authorization, redaction, or fail-closed gates.

#### Scenario: CLI workflow reason is untrimmed
- **WHEN** the agent-shell CLI is started with `--revoke-reason`, `--pause-reason`, `--resume-reason`, or `--terminate-reason` containing leading or trailing whitespace
- **THEN** argument parsing MUST fail before the runtime starts or connects to a relay

#### Scenario: CLI workflow reason contains ASCII control characters
- **WHEN** the agent-shell CLI is started with `--revoke-reason`, `--pause-reason`, `--resume-reason`, or `--terminate-reason` containing an ASCII control character
- **THEN** argument parsing MUST fail before the runtime starts or connects to a relay

#### Scenario: CLI workflow reason contains Unicode formatting controls
- **WHEN** the agent-shell CLI is started with `--revoke-reason`, `--pause-reason`, `--resume-reason`, or `--terminate-reason` containing a Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** argument parsing MUST fail before the runtime starts or connects to a relay

#### Scenario: Direct runtime workflow reason is untrimmed
- **WHEN** direct managed runtime options include a workflow reason with leading or trailing whitespace
- **THEN** the runtime MUST reject the options before opening a relay connection or sending any workflow message

#### Scenario: Direct runtime workflow reason contains ASCII control characters
- **WHEN** direct managed runtime options include a workflow reason with an ASCII control character
- **THEN** the runtime MUST reject the options before opening a relay connection or sending any workflow message

#### Scenario: Direct runtime workflow reason contains Unicode formatting controls
- **WHEN** direct managed runtime options include a workflow reason with a Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** the runtime MUST reject the options before opening a relay connection or sending any workflow message

#### Scenario: Agent-shell reason rejection is secret-safe
- **WHEN** agent-shell workflow reason validation rejects malformed input
- **THEN** thrown errors, usage output, runtime events, and logs MUST NOT expose raw private reason text, tokens, pairing codes, protocol payloads, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, or input contents

### Requirement: Viewer authorization request
The viewer shell SHALL send a session authorization request only when requested permissions are explicitly configured and the relay has indicated a paired two-peer room.

#### Scenario: Viewer requests screen view
- **WHEN** the viewer shell is started with requested `screen:view` permission
- **AND** the relay indicates a two-peer room
- **THEN** it sends a `session-authorization-request` message after joining the relay

#### Scenario: Viewer request waits for paired room
- **WHEN** the viewer shell has requested permissions configured
- **AND** the relay returns `relay-ready` with room size 1
- **THEN** it MUST NOT send a `session-authorization-request`
- **AND** it MUST NOT approve authorization, activate a visible session, grant permissions, start capture, send input, reconnect a peer, suppress host visibility, or bypass consent workflows

### Requirement: Host authorization request peer binding
The agent shell SHALL ignore decoded inbound `session-authorization-request` messages on a host runtime unless the request `viewerPeerId` matches an accepted opposite-role viewer peer observed through inbound `hello`, before emitting local `received` protocol events or running host authorization workflow handling.

#### Scenario: Unbound host authorization request is ignored
- **WHEN** a host shell receives a decoded same-session `session-authorization-request`
- **AND** the host has not accepted an opposite-role viewer `hello`
- **THEN** the shell MUST NOT emit a local `received` protocol event for that ignored request
- **AND** the shell MUST NOT send authorization decisions, authorization states, or audit events because of that request

#### Scenario: Mismatched host authorization request is ignored
- **WHEN** a host shell has accepted an opposite-role viewer `hello` for viewer peer `viewer-1`
- **AND** the host receives a decoded same-session `session-authorization-request` whose `viewerPeerId` is a different viewer peer id
- **THEN** the shell MUST NOT emit a local `received` protocol event for that ignored request
- **AND** the shell MUST NOT send authorization decisions, authorization states, or audit events because of that request

#### Scenario: Bound host authorization request remains valid
- **WHEN** a host shell has accepted an opposite-role viewer `hello` for viewer peer `viewer-1`
- **AND** the host receives a decoded same-session `session-authorization-request` whose `viewerPeerId` is `viewer-1`
- **THEN** the normal explicit host-decision workflow MAY handle that request

#### Scenario: Ignored host authorization request input remains secret-safe
- **WHEN** the shell ignores a host authorization request because no matching viewer peer has been observed
- **THEN** local events and logs expose only redacted summary metadata such as byte length
- **AND** they MUST NOT expose raw protocol payloads, session ids, peer ids, permission scopes, tokens, pairing codes, private reasons, signal payloads, keystrokes, screenshots, screen contents, or input contents

### Requirement: Explicit host decision
The host shell SHALL NOT approve or deny authorization requests unless an explicit valid host decision is configured, and the managed runtime SHALL reject malformed host decision values before starting a relay connection or sending authorization decisions.

#### Scenario: Host decision omitted
- **WHEN** the host shell receives an authorization request and no host decision is configured
- **THEN** it logs the request without sending an approval or denial

#### Scenario: Host approves request
- **WHEN** the host shell receives an authorization request and is explicitly configured to approve with visible session state
- **THEN** it sends an approved decision and active visible state update

#### Scenario: Malformed runtime host decision is rejected
- **WHEN** the managed runtime is configured with a host decision outside `none`, `approve`, or `deny`
- **THEN** it fails before connecting to the relay or sending any authorization decision

### Requirement: Visible active state gate
The host shell MUST NOT emit active session state unless visible session state is explicitly configured.

#### Scenario: Host approves without visible session flag
- **WHEN** the host shell is configured to approve but visible session state is false
- **THEN** it sends no active state update

### Requirement: Host permission revoke simulation
The host shell SHALL send permission revocation messages only when delayed revocation is explicitly configured or direct local host revocation control is invoked. Host revocation control MUST be available only to host runtimes with visible active or paused unexpired authorization and a currently granted permission being revoked. Host-generated revocation MUST emit a bound `session-control` with action `revoke-permission` before the `permission-revoked` notification and follow-up authorization state.

#### Scenario: Host revokes granted permission after visible activation
- **WHEN** the host shell is explicitly configured to approve, visible session state is true, and a revoke delay and permission are configured
- **THEN** it sends an approved decision, sends active visible state, sends `session-control` with action `revoke-permission`, the active authorization id, and the configured permission after the delay, sends `permission-revoked` for the configured permission, and sends an updated authorization state without that permission

#### Scenario: Direct host revocation revokes a granted permission
- **WHEN** host runtime code invokes local revocation control for a currently granted permission after visible active authorization
- **THEN** it sends `session-control` with action `revoke-permission`, sends `permission-revoked`, sends an updated `session-authorization-state`, emits a local host indicator update, and sends a secret-safe revocation `audit-event`

#### Scenario: Direct host revocation works while paused
- **WHEN** host runtime code invokes local revocation control for a currently granted permission after visible paused authorization
- **THEN** it sends the same revocation protocol and audit sequence
- **AND** the updated authorization state remains `paused` when at least one permission remains

#### Scenario: Host revokes final granted permission
- **WHEN** the revoked permission is the only granted permission
- **THEN** the updated authorization state has status `revoked` and an empty permission list

#### Scenario: Direct host revocation requires active or paused visible authorization
- **WHEN** runtime code invokes local revocation control before visible active or paused host authorization
- **THEN** the runtime MUST reject the control before sending session-control, permission-revoked, authorization-state, or audit-event messages

#### Scenario: Direct host revocation requires a currently granted permission
- **WHEN** runtime code invokes local revocation control for a permission that is not currently granted
- **THEN** the runtime MUST reject the control before sending session-control, permission-revoked, authorization-state, or audit-event messages

#### Scenario: Direct host revocation is host-only
- **WHEN** viewer runtime code invokes local revocation control
- **THEN** the runtime MUST reject the control before sending session-control, permission-revoked, authorization-state, or audit-event messages

#### Scenario: Revoke configured without visible activation
- **WHEN** the host shell is configured to approve but visible session state is false
- **THEN** it does not send revoke `session-control`, `permission-revoked`, active, or revoked state updates

#### Scenario: Expiration suppresses delayed or direct revoke
- **WHEN** revocation is scheduled or invoked and the authorization reaches expiration first
- **THEN** the host shell sends the expired state and expiration audit, and does not send revoke `session-control`, `permission-revoked`, revoked state, or revocation audit for that expired authorization

#### Scenario: Revoke simulation safety boundary
- **WHEN** the host shell sends delayed or direct revoke messages
- **THEN** it MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, hide the session from the host, or bypass consent workflows
#### Scenario: Revoke diagnostics are secret-safe
- **WHEN** the agent shell logs received protocol or non-protocol messages during delayed or direct revoke workflow
- **THEN** logs MUST NOT expose raw protocol payloads, tokens, pairing codes, private reasons, display names, signal payloads, keystrokes, screenshots, screen contents, or input contents

### Requirement: Host workflow audit-event simulation
The host shell SHALL emit secret-safe development `audit-event` protocol messages for explicit host authorization decisions, visible activation, delayed or direct permission revocation, and delayed or direct session termination. Host authorization decision audit-event details SHALL include secret-safe `requestReasonProvided` boolean metadata that records only whether the validated viewer authorization request included a request reason.

#### Scenario: Host approval audit event
- **WHEN** the host shell approves an authorization request
- **THEN** it sends an `audit-event` with accepted outcome, secret-safe granted permission count metadata, and `requestReasonProvided` metadata

#### Scenario: Host denial audit event
- **WHEN** the host shell denies an authorization request
- **THEN** it sends an `audit-event` with denied outcome, secret-safe requested permission count metadata, host decision reason configuration metadata, and `requestReasonProvided` metadata

#### Scenario: Visible activation audit event
- **WHEN** the host shell emits active visible session state
- **THEN** it sends an `audit-event` with accepted outcome and visible host metadata

#### Scenario: Permission revoke audit event
- **WHEN** the host shell sends a delayed or direct permission revocation
- **THEN** it sends an `audit-event` with accepted outcome, revoked permission identifier, and remaining permission count

#### Scenario: Session termination audit event
- **WHEN** the host shell sends delayed or direct session termination
- **THEN** it sends an `audit-event` with accepted outcome, visible host metadata, and previously granted permission count

#### Scenario: Request reason presence audit metadata is secret-safe
- **WHEN** the host shell sends an authorization approval or denial audit-event for a request that included a viewer request reason
- **THEN** the audit-event detail includes `requestReasonProvided=true`
- **AND** the protocol audit-event, local audit record, runtime events, logs, and status output MUST NOT include the raw viewer request reason text

#### Scenario: Omitted request reason audit metadata remains explicit
- **WHEN** the host shell sends an authorization approval or denial audit-event for a request that omitted a viewer request reason
- **THEN** the audit-event detail includes `requestReasonProvided=false`
- **AND** the omitted reason metadata MUST NOT invent consent context, approve authorization, activate visibility, grant permissions, start capture, or send input

#### Scenario: Agent shell audit-event details are secret-safe
- **WHEN** the host shell sends development audit-event messages
- **THEN** audit details MUST NOT contain raw tokens, raw pairing codes, credentials, display names, signal payloads, keystrokes, screenshots, screen contents, or raw request/denial/revocation/termination reason text

### Requirement: Host session terminate simulation
The host shell SHALL send session termination messages only when delayed termination is explicitly configured or direct local host termination control is invoked. Host termination control MUST be available only to host runtimes with visible active or paused unexpired authorization. Host-generated terminate `session-control` messages MUST include the authorization id of the visible active or paused session being controlled.

#### Scenario: Host terminates after visible activation
- **WHEN** the host shell is explicitly configured to approve, visible session state is true, and a terminate delay is configured
- **THEN** it sends an approved decision, sends active visible state, sends `session-control` with action `terminate` and the active authorization id after the delay, sends `session-authorization-state` with status `terminated`, and sends a secret-safe termination `audit-event`

#### Scenario: Direct host termination terminates a visible active session
- **WHEN** host runtime code invokes local termination control after visible active authorization
- **THEN** it sends `session-control` with action `terminate`, sends `session-authorization-state` with status `terminated`, emits an inactive local host indicator, and sends a secret-safe termination `audit-event`

#### Scenario: Direct host termination works while paused
- **WHEN** host runtime code invokes local termination control after visible paused authorization
- **THEN** it sends the same termination protocol and audit sequence
- **AND** the terminal authorization state has status `terminated` and no permissions

#### Scenario: Direct host termination requires active or paused visible authorization
- **WHEN** runtime code invokes local termination control before visible active or paused host authorization
- **THEN** the runtime MUST reject the control before sending session-control, authorization-state, or audit-event messages

#### Scenario: Direct host termination is host-only
- **WHEN** viewer runtime code invokes local termination control
- **THEN** the runtime MUST reject the control before sending session-control, authorization-state, or audit-event messages

#### Scenario: Terminate configured without visible activation
- **WHEN** the host shell is configured to approve but visible session state is false
- **THEN** it does not send terminate `session-control` and does not send active or terminated state updates

#### Scenario: Termination suppresses later revoke simulation
- **WHEN** delayed or direct termination is sent before a configured permission revocation
- **THEN** the host shell does not send later revocation messages for the terminated authorization

#### Scenario: Expiration suppresses delayed or direct termination
- **WHEN** termination is scheduled or invoked and the authorization reaches expiration first
- **THEN** the host shell sends the expired state and expiration audit, and does not send terminate `session-control`, terminated state, or termination audit for that expired authorization

#### Scenario: Terminate simulation safety boundary
- **WHEN** the host shell sends delayed or direct termination messages
- **THEN** it MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, or hide the session from the host

#### Scenario: Terminate audit details are secret-safe
- **WHEN** the host shell sends a termination audit-event
- **THEN** audit details MUST NOT contain raw tokens, raw pairing codes, credentials, display names, signal payloads, keystrokes, screenshots, screen contents, or raw termination reason text

### Requirement: Host authorization expiration simulation
The host shell SHALL simulate authorization expiration only after an explicitly approved authorization has emitted active visible session state.

#### Scenario: Host authorization expires after visible activation
- **WHEN** the host shell is explicitly configured to approve, visible session state is true, and the configured authorization TTL elapses
- **THEN** it sends `session-authorization-state` with status `expired`, empty permissions, and a secret-safe expiration `audit-event`

#### Scenario: Expiration configured without visible activation
- **WHEN** the host shell is configured to approve but visible session state is false
- **THEN** it does not send active or expired state updates

#### Scenario: Terminal state suppresses expiration
- **WHEN** authorization expiration is scheduled and the authorization is revoked or terminated before the TTL elapses
- **THEN** the host shell does not send a later expired state update for the same authorization

#### Scenario: Expiration audit details are secret-safe
- **WHEN** the host shell sends an expiration audit-event
- **THEN** audit details MUST NOT contain raw tokens, raw pairing codes, credentials, display names, signal payloads, keystrokes, screenshots, screen contents, or raw protocol payloads

#### Scenario: Expiration simulation safety boundary
- **WHEN** the host shell sends expiration simulation messages
- **THEN** it MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, or hide the session from the host

### Requirement: Short-TTL authorization lifecycle coherence
The host shell SHALL generate authorization approval and active-state protocol messages with `expiresAt` later than their message `createdAt` for every valid positive authorization TTL. Expiration simulation MUST be scheduled from the authorization `expiresAt` boundary so an already-reached expiration suppresses delayed revoke, terminate, pause, and resume simulation before those controls or state updates can be sent.

#### Scenario: Short TTL approval remains protocol-valid
- **WHEN** the host shell explicitly approves a visible authorization with a very short positive TTL
- **THEN** the generated approval decision and active visible state messages remain valid grant-bearing protocol messages with `expiresAt` after `createdAt`

#### Scenario: Expiration boundary suppresses delayed revoke
- **WHEN** a positive authorization TTL reaches `expiresAt` before a configured permission revoke delay can send
- **THEN** the host shell sends the expired state and expiration audit, and does not send revoke `session-control`, `permission-revoked`, revoked state, or revocation audit for that expired authorization

#### Scenario: Expiration boundary suppresses delayed termination
- **WHEN** a positive authorization TTL reaches `expiresAt` before a configured terminate delay can send
- **THEN** the host shell sends the expired state and expiration audit, and does not send terminate `session-control`, terminated state, or termination audit for that expired authorization

#### Scenario: Expiration boundary suppresses delayed pause and resume
- **WHEN** a positive authorization TTL reaches `expiresAt` before configured pause or resume delays can send
- **THEN** the host shell sends the expired state and expiration audit, and does not send pause, resume, paused state, resumed active state, or their workflow audit events for that expired authorization

### Requirement: Host pause and resume simulation
The host shell SHALL send pause and resume messages only when delayed simulation is explicitly configured or direct local host pause/resume control is invoked. Host pause control MUST be available only to host runtimes with visible active unexpired authorization. Host resume control MUST be available only to host runtimes with visible paused unexpired authorization. Host-generated pause and resume `session-control` messages MUST include the authorization id of the visible session being controlled.

#### Scenario: Host pauses after visible activation
- **WHEN** the host shell is explicitly configured to approve, visible session state is true, and a pause delay is configured
- **THEN** it sends an approved decision, sends active visible state, sends `session-control` with action `pause` and the active authorization id after the delay, sends `session-authorization-state` with status `paused`, and sends a secret-safe pause `audit-event`

#### Scenario: Host resumes after pause
- **WHEN** the host shell has paused an authorization and a resume delay is configured
- **THEN** it sends `session-control` with action `resume` and the paused authorization id, sends `session-authorization-state` with status `active`, and sends a secret-safe resume `audit-event`

#### Scenario: Direct host pause pauses a visible active session
- **WHEN** host runtime code invokes local pause control after visible active authorization
- **THEN** it sends `session-control` with action `pause`, sends `session-authorization-state` with status `paused`, emits a paused local host indicator, and sends a secret-safe pause `audit-event`

#### Scenario: Direct host resume resumes a visible paused session
- **WHEN** host runtime code invokes local resume control after visible paused authorization
- **THEN** it sends `session-control` with action `resume`, sends `session-authorization-state` with status `active`, emits an active local host indicator, and sends a secret-safe resume `audit-event`

#### Scenario: Direct host pause requires active visible authorization
- **WHEN** runtime code invokes local pause control before visible active host authorization
- **THEN** the runtime MUST reject the control before sending session-control, authorization-state, or audit-event messages

#### Scenario: Direct host resume requires paused visible authorization
- **WHEN** runtime code invokes local resume control before visible paused host authorization
- **THEN** the runtime MUST reject the control before sending session-control, authorization-state, or audit-event messages

#### Scenario: Direct host pause and resume are host-only
- **WHEN** viewer runtime code invokes local pause or resume control
- **THEN** the runtime MUST reject the control before sending session-control, authorization-state, or audit-event messages

#### Scenario: Pause configured without visible activation
- **WHEN** the host shell is configured to approve but visible session state is false
- **THEN** it does not send pause or resume `session-control` messages and does not send paused state updates

#### Scenario: Terminal state suppresses pause and resume
- **WHEN** pause or resume is scheduled or invoked and the authorization is revoked, terminated, expired, disconnected, or otherwise no longer active or paused visible
- **THEN** the host shell does not send later pause or resume messages for the same authorization

#### Scenario: Pause and resume audit details are secret-safe
- **WHEN** the host shell sends pause or resume audit-events
- **THEN** audit details MUST NOT contain raw tokens, raw pairing codes, credentials, display names, signal payloads, keystrokes, screenshots, screen contents, or raw pause/resume reason text

#### Scenario: Pause and resume simulation safety boundary
- **WHEN** the host shell sends pause or resume simulation messages or direct pause/resume control messages
- **THEN** it MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, hide the session from the host, or bypass consent workflows

### Requirement: Host workflow audit file persistence
The host shell SHALL persist local development audit records for host-generated workflow `audit-event` messages and host-local disconnect controls when an audit sink is configured. When an audit sink is configured, the host shell MUST successfully write the matching local audit record before sending the associated host authorization decision, authorization state, permission revoke, session control, or protocol `audit-event` message for that audited workflow action. Local host disconnect audit failures MUST be surfaced through sanitized runtime diagnostics but MUST NOT prevent host indicator deactivation or local WebSocket close.

#### Scenario: Host approval audit is persisted
- **WHEN** the host shell is configured with an audit sink and explicitly approves a visible authorization request
- **THEN** it writes schema-valid audit records for approval and visible activation using the host actor, session id, action, outcome, and secret-safe detail metadata

#### Scenario: Host denial audit is persisted
- **WHEN** the host shell is configured with an audit sink and explicitly denies an authorization request
- **THEN** it writes a schema-valid denied audit record without raw denial reason text

#### Scenario: Host lifecycle audit is persisted
- **WHEN** the host shell emits delayed or direct revocation, pause, resume, termination, or expiration workflow audit-events
- **THEN** it writes matching schema-valid audit records with the same event ids, actions, outcomes, and secret-safe details

#### Scenario: Host local disconnect audit is persisted
- **WHEN** the host shell closes a visible active or paused session through local disconnect simulation or direct local disconnect control
- **THEN** it writes a schema-valid `agent-shell.session.disconnected` audit record with accepted outcome, host actor, session id, cause `local-disconnect`, visible flag, permission count, and bounded `reasonConfigured` boolean metadata

#### Scenario: Agent shell audit file details are secret-safe
- **WHEN** host workflow audit records are persisted with private host display-name, viewer display-name, lifecycle-reason, pairing-code, signal-payload, close-reason, or protocol-payload marker values present elsewhere in the workflow
- **THEN** persisted records MUST NOT include those raw values

#### Scenario: Received protocol payloads are not persisted as workflow audit
- **WHEN** the host shell receives protocol or non-protocol messages during a session
- **THEN** it does not persist those raw payloads through the host workflow audit sink

#### Scenario: Audit write failures are surfaced
- **WHEN** the configured host workflow audit sink fails to write a record
- **THEN** the host shell surfaces the failure instead of silently dropping the audit record

#### Scenario: Denial is not sent when denial audit persistence fails
- **WHEN** the host shell is configured with an audit sink, explicitly denies an authorization request, and the matching audit write fails
- **THEN** it MUST surface the sanitized runtime failure before sending the denial decision or denial audit-event

#### Scenario: Lifecycle update is not sent when lifecycle audit persistence fails
- **WHEN** the host shell is configured with an audit sink and a delayed or direct revocation, pause, resume, termination, or expiration audit write fails
- **THEN** it MUST surface the sanitized runtime failure before sending the associated permission revoke, session control, authorization state, or lifecycle audit-event message

#### Scenario: Local disconnect proceeds when disconnect audit persistence fails
- **WHEN** the host shell is configured with an audit sink and a local disconnect audit write fails
- **THEN** it MUST surface a sanitized runtime failure
- **AND** it MUST still emit an inactive local host indicator and close the local WebSocket without sending peer-originated `peer-disconnected`

### Requirement: Inbound self-disconnect boundary
The agent shell SHALL ignore decoded inbound `peer-disconnected` messages whose `peerId` equals the local runtime peer before emitting local `received` protocol events or recording remote peer disconnected state.

#### Scenario: Self-disconnect notice is ignored
- **WHEN** a host shell receives a decoded `peer-disconnected` message whose `peerId` equals the local host peer id
- **THEN** the shell MUST NOT record remote peer disconnected state because of that message
- **AND** the shell MUST NOT emit a local `received` protocol event for that ignored message

#### Scenario: Ignored self-disconnect input remains secret-safe
- **WHEN** the shell ignores a decoded `peer-disconnected` message that identifies the local peer
- **THEN** local events and logs expose only redacted summary metadata such as byte length
- **AND** they MUST NOT expose raw protocol payloads, session ids, peer ids, tokens, pairing codes, private reasons, signal payloads, keystrokes, screenshots, screen contents, or input contents

### Requirement: Peer disconnect state handling
The agent shell SHALL treat a received `peer-disconnected` message as remote peer disconnected state only when the notice identifies the already observed opposite-role peer for the current development session. After recording this trusted state, the managed runtime MUST fail closed for delayed workflow sends and direct public runtime sends to that disconnected peer. The runtime MUST ignore unbound, same-role, or mismatched `peer-disconnected` notices before local `received` protocol event emission, before recording remote peer disconnected state, and before deactivating the host indicator.

#### Scenario: Viewer receives host disconnect notice
- **WHEN** the host peer disconnects while a viewer shell remains connected through the relay after observing that host as the opposite-role peer
- **THEN** the viewer shell receives and records the `peer-disconnected` protocol message without starting capture, sending input, reconnecting, or granting permissions

#### Scenario: Host suppresses delayed workflow after viewer disconnect
- **WHEN** the host shell has delayed workflow simulation scheduled and receives `peer-disconnected` for the observed viewer
- **THEN** the host shell MUST NOT send later revoke, pause, resume, termination, expiration, authorization state, session control, permission revoke, or workflow audit-event messages for that disconnected peer

#### Scenario: Direct runtime send is blocked after peer disconnect
- **WHEN** the agent shell records remote peer disconnected state for the observed opposite-role peer
- **AND** caller code invokes the public managed runtime `send()` method
- **THEN** the send MUST fail before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked message

#### Scenario: Unbound disconnect notice is ignored
- **WHEN** an agent shell receives a decoded `peer-disconnected` notice before it has observed an opposite-role peer identity
- **THEN** the shell MUST ignore the notice before local `received` protocol event emission
- **AND** the notice MUST NOT record remote peer disconnected state, suppress delayed host workflow, deactivate the host indicator, approve authorization, grant permissions, start capture, send input, reconnect a peer, suppress host visibility, or bypass consent workflows

#### Scenario: Mismatched disconnect notice is ignored
- **WHEN** an agent shell has observed one opposite-role peer and later receives a decoded `peer-disconnected` notice for a different peer id or role
- **THEN** the shell MUST ignore the notice before local `received` protocol event emission
- **AND** the mismatched notice MUST NOT record remote peer disconnected state, suppress delayed host workflow, deactivate the host indicator, approve authorization, grant permissions, start capture, send input, reconnect a peer, suppress host visibility, or bypass consent workflows

#### Scenario: Disconnect summary logging is secret-safe
- **WHEN** the agent shell logs a received trusted peer disconnect notice
- **THEN** the log MAY include peer id, peer role, message id, and bounded reason code, and MUST NOT include raw tokens, raw pairing codes, credentials, raw protocol payloads, keystrokes, screenshots, screen contents, or full secrets

#### Scenario: Ignored disconnect diagnostics are secret-safe
- **WHEN** the shell ignores an unbound, same-role, self, or mismatched decoded `peer-disconnected` notice
- **THEN** local events and logs expose only redacted summary metadata such as byte length
- **AND** they MUST NOT expose raw protocol payloads, session ids, peer ids, roles, tokens, pairing codes, private reasons, signal payloads, keystrokes, screenshots, screen contents, or input contents

#### Scenario: Disconnect state is not authorization
- **WHEN** the agent shell records trusted remote peer disconnect state
- **THEN** the state MUST NOT approve authorization, activate a visible session, grant permissions, start capture, send input, reconnect the peer, suppress host visibility, or bypass consent workflows

### Requirement: Host disconnect simulation
The host shell SHALL close its local relay connection after visible activation only when disconnect simulation is explicitly configured or direct local disconnect control is invoked. Local host disconnect control MUST be available only to host runtimes with visible active or paused authorization. Local host disconnect MUST deactivate the local host indicator, close the local WebSocket, and MUST NOT send peer-originated `peer-disconnected` protocol messages; disconnect notices remain relay-originated.

#### Scenario: Host disconnects after visible activation
- **WHEN** the host shell is explicitly configured to approve, visible session state is true, and a disconnect delay is configured
- **THEN** it sends an approved decision, sends active visible state, closes the host WebSocket after the delay, and the viewer receives a relay-originated `peer-disconnected` notice

#### Scenario: Direct host disconnect closes a visible session
- **WHEN** host runtime code invokes local disconnect control after visible active or paused authorization
- **THEN** it emits an inactive local host indicator, closes the host WebSocket, and the viewer receives a relay-originated `peer-disconnected` notice

#### Scenario: Direct host disconnect requires visible activation
- **WHEN** runtime code invokes local disconnect control before visible active or paused host authorization
- **THEN** the runtime MUST reject the control before closing the WebSocket or emitting disconnect audit

#### Scenario: Direct host disconnect is host-only
- **WHEN** viewer runtime code invokes local disconnect control
- **THEN** the runtime MUST reject the control before closing the WebSocket or emitting disconnect audit

#### Scenario: Disconnect configured without visible activation
- **WHEN** the host shell is configured to approve but visible session state is false
- **THEN** it does not close the host WebSocket because of disconnect simulation

#### Scenario: Disconnect suppresses later host workflow
- **WHEN** disconnect simulation or direct local disconnect control fires before delayed revoke, pause, resume, termination, or expiration simulation
- **THEN** the host shell MUST NOT send later authorization state, session control, permission revoke, or workflow audit-event messages for that disconnected connection

#### Scenario: Disconnect simulation safety boundary
- **WHEN** the host shell runs disconnect simulation or direct local disconnect control
- **THEN** it MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, hide the session, send forged disconnect notices, or bypass consent workflows

### Requirement: Revoke control confirmation handling
The viewer runtime SHALL accept same-authority `permission-revoked` confirmation messages for the same authorization after a bound revoke-permission `session-control` has already removed the permission locally. This confirmation MUST NOT restore permissions or authorize sensitive actions.

#### Scenario: Viewer accepts revoke notification after revoke control
- **WHEN** a viewer runtime has active visible authorization for `screen:view`
- **AND** it receives a bound revoke-permission `session-control` for `screen:view`
- **AND** it later receives `permission-revoked` from the same host authority for the same authorization id and permission
- **THEN** the viewer runtime MAY emit the received `permission-revoked` event as a confirmation
- **AND** viewer-originated `signal` sends MUST remain rejected before socket write and local `sent` event emission

#### Scenario: Revoke confirmation remains secret-safe
- **WHEN** the viewer runtime receives the follow-up `permission-revoked` confirmation after a revoke control
- **THEN** local events MAY preserve the message type and consent workflow metadata needed to correlate the confirmation
- **AND** local events and logs MUST NOT expose raw protocol payloads, tokens, pairing codes, private reasons, keystrokes, screenshots, screen contents, or input contents

### Requirement: Testable viewer revoke confirmation fail-closed behavior
The agent shell SHALL expose integration-test coverage proving a viewer accepts a same-authority `permission-revoked` confirmation after a bound revoke-permission `session-control` without restoring signal authorization.

#### Scenario: Viewer receives revoke confirmation after revoke control
- **WHEN** a viewer runtime has active visible `screen:view` authorization, receives a same-authority revoke-permission `session-control`, and then receives a same-authority `permission-revoked` confirmation for the same authorization id and permission
- **THEN** the viewer runtime emits the confirmation as a local `received` protocol event with secret-safe reason metadata
- **AND** viewer-originated `signal` sends remain rejected before socket write and local `sent` event emission

#### Scenario: Revoke confirmation diagnostics remain secret-safe
- **WHEN** the viewer runtime receives the follow-up `permission-revoked` confirmation with private reason text
- **THEN** local events and logs MUST NOT expose raw reason text, raw protocol payloads, tokens, pairing codes, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, or input contents

### Requirement: Viewer permission revocation floor
The viewer runtime SHALL preserve permissions already removed by same-authorization host revocation lifecycle messages and MUST NOT restore those permissions from later same-authorization `session-authorization-decision` or `session-authorization-state` messages. This local revocation floor MUST be scoped to the current authorization id and observed host authority, and MUST NOT authorize screen capture, input, clipboard access, file transfer, diagnostics, reconnect, hidden sessions, or consent bypass.

#### Scenario: Stale active state cannot restore a partially revoked screen permission
- **WHEN** a viewer runtime has active visible authorization with `screen:view` and another granted permission
- **AND** it receives a same-authority revoke-permission `session-control` for `screen:view`
- **AND** it later receives a same-authority active `session-authorization-state` for the same authorization id whose permission list still includes `screen:view`
- **THEN** the viewer runtime MUST keep `screen:view` removed from its authorization snapshot
- **AND** viewer-originated `signal` sends MUST remain rejected before socket write and local `sent` event emission

#### Scenario: Permission-revoked confirmation also preserves the revocation floor
- **WHEN** a viewer runtime has active visible authorization with `screen:view` and another granted permission
- **AND** it receives a same-authority `permission-revoked` confirmation for `screen:view`
- **AND** it later receives a same-authority active `session-authorization-state` for the same authorization id whose permission list still includes `screen:view`
- **THEN** the viewer runtime MUST keep `screen:view` removed from its authorization snapshot
- **AND** viewer-originated `signal` sends MUST remain rejected before socket write and local `sent` event emission

#### Scenario: Repeated same-authorization decision cannot reset the revocation floor
- **WHEN** a viewer runtime has active visible authorization with `screen:view` and another granted permission
- **AND** it receives a same-authority revocation lifecycle message for `screen:view`
- **AND** it later receives a same-authority approved `session-authorization-decision` for the same authorization id whose granted permission list still includes `screen:view`
- **THEN** the viewer runtime MUST keep `screen:view` removed from its authorization snapshot
- **AND** the repeated same-authorization decision MUST NOT authorize viewer-originated `signal` sends

#### Scenario: New authorization id resets the revocation floor
- **WHEN** a viewer runtime has removed `screen:view` for one authorization id
- **AND** it later receives an approved decision and active visible state for a different authorization id from the observed host authority
- **THEN** permissions for the new authorization id are evaluated from that new decision and state
- **AND** the previous authorization id's revocation floor MUST NOT restore, remove, or otherwise modify permissions for the new authorization

#### Scenario: Revocation floor diagnostics remain secret-safe
- **WHEN** a stale same-authorization state includes a permission already removed by host revocation
- **THEN** local events and logs MUST NOT expose raw protocol payloads, tokens, pairing codes, private reasons, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, or input contents

### Requirement: Viewer terminal decision replay boundary
The viewer runtime SHALL ignore inbound `session-authorization-decision` messages before local `received` protocol event emission when they target the same authorization id and observed host authority as a terminal viewer authorization snapshot. Terminal same-authorization decision replay MUST NOT replace host authority, restore permissions, activate visibility, authorize viewer-originated `signal` sends, start capture, send input, reconnect, suppress host visibility, or bypass consent workflows. A different authorization id from the observed host authority SHALL remain a new consent scope.

#### Scenario: Denied authorization cannot be reopened by same-id approved decision
- **WHEN** a viewer runtime receives a denied `session-authorization-decision` for the local viewer from the observed host authority
- **AND** it later receives an approved `session-authorization-decision` for the same authorization id and host authority
- **THEN** the runtime MUST ignore the later decision before local `received` protocol event emission
- **AND** later same-id active state MUST still be ignored before local `received` protocol event emission
- **AND** viewer-originated `signal` sends MUST remain rejected before socket write and local `sent` event emission

#### Scenario: Terminal state cannot be reopened by same-id approved decision
- **WHEN** a viewer runtime has observed `revoked`, `terminated`, or `expired` authorization state for an authorization id from the observed host authority
- **AND** it later receives an approved `session-authorization-decision` for the same authorization id and host authority
- **THEN** the runtime MUST ignore the later decision before local `received` protocol event emission
- **AND** later same-id active state MUST still be ignored before local `received` protocol event emission
- **AND** viewer-originated `signal` sends MUST remain rejected before socket write and local `sent` event emission

#### Scenario: New authorization id remains a new consent scope
- **WHEN** a viewer runtime has a terminal authorization snapshot for one authorization id from the observed host authority
- **AND** it later receives an approved `session-authorization-decision` and active visible `session-authorization-state` for a different authorization id from that observed host authority
- **THEN** the new authorization id MAY bind as a new consent scope
- **AND** the previous terminal authorization id MUST NOT restore, remove, or otherwise modify permissions for the new authorization id

#### Scenario: Terminal decision replay diagnostics remain secret-safe
- **WHEN** the viewer runtime ignores a terminal same-authorization decision replay
- **THEN** local events and logs MUST NOT expose raw protocol payloads, tokens, pairing codes, private reasons, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, or input contents

### Requirement: Host visible-session indicator events
The host agent shell SHALL emit local secret-safe indicator events for visible host session state changes. Indicator events for active or paused visible authorizations SHALL include the current authorization expiration timestamp as bounded lifecycle metadata. Indicator events are local UI metadata only and MUST NOT authorize screen capture, input, clipboard access, file transfer, diagnostics, reconnect, hidden sessions, or consent bypass.

#### Scenario: Indicator activates after visible approval
- **WHEN** a host shell explicitly approves an authorization request and emits an active visible session state
- **THEN** it MUST emit a local indicator event with state `active`, the authorization id, authorization status `active`, `visibleToHost: true`, the granted permission count, and the authorization `expiresAt` timestamp
- **AND** the indicator event MUST NOT be emitted before explicit approval and visible activation

#### Scenario: Indicator is withheld without visible activation
- **WHEN** a host shell approves an authorization request but visible session state is false
- **THEN** it MUST NOT emit an active or paused indicator event

#### Scenario: Indicator follows pause, resume, and partial revocation
- **WHEN** a host shell has emitted an active indicator for a visible authorization
- **AND** the host workflow pauses, resumes, or revokes one permission while remaining non-terminal
- **THEN** it MUST emit a local indicator update that reflects the current active or paused state, current permission count, and same authorization expiration timestamp

#### Scenario: Indicator deactivates on terminal or disconnect lifecycle
- **WHEN** a host shell has emitted an active or paused indicator for a visible authorization
- **AND** the host workflow reaches final revocation, termination, expiration, local disconnect, runtime stop, local socket close, or trusted remote peer disconnect
- **THEN** it MUST emit a local indicator event with state `inactive`
- **AND** the inactive indicator event MUST NOT retain stale `expiresAt` metadata

#### Scenario: Indicator diagnostics are secret-safe
- **WHEN** the runtime emits or logs host indicator updates
- **THEN** indicator events and logs MAY include bounded lifecycle metadata such as authorization id, authorization status, expiration timestamp, indicator state, visible flag, permission count, and cause
- **AND** they MUST NOT expose raw protocol payloads, tokens, pairing codes, private reasons, display names, signal payloads, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, or input contents

### Requirement: Signal authorization-id binding
The agent shell SHALL bind outbound and inbound `signal` messages to the current active visible authorization by requiring a payload authorization id that matches the runtime's active authorization snapshot. This binding is a consent-safety gate only and MUST NOT authorize screen capture, input, clipboard access, file transfer, diagnostics, reconnect, hidden sessions, or consent bypass.

#### Scenario: Outbound signal without authorization id is blocked
- **WHEN** a host or viewer runtime has active visible `screen:view` authorization and caller code invokes public `send()` with a `signal` whose payload omits `authorizationId`
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked signal

#### Scenario: Outbound signal with mismatched authorization id is blocked
- **WHEN** a host or viewer runtime has active visible `screen:view` authorization and caller code invokes public `send()` with a `signal` whose payload `authorizationId` does not match the active authorization id
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked signal

#### Scenario: Outbound signal with matching authorization id is allowed
- **WHEN** a host or viewer runtime has active visible `screen:view` authorization and caller code invokes public `send()` with a `signal` whose routing metadata and payload `authorizationId` match the active authorization
- **THEN** the signal MAY be written to the socket
- **AND** the local `sent` event MUST continue to redact raw signal payload contents

#### Scenario: Inbound signal without matching authorization id is ignored
- **WHEN** a host or viewer runtime receives a routed `signal` whose payload omits `authorizationId` or carries an authorization id that does not match the runtime's active authorization
- **THEN** the runtime MUST ignore the signal before local `received` event emission and before received signal summary logging

#### Scenario: Inbound signal with matching authorization id is received
- **WHEN** a host or viewer runtime has active visible `screen:view` authorization and receives a routed `signal` whose payload `authorizationId` matches the active authorization id
- **THEN** the runtime MAY emit a local `received` event for that signal
- **AND** the received event MUST continue to redact raw signal payload contents

#### Scenario: Signal authorization binding diagnostics are secret-safe
- **WHEN** the runtime blocks or ignores a `signal` because its payload authorization id is missing, malformed, or mismatched
- **THEN** thrown errors, runtime events, and logs MUST NOT expose raw signal payloads, signal payload keys, tokens, pairing codes, authorization reasons, display names, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, or input contents

### Requirement: Agent signal payload JSON compatibility
The agent shell SHALL inherit shared protocol `signal.payload` JSON-compatible object validation, unsafe property-name rejection, and sensitive remote-assistance key rejection for public runtime sends and inbound messages. This validation MUST reject payload property names containing ASCII control characters or Unicode bidirectional or zero-width formatting controls including `U+FEFF`, and MUST NOT weaken existing signal authorization, routing, redaction, or consent gates.

#### Scenario: Public send rejects non-JSON signal payload
- **WHEN** caller code invokes public runtime `send()` with a `signal` payload containing a non-JSON value or property shape
- **THEN** the runtime rejects the send before socket write and before local `sent` event emission

#### Scenario: Public send rejects access-key and SSH-key signal payload
- **WHEN** caller code invokes public runtime `send()` with a `signal` payload containing access-key or SSH-key field names such as `accessKey`, `access_key`, `access-key`, `sshKey`, or `ssh_key` at any nesting level
- **THEN** the runtime rejects the send before socket write and before local `sent` event emission
- **AND** local events and logs MUST NOT expose raw access-key or SSH-key values

#### Scenario: Public send rejects unsafe signal payload property name
- **WHEN** caller code invokes public runtime `send()` with a `signal` payload containing a property name with an ASCII control character or Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** the runtime rejects the send before socket write and before local `sent` event emission
- **AND** thrown errors, local events, and logs MUST NOT expose the raw unsafe property name or payload value

#### Scenario: Inbound non-JSON signal payload is not trusted
- **WHEN** the agent shell receives a decoded `signal` message whose payload contains a non-JSON value or property shape
- **THEN** shared protocol validation rejects the message before local `received` protocol event emission or received signal summary logging

#### Scenario: Inbound access-key and SSH-key signal payload is not trusted
- **WHEN** the agent shell receives a decoded `signal` message whose payload contains access-key or SSH-key field names such as `accessKey`, `access_key`, `access-key`, `sshKey`, or `ssh_key` at any nesting level
- **THEN** shared protocol validation rejects the message before local `received` protocol event emission or received signal summary logging
- **AND** local events and logs MUST NOT expose raw access-key or SSH-key values

#### Scenario: Inbound unsafe signal payload property name is not trusted
- **WHEN** the agent shell receives a decoded `signal` message whose payload contains a property name with an ASCII control character or Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** shared protocol validation rejects the message before local `received` protocol event emission or received signal summary logging
- **AND** raw events and logs MUST NOT expose the raw unsafe property name or payload value

#### Scenario: Signal JSON validation does not grant access
- **WHEN** a `signal` payload is JSON-compatible and does not contain sensitive remote-assistance key fields
- **THEN** JSON compatibility alone MUST NOT authorize screen capture, input, clipboard access, file transfer, diagnostics, reconnect, hidden sessions, or consent bypass

### Requirement: Agent shell rejects unknown fixed protocol fields
The agent shell SHALL treat inbound and public-send protocol messages with unknown fixed-shape fields as invalid protocol input before trusted runtime events, workflow handling, socket writes, or local sent-event emission.

#### Scenario: Inbound message has unknown fixed field
- **WHEN** the agent shell receives a protocol message with an unknown top-level field outside allowed metadata containers
- **THEN** the runtime MUST reject it before local `received` protocol event emission or workflow handling

#### Scenario: Public send message has unknown fixed field
- **WHEN** caller code invokes public runtime `send()` with a protocol envelope that includes an unknown top-level field outside allowed metadata containers
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked envelope

#### Scenario: Agent shell strict-field diagnostics are secret-safe
- **WHEN** the runtime rejects or ignores a message because of an unknown fixed field
- **THEN** thrown errors, runtime events, and logs MUST NOT expose raw protocol payloads, unknown field values, tokens, pairing codes, private reasons, keystrokes, screenshots, screen contents, or input contents

### Requirement: Interactive host consent prompt
The host agent shell SHALL support an opt-in interactive consent path that asks the host operator to approve or deny a received `session-authorization-request` before sending any authorization decision. The prompt SHALL show the host operator the requesting viewer identity using bounded metadata from the observed viewer peer and SHALL show the requested permission names and count before accepting input. Interactive prompt metadata rendering MUST independently validate prompt request fields before writing host-facing text; invalid optional display-name or request-reason values MUST render as `unavailable`, and invalid required peer-id or requested-permission values MUST render bounded placeholder text without echoing raw unsafe values. Interactive prompt waiting SHALL be bounded by a positive host consent timeout with a default of `60000` milliseconds. This prompt path is a development host workflow only and MUST NOT authorize screen capture, input, clipboard access, file transfer, diagnostics, reconnect, hidden sessions, stealth persistence, or consent bypass.

#### Scenario: Host approves through interactive prompt
- **WHEN** a host shell is configured for interactive consent and receives a same-session authorization request from the observed viewer
- **AND** the host operator explicitly enters the exact accepted approval response before the host consent timeout expires
- **THEN** the shell sends the same approved authorization decision, audit event, visible-session-gated active state, indicator event, and lifecycle simulations that the static approve workflow would send
- **AND** active visible state remains withheld unless `visibleToHost` is true

#### Scenario: Host denies through interactive prompt
- **WHEN** a host shell is configured for interactive consent and receives a same-session authorization request from the observed viewer
- **AND** the host operator explicitly enters the exact accepted denial response before the host consent timeout expires
- **THEN** the shell sends the same denied authorization decision and denied audit event that the static deny workflow would send
- **AND** it MUST NOT emit active visible state, grant permissions, start capture, send input, or enable signal authorization

#### Scenario: Prompt shows viewer identity and requested permissions
- **WHEN** a host shell is configured for interactive consent and receives a same-session authorization request from the observed viewer
- **THEN** the host-facing prompt text MUST include the trusted viewer peer id, the validated viewer display name when available, the requested permission names, and the requested permission count before asking for `approve` or `deny`
- **AND** it MUST NOT use unbound authorization request fields, unvalidated display names, raw protocol payloads, tokens, pairing codes, private reasons, signal payloads, screen contents, input contents, clipboard contents, file-transfer contents, diagnostics dumps, or credentials as prompt identity content

#### Scenario: Prompt sanitizes direct helper metadata
- **WHEN** the interactive host consent prompt helper is called directly with an unsafe viewer display name, malformed viewer peer id, unsafe request reason, or malformed requested permission
- **THEN** the host-facing prompt text MUST render only bounded placeholders for those unsafe fields before asking for `approve` or `deny`
- **AND** it MUST NOT expose the raw unsafe display name, raw malformed peer id, raw unsafe request reason, raw malformed permission, protocol payloads, tokens, pairing codes, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, input contents, or full secrets
- **AND** this rendering MUST NOT approve authorization, activate visibility, grant permissions, start capture, send input, reconnect peers, suppress host visibility, or bypass consent workflows

#### Scenario: Prompt timeout fails closed
- **WHEN** an interactive host consent prompt waits longer than the configured host consent timeout
- **THEN** the prompt result is treated as no accepted decision
- **AND** the host shell MUST NOT send approval, denial, active state, session-control, permission-revoked, signal, or workflow audit messages for that request
- **AND** it logs only secret-safe metadata about the timeout

#### Scenario: Whitespace-padded prompt response fails closed
- **WHEN** an interactive host consent prompt receives input with leading or trailing whitespace around `approve` or `deny`
- **THEN** the prompt result is treated as no accepted decision
- **AND** the host shell MUST NOT send approval, denial, active state, session-control, permission-revoked, signal, or workflow audit messages for that request

#### Scenario: Prompt cancellation or invalid response fails closed
- **WHEN** an interactive host consent prompt is cancelled, fails, times out, or returns anything other than the exact accepted approval or denial response
- **THEN** the host shell MUST NOT send approval, denial, active state, session-control, permission-revoked, signal, or workflow audit messages for that request
- **AND** it logs only secret-safe metadata about the prompt outcome

#### Scenario: Prompt resolves after viewer disconnect
- **WHEN** an interactive host consent prompt is waiting for a decision
- **AND** the requesting viewer disconnects before the prompt returns approval or denial
- **THEN** the host shell MUST NOT send approval, denial, active state, session-control, permission-revoked, signal, or workflow audit messages for that stale request
- **AND** it logs only secret-safe metadata about the skipped decision

#### Scenario: Interactive consent is mutually exclusive with static host decision
- **WHEN** host prompt mode is enabled
- **THEN** static `hostDecision` approval or denial MUST NOT also be configured as an additional decision source
- **AND** invalid configuration fails before opening a relay connection

#### Scenario: Interactive prompt diagnostics are secret-safe
- **WHEN** the host shell prompts, resolves, cancels, times out, or rejects an interactive consent decision
- **THEN** prompt text MAY include bounded host-facing consent metadata such as the trusted viewer peer id, validated viewer display name, requested permission names, requested permission count, and timeout milliseconds
- **AND** authorization decision/state events, errors, logs, and audit records MUST NOT expose raw protocol payloads, tokens, pairing codes, private reasons, display names, signal payloads, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, or input contents
- **AND** prompt text MUST NOT expose raw protocol payloads, tokens, pairing codes, private reasons, signal payloads, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, input contents, credentials, or unvalidated identity values

### Requirement: Host control prompt CLI validation
The agent shell SHALL reject malformed, viewer-mode, or ambiguous host control prompt CLI configuration before starting the runtime. Host control prompt validation SHALL allow exact `true` or `false` values only for host runtimes. Host control prompt mode MAY be combined with interactive host consent prompt mode only when the CLI delays control prompt startup until after active visible host authorization; it MUST still be rejected when combined with one-shot host status mode.

#### Scenario: Host control prompt value is explicit
- **WHEN** the agent shell is started with `--host-control-prompt`
- **THEN** the value MUST be either `true` or `false`

#### Scenario: Host control prompt is host-only
- **WHEN** a viewer shell is started with `--host-control-prompt true`
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Host control prompt can follow interactive host consent
- **WHEN** a host shell is started with both `--host-control-prompt true` and `--host-consent-prompt true`
- **THEN** CLI validation succeeds without starting the host control prompt before relay startup
- **AND** the host control prompt MUST NOT start until an interactive approval produces an active visible host indicator

#### Scenario: Host control prompt remains mutually exclusive with one-shot host status
- **WHEN** a host shell is started with both `--host-control-prompt true` and `--host-status-after-ms 0`
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

### Requirement: Interactive host control prompt
The host agent shell SHALL support an opt-in development host control prompt that accepts exact local commands for pause, resume, permission revocation, termination, and local disconnect. Accepted commands MUST call the managed runtime direct host controls rather than constructing workflow protocol messages directly. When combined with interactive host consent prompt mode, the host control prompt SHALL start only after an approved active visible authorization is reported by the runtime. The prompt MUST NOT authorize screen capture, input, clipboard access, file transfer, diagnostics, reconnect, hidden sessions, stealth persistence, or consent bypass.

#### Scenario: Host control prompt accepts lifecycle commands
- **WHEN** host control prompt mode is enabled
- **AND** the host operator enters exact command `pause`, `resume`, `terminate`, or `disconnect`
- **THEN** the CLI invokes the matching managed runtime direct control

#### Scenario: Host control prompt accepts revoke command
- **WHEN** host control prompt mode is enabled
- **AND** the host operator enters exact command `revoke screen:view`
- **THEN** the CLI validates `screen:view` as a canonical permission token and invokes managed runtime `revokePermission("screen:view")`

#### Scenario: Host control prompt starts after interactive approval
- **WHEN** host control prompt mode and interactive host consent prompt mode are both enabled
- **AND** the host approves a viewer request that activates a visible authorization
- **THEN** the CLI starts the host control prompt exactly once after the active visible host indicator event
- **AND** it MUST NOT start a second host control prompt for later pause, resume, or repeated active indicator events

#### Scenario: Host control prompt does not start after denial or timeout
- **WHEN** host control prompt mode and interactive host consent prompt mode are both enabled
- **AND** the host denies, cancels, times out, enters an invalid response, or the requesting viewer disconnects before approved active visible authorization
- **THEN** the CLI does not start the host control prompt
- **AND** it MUST NOT send session-control, permission-revoked, authorization-state, disconnect, or audit-event messages because of the absent prompt

#### Scenario: Host control prompt rejects malformed commands
- **WHEN** host control prompt mode receives a blank, unsupported, whitespace-padded, malformed, or invalid-permission command
- **THEN** it rejects the command before invoking any managed runtime direct control
- **AND** it MUST NOT send session-control, permission-revoked, authorization-state, disconnect, or audit-event messages because of that command

#### Scenario: Host control prompt preserves runtime gates
- **WHEN** host control prompt mode invokes a managed runtime direct control before visible active or paused authorization, after expiration, after terminal state, from a disconnected peer state, or for a missing permission
- **THEN** the underlying runtime rejects the control before audit writes or lifecycle protocol messages

#### Scenario: Host control prompt diagnostics are secret-safe
- **WHEN** host control prompt mode prints instructions, accepts a command, rejects a command, catches a runtime failure, or stops after stdin close
- **THEN** output MAY include bounded static command names, canonical permission names, and message byte length metadata
- **AND** output MUST NOT echo raw command lines, raw runtime exception text, protocol payloads, tokens, pairing codes, private reasons, display names, signal payloads, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, or input contents

#### Scenario: Host control prompt safety boundary
- **WHEN** host control prompt mode starts, receives commands, rejects commands, or stops
- **THEN** it MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, hide the session from the host, or bypass consent workflows

### Requirement: Viewer signal probe CLI validation
The agent shell SHALL reject malformed, host-mode, or ambiguous viewer signal probe CLI configuration before starting the runtime. Viewer signal probe validation SHALL allow exact integer millisecond delay values from `0` through the safe JavaScript timer delay bound only for viewer runtimes that explicitly request `screen:view`.

#### Scenario: Viewer signal probe delay is exact
- **WHEN** the agent shell is started with `--viewer-signal-probe-after-ms`
- **THEN** the value MUST be an exact integer millisecond delay from `0` through `2147483647`

#### Scenario: Viewer signal probe is viewer-only
- **WHEN** a host shell is started with `--viewer-signal-probe-after-ms 0`
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Viewer signal probe requires screen view request
- **WHEN** a viewer shell is started with `--viewer-signal-probe-after-ms 0` without requesting `screen:view`
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

### Requirement: Viewer signal probe
The viewer agent shell SHALL support an opt-in development signal probe that sends one static `signal` payload only after the viewer observes active visible `screen:view` authorization. The probe MUST send through the managed runtime public `send()` path and MUST NOT construct or write protocol messages directly from the CLI or bypass existing signal authorization, routing, payload validation, event redaction, disconnect, pause, revoke, termination, or expiration gates. The probe MUST NOT authorize or transmit screen capture, input, clipboard data, file-transfer data, diagnostics data, SDP, ICE candidates, reconnect material, hidden sessions, stealth persistence, or consent bypass.

#### Scenario: Viewer signal probe sends after active visible authorization
- **WHEN** viewer signal probe mode is enabled
- **AND** the viewer observes active visible authorization that grants `screen:view`
- **THEN** the runtime sends one `signal` through public `send()` with the current authorization id and a static probe marker
- **AND** local sent and received runtime events continue to redact raw signal payload contents

#### Scenario: Viewer signal probe is withheld before authorization
- **WHEN** viewer signal probe mode is enabled
- **AND** the viewer has not observed active visible `screen:view` authorization
- **THEN** the runtime MUST NOT send a `signal` probe

#### Scenario: Viewer signal probe fails closed after lifecycle loss
- **WHEN** viewer signal probe mode is enabled
- **AND** the viewer's active authorization is paused, revoked, terminated, expired, disconnected locally, disconnected remotely, or loses `screen:view` before the probe fires
- **THEN** the runtime MUST NOT emit a local `sent` signal event or write the probe signal to the socket

#### Scenario: Viewer signal probe payload is bounded and static
- **WHEN** viewer signal probe mode sends a probe
- **THEN** the payload MUST contain only the current non-secret `authorizationId`, bounded non-secret `kind`, and a static probe marker
- **AND** it MUST NOT contain user-provided JSON, SDP, ICE candidates, tokens, pairing codes, credentials, private reasons, display names, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, or input contents

#### Scenario: Viewer signal probe safety boundary
- **WHEN** viewer signal probe mode is configured, starts, fires, fails, or is skipped
- **THEN** it MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, hide the session from the host, reconnect peers, suppress host visibility, or bypass consent workflows

### Requirement: Host signal probe acknowledgement CLI validation
The agent shell SHALL reject malformed, viewer-mode, or ambiguous host signal probe acknowledgement CLI configuration before starting the runtime. Host signal probe acknowledgement validation SHALL allow exact `true` or `false` values only for host runtimes.

#### Scenario: Host signal probe acknowledgement value is explicit
- **WHEN** the agent shell is started with `--host-signal-probe-ack`
- **THEN** the value MUST be either `true` or `false`

#### Scenario: Host signal probe acknowledgement is host-only
- **WHEN** a viewer shell is started with `--host-signal-probe-ack true`
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

### Requirement: Host signal probe acknowledgement
The host agent shell SHALL support an opt-in development acknowledgement for trusted viewer signal probes. When enabled, the host MAY send one static acknowledgement `signal` per authorization id only after receiving a trusted viewer probe signal that already passed inbound signal authorization gates. The acknowledgement MUST send through the managed runtime public `send()` path and MUST NOT construct or write protocol messages directly from the CLI or bypass existing signal authorization, routing, payload validation, event redaction, disconnect, pause, revoke, termination, or expiration gates. The acknowledgement MUST NOT authorize or transmit screen capture, input, clipboard data, file-transfer data, diagnostics data, SDP, ICE candidates, reconnect material, hidden sessions, stealth persistence, or consent bypass.

#### Scenario: Host acknowledgement sends after trusted viewer probe
- **WHEN** host signal probe acknowledgement mode is enabled
- **AND** the host has active visible `screen:view` authorization
- **AND** the host receives a trusted viewer `signal` with the current authorization id and the static viewer probe marker
- **THEN** the runtime sends one acknowledgement `signal` through public `send()` with the current authorization id and a static acknowledgement marker
- **AND** local sent and received runtime events continue to redact raw signal payload contents

#### Scenario: Host acknowledgement ignores non-probe signal
- **WHEN** host signal probe acknowledgement mode is enabled
- **AND** the host receives a trusted viewer `signal` that does not contain the static viewer probe marker
- **THEN** the runtime MUST NOT send an acknowledgement

#### Scenario: Host acknowledgement is once per authorization id
- **WHEN** host signal probe acknowledgement mode is enabled
- **AND** the host receives repeated trusted viewer probe signals for the same authorization id
- **THEN** the runtime MUST send at most one acknowledgement signal for that authorization id

#### Scenario: Host acknowledgement fails closed after lifecycle loss
- **WHEN** host signal probe acknowledgement mode is enabled
- **AND** the host authorization is paused, revoked, terminated, expired, disconnected locally, disconnected remotely, or loses `screen:view` before acknowledgement send
- **THEN** the runtime MUST NOT emit a local `sent` acknowledgement signal event or write the acknowledgement signal to the socket

#### Scenario: Host acknowledgement payload is bounded and static
- **WHEN** host signal probe acknowledgement mode sends an acknowledgement
- **THEN** the payload MUST contain only the current non-secret `authorizationId`, bounded non-secret `kind`, and a static acknowledgement marker
- **AND** it MUST NOT contain user-provided JSON, SDP, ICE candidates, tokens, pairing codes, credentials, private reasons, display names, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, or input contents

#### Scenario: Host acknowledgement safety boundary
- **WHEN** host signal probe acknowledgement mode is configured, receives a signal, sends, fails, or is skipped
- **THEN** it MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, hide the session from the host, reconnect peers, suppress host visibility, or bypass consent workflows

### Requirement: Agent shell signal probes include bounded kind metadata
The managed agent shell runtime SHALL include bounded non-secret top-level `payload.kind` classifier metadata on built-in development signal probe messages and built-in host signal probe acknowledgement messages. A viewer-originated development signal probe MUST use `payload.kind` set to `viewer-signal-probe`, and a host-originated development signal probe acknowledgement MUST use `payload.kind` set to `host-signal-probe-ack`. The classifier metadata MUST NOT replace the existing active visible `screen:view` authorization, current authorization id, trusted peer authority, recipient routing, pause, revoke, terminate, expiration, local disconnect, remote disconnect, relay validation, or signal marker checks. Runtime events, logs, status snapshots, relay errors, and audit output MUST continue to omit raw signal payload contents unless a future OpenSpec change explicitly introduces bounded signal kind observability.

#### Scenario: Viewer probe includes bounded kind metadata
- **WHEN** a viewer runtime sends the built-in development signal probe after observing active visible `screen:view` authorization
- **THEN** the signal payload includes top-level `kind=viewer-signal-probe` and the current top-level `authorizationId`
- **AND** sending the probe MUST still require the existing active visible authorization, current recipient, and signal safety gates
- **AND** runtime diagnostics MUST NOT expose the raw probe marker, raw signal payload values, peer display names, tokens, pairing codes, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, or full secrets

#### Scenario: Host acknowledgement includes bounded kind metadata
- **WHEN** a host runtime sends the built-in signal probe acknowledgement after receiving a trusted viewer probe for the current active visible `screen:view` authorization
- **THEN** the acknowledgement signal payload includes top-level `kind=host-signal-probe-ack` and the current top-level `authorizationId`
- **AND** sending the acknowledgement MUST still require the existing active visible authorization, trusted viewer peer, current recipient, and signal safety gates
- **AND** runtime diagnostics MUST NOT expose the raw acknowledgement marker, raw signal payload values, peer display names, tokens, pairing codes, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, or full secrets

#### Scenario: Signal kind metadata is non-authorizing
- **WHEN** a signal payload contains `kind=viewer-signal-probe` or `kind=host-signal-probe-ack`
- **THEN** that kind metadata alone MUST NOT make the signal trusted, grant permissions, start capture, send input, start signaling, reconnect peers, invoke host controls, bypass consent workflows, or bypass the existing marker and authorization checks
- **AND** stale, mismatched, missing-authorization, wrong-peer, paused, revoked, terminated, expired, invisible, locally disconnected, or remotely disconnected signal paths MUST continue to fail closed

### Requirement: Host grant scope CLI validation
The agent shell SHALL reject malformed, viewer-mode, or ambiguous host grant scope CLI configuration before starting the runtime. Host grant scope validation SHALL allow only exact comma-separated canonical permission names for host runtimes with an approval source. Configured grant scope MUST be non-empty and MUST NOT contain duplicate permissions.

#### Scenario: Host grant scope is configured with static approval
- **WHEN** the host shell is started with `--host-decision approve --grant screen:view`
- **THEN** CLI validation succeeds and the grant scope is available to the runtime

#### Scenario: Host grant scope is configured with interactive approval
- **WHEN** the host shell is started with `--host-consent-prompt true --grant screen:view`
- **THEN** CLI validation succeeds and the grant scope is available if the host later approves

#### Scenario: Host grant scope is host-only
- **WHEN** a viewer shell is started with `--grant screen:view`
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Host grant scope requires approval source
- **WHEN** a host shell is started with `--grant screen:view` but without static approval or interactive host consent prompt mode
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Host grant scope rejects duplicate permissions
- **WHEN** the shell is started with `--grant screen:view,screen:view`
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

### Requirement: Host grant scope approval
The host agent shell SHALL support an explicit development grant scope for approvals. When configured, approved host decisions MUST grant exactly the configured non-empty permission subset and MUST NOT grant unrequested permissions. If the configured grant scope is not a subset of the current viewer request, the host shell MUST fail closed before emitting approval, active state, session-control, permission-revoked, signal, or workflow audit messages for that request. This development option MUST NOT authorize screen capture, input, clipboard access, file transfer, diagnostics, reconnect, hidden sessions, stealth persistence, or consent bypass.

#### Scenario: Host approves narrower requested scope
- **WHEN** a viewer requests `screen:view,input:pointer`
- **AND** the host shell is configured to approve with grant scope `screen:view`
- **THEN** the host sends an approved decision and visible active state with only `screen:view`
- **AND** approval and activation audit metadata report one granted permission

#### Scenario: Host approval omits screen view
- **WHEN** a viewer requests `screen:view,input:pointer`
- **AND** the host shell is configured to approve with grant scope `input:pointer`
- **THEN** the host sends an approved decision and visible active state with only `input:pointer`
- **AND** signal authorization remains unavailable because `screen:view` was not granted

#### Scenario: Host configured grant includes unrequested permission
- **WHEN** a viewer requests `screen:view`
- **AND** the host shell is configured to approve with grant scope `input:pointer`
- **THEN** the host MUST NOT emit approval, active state, session-control, permission-revoked, signal, or workflow audit messages for that request
- **AND** it logs only a secret-safe skip reason

#### Scenario: Host grant scope drives revocation eligibility
- **WHEN** the host approves a narrowed grant scope that excludes `input:pointer`
- **AND** delayed or direct revocation is configured for `input:pointer`
- **THEN** the host MUST NOT emit revoke session-control, permission-revoked, revoked state, or revocation audit messages for `input:pointer`

#### Scenario: Host grant scope diagnostics are secret-safe
- **WHEN** host grant scope validation, approval, subset checks, or skips occur
- **THEN** CLI errors, runtime events, audit details, and logs MUST NOT expose raw protocol payloads, tokens, pairing codes, private reasons, display names, signal payloads, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, or input contents

### Requirement: Host status snapshot
The managed host agent shell runtime SHALL expose a read-only local host status snapshot derived from the current host authorization, indicator state, and authorization-bound trusted viewer device metadata when available. The snapshot MUST NOT send protocol messages, emit workflow audit events, grant permissions, change authorization lifecycle state, start signaling, reconnect peers, or invoke host controls. Status snapshots MUST be host-only and MUST expose only bounded lifecycle metadata: local indicator state, visible host-session flag, action-capable permission count, optional authorization id/status, optional authorization expiration timestamp while the authorization is active or paused, optional viewer device id/platform bound at approval time for the current viewer authorization scope, optional local inactive indicator cause when the host indicator has been deactivated, and optional relay-defined remote disconnect reason code when the host indicator has been deactivated by a trusted remote viewer disconnect. Host status snapshots MUST NOT expose viewer display names, viewer peer ids, remote self-asserted trust-level metadata, raw protocol payloads, private reasons, signal payloads, tokens, pairing codes, credentials, screen contents, input contents, clipboard contents, file-transfer contents, diagnostics dumps, or full secrets.

#### Scenario: No host authorization is inactive
- **WHEN** caller code asks a host runtime for host status before authorization
- **THEN** the host status snapshot reports inactive local state, `visibleToHost: false`, and permission count `0`
- **AND** it omits viewer device id/platform metadata

#### Scenario: Active visible authorization includes authorization-bound viewer device context
- **WHEN** caller code asks a host runtime for host status after active visible authorization
- **AND** the host observed a trusted viewer `hello` with schema-valid device identity for that authorization requester before approving the current authorization
- **THEN** the host status snapshot reports active local state, authorization status `active`, `visibleToHost: true`, the effective granted permission count, the authorization `expiresAt` timestamp, and the authorization-bound viewer device id/platform
- **AND** it MUST NOT include viewer display name, viewer peer id, or remote self-asserted trust-level metadata

#### Scenario: Active visible authorization keeps device context bound
- **WHEN** caller code asks a host runtime for host status after active visible authorization
- **AND** the same viewer peer has sent a later valid `hello` with different schema-valid device identity metadata
- **THEN** the host status snapshot keeps the viewer device id/platform that was bound when the current authorization was approved
- **AND** it MUST NOT rewrite active status device metadata from the later `hello`

#### Scenario: Active visible authorization omits unavailable viewer device context
- **WHEN** caller code asks a host runtime for host status after active visible authorization
- **AND** the current authorization has no authorization-bound viewer device identity for that authorization requester
- **THEN** the host status snapshot reports the existing active lifecycle metadata
- **AND** it omits viewer device id/platform metadata without inventing device context

#### Scenario: Paused authorization retains authorization-bound viewer device context
- **WHEN** caller code asks a host runtime for host status after the current authorization has been paused
- **AND** the current authorization has authorization-bound viewer device identity for that authorization requester
- **THEN** the host status snapshot reports paused local state, authorization status `paused`, `visibleToHost: true`, the retained granted permission count, the authorization `expiresAt` timestamp, and the authorization-bound viewer device id/platform

#### Scenario: Inactive host indicator omits stale viewer device context
- **WHEN** caller code asks a host runtime for host status after the host indicator has been deactivated by revocation, termination, expiration, local disconnect, or trusted remote disconnect
- **THEN** the host status snapshot reports inactive local state, `visibleToHost: false`, permission count `0`, and a bounded local inactive cause
- **AND** it omits viewer device id/platform metadata from the inactive status

#### Scenario: Host status snapshot is read-only
- **WHEN** caller code receives a host status snapshot
- **THEN** attempts to mutate it MUST NOT change the runtime's internal host authorization, indicator, or viewer device metadata

#### Scenario: Viewer runtime cannot read host status
- **WHEN** caller code asks a viewer runtime for host status
- **THEN** the runtime rejects the operation before sending protocol messages, emitting workflow audit events, granting permissions, reconnecting peers, invoking host controls, starting capture, sending input, or bypassing consent workflows

### Requirement: Host control prompt status command
The interactive host control prompt SHALL support an exact read-only `status` command. The status command MUST call the managed runtime status snapshot and MUST NOT call pause, resume, revoke, terminate, disconnect, public send, or any direct protocol-construction path. Status output MUST remain secret-safe and MUST NOT echo raw command lines, permission names, peer ids, display names, remote self-asserted trust-level metadata, private reasons, protocol payloads, tokens, pairing codes, signal payloads, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, input contents, or raw WebSocket close reason text.

#### Scenario: Host control prompt prints status
- **WHEN** host control prompt mode receives exact command `status`
- **THEN** it prints a bounded local host status line with indicator state, visible flag, permission count, optional authorization id/status, optional authorization expiration timestamp for active or paused authorization, optional viewer device id/platform bound at approval time for the current viewer authorization scope, optional local inactive cause when the host indicator is inactive, and optional relay-defined remote disconnect reason code after trusted remote viewer disconnect
- **AND** it does not invoke host lifecycle controls or public runtime sends

#### Scenario: Host control prompt rejects malformed status commands
- **WHEN** host control prompt mode receives whitespace-padded, case-varied, or suffixed status input
- **THEN** it rejects the command before reading runtime status or invoking any managed runtime control

#### Scenario: Host status command safety boundary
- **WHEN** host status command starts, succeeds, fails, or is rejected
- **THEN** it MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, hide the session from the host, reconnect peers, suppress host visibility, or bypass consent workflows

### Requirement: Viewer status snapshot
The managed viewer agent shell runtime SHALL expose a read-only local viewer status snapshot derived from the current viewer authorization state. The snapshot MUST NOT send protocol messages, emit workflow audit events, grant permissions, change authorization lifecycle state, start signaling, reconnect peers, or invoke host controls. Status snapshots MUST be viewer-only and MUST expose only bounded lifecycle metadata: local state, visible host-session flag, action-capable permission count, optional authorization id/status, optional authorization expiration timestamp while the authorization is active or paused, and optional relay-defined remote disconnect reason code after trusted remote host disconnect.

#### Scenario: Viewer status is inactive before authorization
- **WHEN** a viewer runtime has not received an authorization decision or visible active state
- **THEN** the viewer status snapshot reports inactive local state, `visibleToHost: false`, and permission count `0`
- **AND** reading status does not send join, authorization, lifecycle, signal, or audit messages

#### Scenario: Viewer status reflects active visible authorization
- **WHEN** a viewer runtime has active visible authorization with a granted permission scope
- **THEN** the viewer status snapshot reports active local state, authorization status `active`, `visibleToHost: true`, the effective granted permission count, and the authorization `expiresAt` timestamp

#### Scenario: Viewer status reflects paused authorization
- **WHEN** a viewer runtime receives a pause for an active visible authorization
- **THEN** the viewer status snapshot reports paused local state, authorization status `paused`, `visibleToHost: true`, the retained granted permission count, and the authorization `expiresAt` timestamp

#### Scenario: Viewer status reports invisible or terminal authorization as inactive
- **WHEN** a viewer runtime has only approved-but-invisible, denied, revoked, terminated, or expired authorization state
- **THEN** the viewer status snapshot reports inactive local state, `visibleToHost: false`, and permission count `0`
- **AND** it MUST NOT retain stale `expiresAt` metadata from any prior active or paused authorization

#### Scenario: Viewer status is viewer-only
- **WHEN** caller code asks a host runtime for viewer status
- **THEN** the runtime rejects the request without sending protocol messages or changing local authorization state

### Requirement: Viewer status CLI validation
The agent shell SHALL reject malformed, host-mode, or ambiguous viewer status CLI configuration before starting the runtime. Viewer status validation SHALL allow exact integer millisecond delay values from `0` through `2147483647` only for viewer runtimes. Viewer status configuration MUST NOT require requested permissions because it reads only local status metadata and does not send protocol messages.

#### Scenario: Viewer status delay is exact
- **WHEN** the agent shell is started with `--viewer-status-after-ms`
- **THEN** the value MUST be an exact integer millisecond delay from `0` through `2147483647`

#### Scenario: Viewer status is viewer-only
- **WHEN** a host shell is started with `--viewer-status-after-ms 0`
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Viewer status does not require requested permissions
- **WHEN** a viewer shell is started with `--viewer-status-after-ms 0` without `--request`
- **THEN** CLI validation succeeds and the runtime MAY start normally

### Requirement: Viewer status CLI output
The viewer agent shell SHALL support an opt-in development status print that calls the managed runtime `getViewerStatus()` snapshot after the configured delay. The status print MUST expose only bounded local lifecycle metadata: state, visible host-session flag, action-capable permission count, optional authorization id/status, optional authorization expiration timestamp for active or paused authorization, optional relay-defined remote disconnect reason code after trusted remote host disconnect, and optional local inactive cause after explicit viewer local leave or local viewer socket close. The status print MUST NOT send protocol messages, emit workflow audit events, grant permissions, change authorization lifecycle state, start signaling, reconnect peers, invoke host controls, or expose screen, input, clipboard, file-transfer, diagnostics, token, pairing, credential, private-reason, display-name, peer-id, signal-payload, raw protocol data, or raw WebSocket close reason text.

#### Scenario: Viewer status prints inactive status
- **WHEN** viewer status print mode fires before the viewer has observed active visible authorization
- **THEN** it prints inactive local status metadata with `visibleToHost: false` and permission count `0`
- **AND** it MUST NOT emit authorization, lifecycle, signal, control, or workflow audit messages because of the status read

#### Scenario: Viewer status prints active status
- **WHEN** viewer status print mode fires after the viewer has observed active visible authorization
- **THEN** it prints active local status metadata with `visibleToHost: true`, the action-capable permission count, optional authorization id/status, and optional authorization expiration timestamp

#### Scenario: Viewer status prints trusted disconnect reason code
- **WHEN** viewer status print mode fires after the viewer has recorded trusted remote host disconnect state
- **THEN** it prints inactive local status metadata with `visibleToHost: false`, permission count `0`, optional authorization id/status, and the bounded relay-defined remote disconnect reason code
- **AND** it MUST NOT print peer ids, display names, private reasons, signal payloads, tokens, pairing codes, raw protocol data, raw WebSocket close reason text, or stale `expiresAt` metadata

#### Scenario: Viewer status prints local inactive cause
- **WHEN** viewer status print mode fires after the viewer has explicitly left locally or after the local viewer socket has closed
- **THEN** it prints inactive local status metadata with `visibleToHost: false`, permission count `0`, and the bounded local inactive cause
- **AND** it MUST NOT print authorization id/status from the left or closed local connection scope, remote disconnect reason codes, peer ids, display names, private reasons, signal payloads, tokens, pairing codes, raw protocol data, raw WebSocket close reason text, or stale `expiresAt` metadata

#### Scenario: Viewer status print safety boundary
- **WHEN** viewer status print mode is configured, starts, fires, fails, or is skipped
- **THEN** it MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, hide the session from the host, reconnect peers, suppress host visibility, invoke host controls, or bypass consent workflows

### Requirement: Viewer local disconnect CLI validation
The agent shell SHALL reject malformed, host-mode, or ambiguous viewer local disconnect CLI configuration before starting the runtime. Viewer local disconnect validation SHALL allow exact integer millisecond delay values from `0` through `2147483647` only for viewer runtimes. Viewer local disconnect configuration MUST NOT require requested permissions or active authorization because it closes only the local viewer connection.

#### Scenario: Viewer local disconnect delay is exact
- **WHEN** the agent shell is started with `--viewer-disconnect-after-ms`
- **THEN** the value MUST be an exact integer millisecond delay from `0` through `2147483647`

#### Scenario: Viewer local disconnect is viewer-only
- **WHEN** a host shell is started with `--viewer-disconnect-after-ms 0`
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Viewer local disconnect does not require requested permissions
- **WHEN** a viewer shell is started with `--viewer-disconnect-after-ms 0` without `--request`
- **THEN** CLI validation succeeds and the runtime MAY start normally

### Requirement: Viewer local disconnect CLI behavior
The viewer agent shell SHALL support an opt-in development local disconnect that stops the local viewer runtime after the configured delay. The disconnect MUST close only the viewer's local relay connection and MUST NOT invoke host lifecycle controls, construct or send `peer-disconnected`, emit workflow audit events, grant permissions, start signaling, change authorization lifecycle state, or expose screen, input, clipboard, file-transfer, diagnostics, token, pairing, credential, private-reason, display-name, signal-payload, or raw protocol data.

#### Scenario: Viewer local disconnect closes viewer transport
- **WHEN** viewer local disconnect mode fires while the viewer runtime is connected
- **THEN** the viewer runtime closes its local relay connection
- **AND** it MUST NOT emit authorization, lifecycle, signal, control, `peer-disconnected`, or workflow audit messages because of the local disconnect

#### Scenario: Relay notifies host about viewer disconnect
- **WHEN** a host and viewer are paired through the development relay
- **AND** viewer local disconnect mode closes the viewer connection
- **THEN** the host receives a relay-originated `peer-disconnected` notice for the viewer
- **AND** that notice MUST NOT grant permissions, start capture, send input, reconnect peers, suppress host visibility, or bypass consent workflows

#### Scenario: Viewer local disconnect safety boundary
- **WHEN** viewer local disconnect mode is configured, starts, fires, fails, or is skipped
- **THEN** it MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, hide the session from the host, invoke host controls, or bypass consent workflows

### Requirement: Viewer status reflects trusted remote disconnect
The managed viewer agent shell runtime SHALL report inactive local viewer status after it records trusted remote host disconnect state. The status snapshot MUST keep optional bounded authorization id/status metadata and the bounded relay-defined remote disconnect reason code when available, but MUST report `visibleToHost: false` and permission count `0`. Reading status after disconnect MUST NOT send protocol messages, emit workflow audit events, grant permissions, start signaling, invoke host controls, reconnect peers, or change authorization lifecycle state.

#### Scenario: Viewer status is inactive after host disconnect
- **WHEN** a viewer runtime has active visible authorization
- **AND** it records a trusted relay-originated `peer-disconnected` notice for the observed host
- **THEN** the viewer status snapshot reports inactive local state, `visibleToHost: false`, and permission count `0`
- **AND** it preserves optional authorization id/status metadata from the last local viewer authorization
- **AND** it includes only the bounded relay-defined disconnect reason code from the trusted notice

#### Scenario: Viewer status read after disconnect remains local
- **WHEN** a viewer runtime reads status after recording trusted host disconnect state
- **THEN** it MUST NOT emit authorization, lifecycle, signal, control, `peer-disconnected`, or workflow audit messages because of the status read

### Requirement: Host disconnect reason validation
The agent shell SHALL support an optional host-local disconnect reason for host disconnect simulation and managed direct host disconnect control. The reason MUST use the same canonical workflow reason validation as other lifecycle reasons and MUST additionally fit the WebSocket close reason frame budget: non-blank, already trimmed, at most 240 characters, at most 123 UTF-8 bytes, no ASCII control characters, and no Unicode bidirectional or zero-width formatting controls including `U+FEFF`. The reason MUST be host-only and MUST NOT make disconnect valid before visible active or paused host authorization.

#### Scenario: Host disconnect reason is accepted for host disconnect simulation
- **WHEN** a host shell is started with a valid `--disconnect-after-ms` value and a valid `--disconnect-reason` value
- **THEN** argument parsing constructs bounded runtime disconnect delay and reason options
- **AND** the existing visible authorization gate remains required before the host WebSocket is closed

#### Scenario: Host disconnect reason is rejected for viewer runtimes
- **WHEN** a viewer shell is started with `--disconnect-reason`
- **THEN** argument parsing MUST fail before the runtime starts or connects to a relay

#### Scenario: Host disconnect reason rejects unsafe text
- **WHEN** CLI or direct runtime options include a disconnect reason that is blank, untrimmed, over the character or UTF-8 byte bound, contains an ASCII control character, or contains a Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** the shell MUST reject it before opening a relay connection, closing a WebSocket, sending a protocol message, emitting a trusted sent event, or writing a disconnect audit record

### Requirement: Host disconnect reason remains local metadata
The host disconnect reason SHALL be used only as the local host WebSocket close reason for host-local disconnect. Raw host disconnect reason text MUST NOT be sent as a protocol message, persisted in host workflow audit records, logged as raw text, exposed in local runtime event payloads, grant permissions, start capture, send input, reconnect peers, suppress host visibility, or bypass consent workflows. Host workflow audit records MAY persist only bounded boolean metadata that a host disconnect reason was configured.

#### Scenario: Disconnect close diagnostics redact reason text
- **WHEN** host disconnect simulation or direct host disconnect control closes the local host WebSocket with a configured disconnect reason
- **THEN** local closed events expose redacted close reason text and safe byte length only
- **AND** logs and local runtime events MUST NOT contain the raw configured disconnect reason

#### Scenario: Disconnect audit remains reason-free
- **WHEN** the host shell persists an `agent-shell.session.disconnected` audit record after local host disconnect with a configured disconnect reason
- **THEN** the audit record contains bounded lifecycle metadata such as authorization id/status, cause, visible flag, permission count, and `reasonConfigured: true`
- **AND** it MUST NOT contain the raw configured disconnect reason

### Requirement: Viewer control prompt CLI validation
The agent shell SHALL support an opt-in `--viewer-control-prompt true|false` CLI flag for viewer runtimes. Viewer control prompt configuration MUST be rejected before runtime startup when it is malformed, supplied for a host runtime, or enabled together with one-shot viewer status or viewer local disconnect timers. Viewer control prompt configuration MUST NOT require requested permissions or active authorization at startup because `help`, `status`, and `disconnect` remain valid local commands without input permission. Input commands entered after startup MUST fail closed at command time unless the viewer currently has active visible authorization with the required `input:pointer` or `input:keyboard` permission.

#### Scenario: Viewer control prompt is accepted for viewer runtimes
- **WHEN** a viewer shell is started with `--viewer-control-prompt true`
- **THEN** CLI validation succeeds and the runtime MAY start normally
- **AND** the prompt does not require `--request` at startup

#### Scenario: Viewer control prompt is rejected for host runtimes
- **WHEN** a host shell is started with `--viewer-control-prompt true`
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Viewer control prompt rejects ambiguous one-shot helpers
- **WHEN** a viewer shell is started with `--viewer-control-prompt true` and either `--viewer-status-after-ms` or `--viewer-disconnect-after-ms`
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Viewer control prompt input command lacks authorization
- **WHEN** viewer control prompt mode receives an input command before the viewer has active visible authorization with the matching input permission
- **THEN** the command fails closed before local sent event emission, socket write, host input application, native adapter calls, reconnection, hidden session behavior, or consent bypass
- **AND** prompt output MUST remain metadata-only and MUST NOT echo the raw command line

### Requirement: Viewer control prompt local commands
The interactive viewer control prompt SHALL accept only exact `status`, `disconnect`, and bounded one-event input command lines. The `status` command MUST print the existing bounded viewer status snapshot, including optional authorization expiration metadata while active or paused, and MUST NOT invoke lifecycle controls or public sends. The `disconnect` command MUST stop only the local viewer runtime and MUST NOT construct or send `peer-disconnected`, lifecycle, signal, control, input, or workflow audit messages. Input commands MUST represent exactly one protocol-supported pointer or keyboard event and MUST send it only through the managed runtime `sendInputEvent()` path after reading current viewer status with an active visible authorization id. Malformed commands MUST be rejected without echoing raw command text.

Accepted input command forms are:

- `pointer-move <x> <y>`
- `pointer-down <x> <y> <primary|secondary|middle|back|forward>`
- `pointer-up <x> <y> <primary|secondary|middle|back|forward>`
- `pointer-wheel <x> <y> <deltaX> <deltaY>`
- `key-down <KeyName> [alt,control,meta,shift]`
- `key-up <KeyName> [alt,control,meta,shift]`

Pointer coordinates MUST be finite normalized decimal values from `0` through `1`. Wheel deltas MUST be exact bounded integers and at least one delta MUST be non-zero. Keyboard names MUST be supported protocol key names, and modifiers MUST be unique exact comma-separated modifier tokens. The prompt MUST NOT accept free-form text buffers, paste payloads, command macros, raw JSON, or repeated-key capture.

#### Scenario: Viewer control prompt prints status
- **WHEN** viewer control prompt mode receives exact command `status`
- **THEN** it prints bounded local viewer status metadata with state, visible flag, permission count, optional authorization id/status, optional authorization expiration timestamp for active or paused authorization, optional relay-defined remote disconnect reason code after trusted remote host disconnect, and optional local inactive cause after explicit viewer local leave or local viewer socket close
- **AND** it does not invoke host lifecycle controls, viewer local disconnect, or public runtime sends

#### Scenario: Viewer control prompt disconnects locally
- **WHEN** viewer control prompt mode receives exact command `disconnect`
- **THEN** it stops the local viewer runtime
- **AND** it MUST NOT emit authorization, lifecycle, signal, control, input, `peer-disconnected`, or workflow audit messages because of the command

#### Scenario: Viewer control prompt sends pointer input
- **WHEN** viewer control prompt mode receives an exact pointer input command while the current viewer status is active and visible with an authorization id that grants `input:pointer`
- **THEN** it invokes the managed runtime input send path with one pointer event bound to that authorization id
- **AND** the runtime's existing routing, permission, socket, disconnect, audit-before-send, and redaction gates remain authoritative
- **AND** prompt output MUST NOT expose pointer coordinates, button values, raw command text, tokens, pairing codes, credentials, private reasons, or full secrets

#### Scenario: Viewer control prompt sends keyboard input
- **WHEN** viewer control prompt mode receives an exact keyboard input command while the current viewer status is active and visible with an authorization id that grants `input:keyboard`
- **THEN** it invokes the managed runtime input send path with one keyboard event bound to that authorization id
- **AND** the runtime's existing routing, permission, socket, disconnect, audit-before-send, and redaction gates remain authoritative
- **AND** prompt output MUST NOT expose key values, modifier values, raw command text, keylogging buffers, tokens, pairing codes, credentials, private reasons, or full secrets

#### Scenario: Viewer control prompt rejects malformed commands
- **WHEN** viewer control prompt mode receives whitespace-padded, case-varied, suffixed, unknown, unsupported-button, duplicate-modifier, unsafe-coordinate, unsafe-delta, free-form-text, macro-shaped, or raw-JSON command input
- **THEN** it rejects the command before reading runtime status, stopping the runtime, invoking host lifecycle controls, sending input, or sending protocol messages
- **AND** prompt output MUST NOT echo the raw command line

#### Scenario: Viewer control prompt input send fails
- **WHEN** viewer control prompt mode receives a syntactically valid input command but runtime authorization, routing, socket, disconnect, audit, or send gates reject it
- **THEN** the prompt reports only sanitized bounded failure metadata and continues accepting later valid commands
- **AND** it MUST NOT expose pointer coordinates, button values, key values, modifier values, raw command text, keylogging buffers, tokens, pairing codes, credentials, private reasons, command output, or full secrets

#### Scenario: Viewer control prompt safety boundary
- **WHEN** viewer control prompt mode starts, accepts a command, rejects a command, fails, or stops
- **THEN** it MUST NOT capture keyboard input outside exact submitted command lines, start screen capture, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, hide the session from the host, reconnect peers, invoke host controls, suppress host visibility, or bypass consent workflows
- **AND** input commands MUST NOT send more than one protocol input event per accepted command

### Requirement: Managed viewer local leave control
The managed agent shell runtime SHALL expose an explicit viewer-only local leave operation. The leave operation MUST close only the local viewer relay connection, clear connection-scoped local viewer authorization state, and MUST NOT require requested permissions or active authorization. It MUST NOT invoke host lifecycle controls, construct or send `peer-disconnected`, emit workflow audit events, grant permissions, start signaling, change host authorization lifecycle state, reconnect peers, or expose screen, input, clipboard, file-transfer, diagnostics, token, pairing, credential, private-reason, display-name, signal-payload, or raw protocol data.

#### Scenario: Viewer leave closes local transport
- **WHEN** a viewer runtime invokes local leave while connected
- **THEN** the viewer runtime closes its local relay connection
- **AND** it MUST NOT emit authorization, lifecycle, signal, control, `peer-disconnected`, or workflow audit messages because of the local leave

#### Scenario: Viewer status after local leave is inactive
- **WHEN** a viewer runtime has active visible authorization
- **AND** local leave closes the viewer connection
- **THEN** the viewer status snapshot reports inactive local state, `visibleToHost: false`, permission count `0`, and a bounded local inactive cause
- **AND** it MUST NOT include optional authorization id or authorization status metadata from the left connection scope
- **AND** reading status after leave MUST NOT send protocol messages, emit workflow audit events, grant permissions, start signaling, invoke host controls, reconnect peers, or change authorization lifecycle state

#### Scenario: Viewer leave is viewer-only
- **WHEN** a host runtime invokes local leave
- **THEN** the runtime rejects the request without closing the host transport, sending protocol messages, changing host authorization state, deactivating the host indicator, or writing audit records

#### Scenario: Viewer CLI helpers use local leave
- **WHEN** scheduled viewer local disconnect or viewer control prompt `disconnect` fires
- **THEN** it invokes the managed viewer local leave operation
- **AND** the same viewer-only and no-forged-message safety boundary applies

### Requirement: Host control prompt help command
The interactive host control prompt SHALL support an exact read-only `help`
command. The help command MUST print only a bounded static list of accepted host
control prompt commands, including the exact MVP revoke command forms
`revoke screen:view`, `revoke input:pointer`, and `revoke input:keyboard`, and
MUST NOT widen the accepted permission vocabulary beyond existing host control
parser validation. The help command MUST NOT call runtime status snapshots,
pause, resume, revoke, terminate, disconnect, viewer leave, public send, or any
direct protocol-construction path. Help output MUST remain secret-safe and MUST
NOT echo raw command lines, permission names beyond the literal documented
accepted command forms, peer ids, display names, private reasons, protocol
payloads, tokens, pairing codes, signal payloads, keystrokes, screenshots,
screen contents, clipboard contents, file-transfer contents, diagnostics dumps,
or input contents.

#### Scenario: Host control prompt prints help
- **WHEN** host control prompt mode receives exact command `help`
- **THEN** it prints a bounded static help line listing exact accepted commands
- **AND** the help line includes `revoke screen:view`, `revoke input:pointer`,
  and `revoke input:keyboard`
- **AND** it does not read runtime status, invoke host lifecycle controls,
  invoke viewer leave, or call public runtime sends

#### Scenario: Host control prompt rejects malformed help commands
- **WHEN** host control prompt mode receives whitespace-padded, case-varied, or suffixed help input
- **THEN** it rejects the command before reading runtime status, invoking any managed runtime control, invoking viewer leave, or sending protocol messages
- **AND** prompt output MUST NOT echo the raw command line

#### Scenario: Host help command safety boundary
- **WHEN** host help command starts, succeeds, fails, or is rejected
- **THEN** it MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, hide the session from the host, reconnect peers, suppress host visibility, or bypass consent workflows

### Requirement: Viewer control prompt help command
The interactive viewer control prompt SHALL support an exact read-only `help` command. The help command MUST print only a bounded static list of accepted viewer control prompt command forms and MUST NOT call runtime status snapshots, viewer leave, host lifecycle controls, input sends, public send, or any direct protocol-construction path. Help output MUST remain secret-safe and MUST NOT echo raw command lines, peer ids, display names, private reasons, protocol payloads, tokens, pairing codes, signal payloads, permission names, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, input contents, pointer coordinates, button values, key values, modifier values, or full secrets.

#### Scenario: Viewer control prompt prints help
- **WHEN** viewer control prompt mode receives exact command `help`
- **THEN** it prints a bounded static help line listing exact accepted command forms
- **AND** it does not read runtime status, invoke viewer leave, invoke host lifecycle controls, call input sends, or call public runtime sends

#### Scenario: Viewer control prompt rejects malformed help commands
- **WHEN** viewer control prompt mode receives whitespace-padded, case-varied, or suffixed help input
- **THEN** it rejects the command before reading runtime status, invoking viewer leave, invoking host lifecycle controls, sending input, or sending protocol messages
- **AND** prompt output MUST NOT echo the raw command line

#### Scenario: Viewer help command safety boundary
- **WHEN** viewer help command starts, succeeds, fails, or is rejected
- **THEN** it MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, hide the session from the host, reconnect peers, suppress host visibility, invoke host controls, or bypass consent workflows

### Requirement: Viewer status reflects local socket close
The managed viewer agent shell runtime SHALL report inactive local viewer status after the local viewer WebSocket closes without an explicit viewer local leave and without a trusted remote host disconnect already being recorded. The status snapshot MUST expose only bounded local inactive cause metadata, MUST report `visibleToHost: false` and permission count `0`, and MUST NOT preserve authorization id/status metadata from the closed local connection scope. Reading status after local socket close MUST NOT send protocol messages, emit workflow audit events, grant permissions, start signaling, invoke host controls, reconnect peers, or change authorization lifecycle state.

#### Scenario: Viewer status is inactive after local socket close
- **WHEN** a viewer runtime has active visible authorization
- **AND** the local viewer WebSocket closes without an explicit viewer local leave
- **AND** the viewer has not recorded trusted remote host disconnect state
- **THEN** the viewer status snapshot reports inactive local state, `visibleToHost: false`, permission count `0`, and bounded local inactive cause `socket-closed`
- **AND** it MUST NOT include authorization id/status metadata from the closed local connection scope or a remote disconnect reason code

#### Scenario: Viewer status read after local socket close remains local
- **WHEN** a viewer runtime reads status after local socket close
- **THEN** it MUST NOT emit authorization, lifecycle, signal, control, `peer-disconnected`, or workflow audit messages because of the status read

#### Scenario: Trusted remote disconnect metadata is not overwritten by socket close
- **WHEN** a viewer runtime has recorded trusted remote host disconnect state
- **AND** the local viewer WebSocket later closes
- **THEN** the viewer status snapshot preserves the trusted remote disconnect status semantics instead of replacing them with local socket-close cause metadata

### Requirement: Agent-shell rejects secret-bearing workflow reasons
The agent shell SHALL reject CLI and direct runtime workflow reason options that contain secret-bearing metadata before relay connection, socket write, local trusted `sent` event emission, workflow audit emission, or host workflow simulation. Secret-bearing metadata MUST include raw token, credential, password, passphrase, pairing-code, API-key, authorization-header, auth-header, cookie, private-key, SSH-key, keystroke, screenshot, screen-data, screen-content, clipboard-content, file-transfer content/data/bytes, diagnostics content/dump, or secret markers when they appear with values. Rejection diagnostics, usage output, runtime events, and logs MUST NOT expose the raw reason text.

#### Scenario: CLI workflow reason contains secret-bearing metadata
- **WHEN** the agent-shell CLI is started with `--revoke-reason`, `--pause-reason`, `--resume-reason`, `--terminate-reason`, or `--disconnect-reason` containing secret-bearing metadata
- **THEN** argument parsing fails before the runtime starts or connects to a relay
- **AND** usage handling does not expose the raw reason text

#### Scenario: Direct runtime workflow reason contains secret-bearing metadata
- **WHEN** direct managed runtime options include a decision, revoke, pause, resume, terminate, or disconnect reason containing secret-bearing metadata
- **THEN** the runtime rejects the options before opening a relay connection or sending any workflow message
- **AND** thrown errors, runtime events, and logs do not expose the raw reason text

#### Scenario: Safe agent-shell workflow reason remains accepted
- **WHEN** CLI or direct runtime workflow options use concise non-secret reason text
- **THEN** agent-shell validation accepts the reason when all other consent, visibility, authorization, and role invariants are valid

### Requirement: Agent-shell rejects secret-bearing display names
The agent shell SHALL reject CLI, direct runtime, inbound `hello`, and public-send `hello` display-name values that contain secret-bearing metadata before opening a relay connection, sending `join-session`, sending `hello`, emitting trusted local protocol events, writing workflow audit records, running consent workflow handling, or rendering host-facing consent prompt identity metadata. Secret-bearing metadata MUST include raw token, credential, password, passphrase, pairing-code, API-key, authorization-header, auth-header, cookie, private-key, SSH-key, keystroke, screenshot, screen-data, screen-content, clipboard-content, file-transfer content/data/bytes, diagnostics content/dump, or secret markers when they appear with values. Rejection diagnostics, runtime events, logs, usage output, and audit records MUST NOT expose the raw display-name text.

#### Scenario: CLI display name contains secret-bearing metadata
- **WHEN** the agent-shell CLI is started with `--name` containing secret-bearing metadata
- **THEN** argument parsing fails before the runtime starts or connects to a relay
- **AND** usage handling does not expose the raw display-name text

#### Scenario: Direct runtime display name contains secret-bearing metadata
- **WHEN** caller code creates a managed runtime with a display name containing secret-bearing metadata
- **THEN** the runtime rejects the options before opening a relay connection or sending any protocol message
- **AND** thrown errors, runtime events, logs, and audit records do not expose the raw display-name text

#### Scenario: Inbound hello display name contains secret-bearing metadata
- **WHEN** the runtime receives a `hello`-shaped payload whose display name contains secret-bearing metadata
- **THEN** it treats the input as malformed raw protocol data before trusted local events or workflow handling
- **AND** runtime events and logs do not expose the raw display-name text

#### Scenario: Public hello display name contains secret-bearing metadata
- **WHEN** caller code invokes public runtime `send()` with a same-session `hello` whose display name contains secret-bearing metadata
- **THEN** the runtime rejects the send before socket write or trusted local `sent` events
- **AND** thrown errors, runtime events, and logs do not expose the raw display-name text

#### Scenario: Safe agent-shell display name remains accepted
- **WHEN** CLI or direct runtime options use a concise non-secret display name
- **THEN** agent-shell validation accepts the display name when all other consent, visibility, authorization, and role invariants are valid

### Requirement: Agent-shell rejects clipboard permission scopes

The agent shell SHALL reject clipboard permissions, including `clipboard:read`
and `clipboard:write`, in CLI requested permissions, CLI host grant scopes, CLI
revoke permission options, direct runtime requested permissions, direct runtime
host grant scopes, and direct runtime revoke permission options before opening a
relay connection, sending protocol messages, activating host visibility, or
emitting trusted workflow events.

#### Scenario: CLI requests clipboard permission

- **WHEN** the agent-shell CLI is started with `--request clipboard:read` or `--request clipboard:write`
- **THEN** argument parsing fails before the runtime starts or connects to a relay
- **AND** usage handling MUST NOT approve authorization, activate host visibility, expose clipboard contents, start capture, send input, or bypass consent workflows

#### Scenario: CLI host grant names clipboard permission

- **WHEN** the agent-shell CLI is started with `--grant clipboard:read` or `--grant clipboard:write`
- **THEN** argument parsing fails before the runtime starts or connects to a relay

#### Scenario: CLI revoke names clipboard permission

- **WHEN** the agent-shell CLI is started with `--revoke-permission clipboard:read` or `--revoke-permission clipboard:write`
- **THEN** argument parsing fails before the runtime starts or connects to a relay

#### Scenario: Runtime options name clipboard permission

- **WHEN** caller code creates a managed runtime with clipboard permissions in requested permissions, host grant scope, or revoke permission
- **THEN** runtime creation fails before opening a relay connection or sending any protocol message
- **AND** thrown errors, runtime events, and logs MUST NOT expose clipboard contents

### Requirement: Agent-shell rejects file-transfer permission scope

The agent shell SHALL reject `file-transfer` in CLI requested permissions, CLI
host grant scopes, CLI revoke permission options, direct runtime requested
permissions, direct runtime host grant scopes, direct runtime revoke permission
options, and interactive host control revoke commands before opening a relay
connection, sending protocol messages, activating host visibility, invoking
managed host controls, or emitting trusted workflow events.

#### Scenario: CLI requests file-transfer permission

- **WHEN** the agent-shell CLI is started with `--request file-transfer`
- **THEN** argument parsing fails before the runtime starts or connects to a relay
- **AND** usage handling MUST NOT approve authorization, activate host visibility, expose file contents, transfer files, start capture, send input, or bypass consent workflows

#### Scenario: CLI host grant names file-transfer permission

- **WHEN** the agent-shell CLI is started with `--grant file-transfer`
- **THEN** argument parsing fails before the runtime starts or connects to a relay

#### Scenario: CLI revoke names file-transfer permission

- **WHEN** the agent-shell CLI is started with `--revoke-permission file-transfer`
- **THEN** argument parsing fails before the runtime starts or connects to a relay

#### Scenario: Runtime options name file-transfer permission

- **WHEN** caller code creates a managed runtime with `file-transfer` in requested permissions, host grant scope, or revoke permission
- **THEN** runtime creation fails before opening a relay connection or sending any protocol message
- **AND** thrown errors, runtime events, and logs MUST NOT expose file contents or file-transfer payloads

#### Scenario: Host control prompt names file-transfer permission

- **WHEN** the interactive host control prompt receives `revoke file-transfer`
- **THEN** command parsing rejects the line before invoking managed host controls
- **AND** output MUST NOT echo the raw command line or imply a file-transfer permission exists

### Requirement: Agent-shell rejects diagnostics permission scope

The agent shell SHALL reject diagnostics-shaped permissions, including
`diagnostics:view`, in CLI requested permissions, CLI host grant scopes, CLI
revoke permission options, direct runtime requested permissions, direct runtime
host grant scopes, direct runtime revoke permission options, and interactive
host control revoke commands before opening a relay connection, sending protocol
messages, activating host visibility, invoking managed host controls, or
emitting trusted workflow events.

#### Scenario: CLI requests diagnostics permission

- **WHEN** the agent-shell CLI is started with `--request diagnostics:view`
- **THEN** argument parsing fails before the runtime starts or connects to a relay
- **AND** usage handling MUST NOT approve authorization, activate host visibility, expose diagnostics, start capture, send input, or bypass consent workflows

#### Scenario: CLI host grant names diagnostics permission

- **WHEN** the agent-shell CLI is started with `--grant diagnostics:view`
- **THEN** argument parsing fails before the runtime starts or connects to a relay

#### Scenario: CLI revoke names diagnostics permission

- **WHEN** the agent-shell CLI is started with `--revoke-permission diagnostics:view`
- **THEN** argument parsing fails before the runtime starts or connects to a relay

#### Scenario: Runtime options name diagnostics permission

- **WHEN** caller code creates a managed runtime with `diagnostics:view` in requested permissions, host grant scope, or revoke permission
- **THEN** runtime creation fails before opening a relay connection or sending any protocol message
- **AND** thrown errors, runtime events, and logs MUST NOT expose diagnostics contents or dumps

#### Scenario: Host control prompt names diagnostics permission

- **WHEN** the interactive host control prompt receives `revoke diagnostics:view`
- **THEN** command parsing rejects the line before invoking managed host controls
- **AND** output MUST NOT echo the raw command line or imply a diagnostics permission exists

### Requirement: Host control prompt stops after successful disconnect

The interactive host control prompt SHALL stop accepting further command input
after an exact `disconnect` command successfully invokes the managed host
runtime disconnect control. Prompt shutdown MUST be local to the CLI prompt and
MUST NOT send additional protocol messages, invoke other lifecycle controls,
emit workflow audit events, reconnect peers, suppress host visibility, grant
permissions, start capture, send input, sync clipboard, transfer files, expose
diagnostics, install services, configure startup persistence, collect
credentials, hide the session from the host, or bypass consent workflows. If
the managed runtime disconnect control fails, the prompt MUST report the
sanitized error through the existing CLI error formatter and continue accepting
valid commands.

#### Scenario: Successful host disconnect stops prompt

- **WHEN** host control prompt mode receives exact command `disconnect`
- **AND** the managed runtime disconnect control returns successfully
- **THEN** the prompt stops accepting further command input
- **AND** prompt shutdown does not invoke pause, resume, revoke, terminate,
  status, viewer leave, public runtime sends, or direct protocol construction

#### Scenario: Failed host disconnect keeps prompt available

- **WHEN** host control prompt mode receives exact command `disconnect`
- **AND** the managed runtime disconnect control rejects or throws
- **THEN** the prompt reports a sanitized CLI error
- **AND** the prompt remains available for later exact valid commands such as
  `status`
- **AND** output MUST NOT echo the raw command line or expose private reasons,
  protocol payloads, tokens, pairing codes, signal payloads, keystrokes,
  screenshots, screen contents, clipboard contents, file-transfer contents,
  diagnostics dumps, or input contents

### Requirement: Viewer control prompt stops after successful disconnect

The interactive viewer control prompt SHALL stop accepting further command
input after an exact `disconnect` command successfully invokes the managed
viewer local leave control. Prompt shutdown MUST be local to the CLI prompt and
MUST NOT send additional protocol messages, invoke host lifecycle controls,
emit workflow audit events, reconnect peers, suppress host visibility, grant
permissions, start capture, send input, sync clipboard, transfer files, expose
diagnostics, install services, configure startup persistence, collect
credentials, hide the session from the host, or bypass consent workflows. If
the managed viewer local leave control fails, the prompt MUST report the
sanitized error through the existing CLI error formatter and continue accepting
valid commands.

#### Scenario: Successful viewer disconnect stops prompt

- **WHEN** viewer control prompt mode receives exact command `disconnect`
- **AND** the managed viewer local leave control returns successfully
- **THEN** the prompt stops accepting further command input
- **AND** prompt shutdown does not invoke status, host pause, host resume, host
  revoke, host terminate, host disconnect, public runtime sends, or direct
  protocol construction

#### Scenario: Failed viewer disconnect keeps prompt available

- **WHEN** viewer control prompt mode receives exact command `disconnect`
- **AND** the managed viewer local leave control rejects or throws
- **THEN** the prompt reports a sanitized CLI error
- **AND** the prompt remains available for later exact valid commands such as
  `status`
- **AND** output MUST NOT echo the raw command line or expose private reasons,
  protocol payloads, tokens, pairing codes, signal payloads, keystrokes,
  screenshots, screen contents, clipboard contents, file-transfer contents,
  diagnostics dumps, or input contents

### Requirement: Host control prompt stops after successful terminate

The interactive host control prompt SHALL stop accepting further command input
after an exact `terminate` command successfully invokes the managed host
runtime termination control. Prompt shutdown MUST be local to the CLI prompt
and MUST NOT send additional protocol messages, invoke other lifecycle
controls, emit additional workflow audit events, reconnect peers, suppress
host visibility, grant permissions, start capture, send input, sync clipboard,
transfer files, expose diagnostics, install services, configure startup
persistence, collect credentials, hide the session from the host, or bypass
consent workflows. If the managed runtime termination control fails, the prompt
MUST report the sanitized error through the existing CLI error formatter and
continue accepting valid commands.

#### Scenario: Successful host terminate stops prompt

- **WHEN** host control prompt mode receives exact command `terminate`
- **AND** the managed runtime termination control returns successfully
- **THEN** the prompt stops accepting further command input
- **AND** prompt shutdown does not invoke status, pause, resume, revoke,
  disconnect, viewer leave, public runtime sends, or direct protocol
  construction

#### Scenario: Failed host terminate keeps prompt available

- **WHEN** host control prompt mode receives exact command `terminate`
- **AND** the managed runtime termination control rejects or throws
- **THEN** the prompt reports a sanitized CLI error
- **AND** the prompt remains available for later exact valid commands such as
  `status`
- **AND** output MUST NOT echo the raw command line or expose private reasons,
  protocol payloads, tokens, pairing codes, signal payloads, keystrokes,
  screenshots, screen contents, clipboard contents, file-transfer contents,
  diagnostics dumps, or input contents

### Requirement: Host status CLI validation

The agent shell SHALL reject malformed, viewer-mode, or host-control-prompt-conflicting host status CLI configuration before starting the runtime. Host status validation SHALL allow exact integer millisecond delay values from `0` through `2147483647` only for host runtimes. Host status configuration MUST NOT require requested permissions because the scheduled status read only reads local host status metadata. Host status one-shot mode MUST be rejected when interactive host control prompt mode is enabled. Host status one-shot mode MAY be combined with ordinary host runtime startup, consent, and lifecycle simulation options; those options retain their existing protocol, audit, and lifecycle behavior and MUST NOT be widened by the status print.

#### Scenario: Host status delay is exact
- **WHEN** the agent shell is started with `--host-status-after-ms`
- **THEN** the value MUST be an exact integer millisecond delay from `0` through `2147483647`

#### Scenario: Host status is host-only
- **WHEN** a viewer shell is started with `--host-status-after-ms 0`
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Host status does not require requested permissions
- **WHEN** a host shell is started with `--host-status-after-ms 0` without `--request`
- **THEN** CLI validation succeeds and the runtime MAY start normally

#### Scenario: Host status is mutually exclusive with host control prompt
- **WHEN** a host shell is started with both `--host-status-after-ms 0` and `--host-control-prompt true`
- **THEN** it exits through bounded usage handling before connecting to the relay, opening an interactive control prompt, invoking host controls, or sending any protocol message

#### Scenario: Host status may accompany ordinary host workflow options
- **WHEN** a host shell is started with `--host-status-after-ms 0` plus existing host consent, visible-session, or lifecycle simulation options
- **THEN** CLI validation MAY succeed when each option is otherwise valid
- **AND** those existing options retain their existing protocol, audit, and lifecycle behavior without being expanded by the host status print

### Requirement: Host status CLI output
The host agent shell SHALL support an opt-in development status print that calls the managed runtime `getHostStatus()` snapshot after the configured delay. The scheduled status read MUST expose only bounded local lifecycle metadata: local indicator state, visible host-session flag, action-capable permission count, optional authorization id/status, optional authorization expiration timestamp for active or paused authorization, optional viewer device id/platform bound at approval time for the current viewer authorization scope, optional local inactive indicator cause, and optional relay-defined remote disconnect reason code after trusted remote viewer disconnect. The scheduled status read MUST NOT send protocol messages, emit workflow audit events, grant permissions, change authorization lifecycle state, start signaling, reconnect peers, invoke host controls, or expose viewer display names, viewer peer ids, remote self-asserted trust-level metadata, screen contents, input contents, clipboard contents, file-transfer contents, diagnostics content, tokens, pairing codes, credentials, private reasons, signal payloads, raw protocol data, or raw WebSocket close reason text. Ordinary host runtime startup and other explicit host workflow options remain governed by their existing requirements and are not introduced by the scheduled status read.

#### Scenario: Host status print before active authorization
- **WHEN** host status print mode fires before the host has emitted active visible authorization
- **THEN** it prints a bounded local host status line with inactive state, `visibleToHost=false`, and permission count `0`
- **AND** it omits viewer device id/platform metadata

#### Scenario: Host status print after active authorization includes device context
- **WHEN** host status print mode fires after active visible authorization
- **AND** the host status snapshot contains authorization-bound viewer device id/platform metadata
- **THEN** it prints bounded active host status metadata with visible flag, permission count, optional authorization id, optional authorization status, optional authorization expiration timestamp, and the viewer device id/platform
- **AND** it MUST NOT print viewer display name, viewer peer id, remote self-asserted trust-level metadata, screen contents, input contents, tokens, pairing codes, credentials, raw protocol data, or private reasons

#### Scenario: Host status print after disconnect omits stale device context
- **WHEN** host status print mode fires after the host has recorded trusted remote viewer disconnect state
- **THEN** it prints bounded inactive host status metadata with `visibleToHost=false`, permission count `0`, local inactive cause `peer-disconnected`, and the relay-defined remote disconnect reason code
- **AND** it omits viewer device id/platform metadata

#### Scenario: Host status print catches runtime status failure
- **WHEN** host status print mode catches a runtime status failure
- **THEN** it prints only a bounded sanitized CLI error
- **AND** the output MUST NOT expose raw exception text, tokens, pairing codes, credentials, private reasons, screen contents, input contents, clipboard contents, file-transfer contents, diagnostics dumps, raw protocol payloads, or full secrets

#### Scenario: Host status print remains read-only
- **WHEN** host status print mode is scheduled, fires, succeeds, fails, or is stopped
- **THEN** it MUST NOT invoke host controls, send public runtime messages, send protocol messages, emit workflow audit events, grant permissions, start signaling, reconnect peers, start capture, send input, or bypass consent workflows

### Requirement: Viewer runtimes reject host workflow configuration

The agent shell SHALL reject host-only consent, visibility, status, control, acknowledgement, and lifecycle workflow configuration on viewer runtimes before starting the runtime, opening a relay connection, sending protocol messages, scheduling host workflow timers, activating host visibility, invoking host controls, or emitting workflow audit events. Host-only CLI configuration MUST include explicit `--host-decision`, `--host-consent-prompt`, `--host-consent-timeout-ms`, `--host-control-prompt`, `--host-status-after-ms`, `--host-signal-probe-ack`, `--visible-session`, `--authorization-ttl-ms`, `--grant`, `--revoke-after-ms`, `--revoke-permission`, `--revoke-reason`, `--pause-after-ms`, `--pause-reason`, `--resume-after-ms`, `--resume-reason`, `--terminate-after-ms`, `--terminate-reason`, `--disconnect-after-ms`, and `--disconnect-reason` options. Direct viewer runtime construction MUST reject host workflow state that attempts to configure static host approval or denial, host-visible active state, authorization TTL, host lifecycle timers, host revocation, or host workflow reasons. Rejection diagnostics MUST remain bounded and MUST NOT expose raw user-provided option values, protocol payloads, tokens, pairing codes, credentials, private reasons, screen contents, input contents, clipboard contents, file-transfer contents, diagnostics dumps, or full secrets.

#### Scenario: Viewer CLI rejects explicit host workflow option

- **WHEN** the agent shell is started as a viewer with an explicit host workflow option such as `--pause-after-ms`, `--terminate-reason`, `--host-decision`, `--visible-session`, or `--host-consent-prompt`
- **THEN** it exits through bounded usage handling before creating the managed runtime, connecting to the relay, sending join, hello, authorization, lifecycle, signal, control, or audit messages, scheduling workflow timers, activating host visibility, or invoking host controls

#### Scenario: Viewer CLI rejects explicit host no-op option

- **WHEN** the agent shell is started as a viewer with an explicit host-scoped no-op value such as `--host-decision none`, `--host-consent-prompt false`, `--host-control-prompt false`, `--host-signal-probe-ack false`, or `--visible-session false`
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Direct viewer runtime rejects host workflow state

- **WHEN** caller code creates a viewer runtime with static host approval or denial, `visibleToHost: true`, authorization TTL, a host lifecycle timer, a host revoke permission, or a host workflow reason
- **THEN** runtime creation fails before opening a relay connection, sending protocol messages, scheduling workflow timers, activating host visibility, invoking host controls, or emitting workflow audit events

#### Scenario: Valid viewer workflow options remain available

- **WHEN** the agent shell is started as a viewer with valid viewer requested permissions, one-shot viewer status, viewer local disconnect, viewer control prompt, or viewer signal probe configuration
- **THEN** validation MAY succeed when each viewer option is otherwise valid
- **AND** the host-only workflow rejection MUST NOT grant permissions, start capture, send input, reconnect peers, suppress host visibility, invoke host controls, sync clipboard, transfer files, expose diagnostics, install services, configure startup persistence, collect credentials, hide the session from the host, or bypass consent workflows

### Requirement: Viewer request configuration is viewer-only

The agent shell SHALL treat requested permission configuration as viewer-only. Host CLI invocations with explicit `--request` MUST fail before managed runtime creation, relay connection, protocol sends, workflow audit emission, host visibility activation, signal sends, host control invocation, or workflow timer scheduling. Direct host runtime construction with non-empty `requestedPermissions` MUST fail before opening a relay connection, sending `join-session`, `hello`, authorization, lifecycle, signal, control, or workflow audit messages, granting permissions, activating host visibility, or scheduling workflow timers. Default empty host requested-permission state MAY remain valid and MUST NOT send authorization requests, grant permissions, start capture, send input, reconnect peers, suppress host visibility, invoke host controls, or bypass consent workflows. Rejection diagnostics MUST remain bounded and MUST NOT expose raw requested permission text, protocol payloads, tokens, pairing codes, credentials, private reasons, screen contents, input contents, clipboard contents, file-transfer contents, diagnostics dumps, or full secrets.

#### Scenario: Host CLI rejects explicit request option

- **WHEN** the agent shell is started as a host with `--request screen:view`
- **THEN** it exits through bounded usage handling before creating the managed runtime, connecting to the relay, sending protocol messages, scheduling workflow timers, activating host visibility, invoking host controls, or emitting workflow audit events

#### Scenario: Direct host runtime rejects non-empty requested permissions

- **WHEN** caller code creates a host runtime with non-empty `requestedPermissions`
- **THEN** runtime creation fails before opening a relay connection, sending protocol messages, scheduling workflow timers, activating host visibility, invoking host controls, or emitting workflow audit events

#### Scenario: Empty host requested permissions remain non-authorizing

- **WHEN** caller code creates a host runtime with empty `requestedPermissions`
- **THEN** runtime creation MAY succeed when all other host options are valid
- **AND** the empty requested-permission state MUST NOT send `session-authorization-request`, approve authorization, grant permissions, activate host visibility, start capture, send input, reconnect peers, suppress host visibility, invoke host controls, or bypass consent workflows

#### Scenario: Viewer request behavior remains valid

- **WHEN** the agent shell is started as a viewer with valid requested permissions
- **THEN** validation MAY succeed when each requested permission is otherwise valid
- **AND** the viewer-only role boundary MUST NOT widen permissions, bypass host approval, activate hidden sessions, start capture, send input, sync clipboard, transfer files, expose diagnostics, install services, configure startup persistence, collect credentials, or bypass consent workflows

### Requirement: Viewer request reasons are explicit and host-visible

The viewer agent shell SHALL accept an optional viewer-only request reason only with a non-empty viewer permission request, and the reason MUST be bounded, already trimmed, free of ASCII control characters, free of Unicode bidirectional or zero-width formatting controls including `U+FEFF`, and free of secret-bearing metadata before relay connection or protocol sends. When provided, the viewer SHALL include the reason in the `session-authorization-request.reason` field. Interactive host consent prompts SHALL show the validated request reason, or `unavailable` when omitted, before accepting `approve` or `deny`. Request reason handling MUST NOT approve a session, activate host visibility, grant permissions, start capture, send input, reconnect peers, suppress host visibility, expose clipboard, transfer files, expose diagnostics, install services, configure startup persistence, collect credentials, hide the session from the host, or bypass consent workflows.

#### Scenario: Viewer request includes reason

- **WHEN** the viewer shell is started with requested permissions and a valid request reason
- **AND** the relay indicates a two-peer room
- **THEN** it sends a `session-authorization-request` containing that exact validated reason
- **AND** the request remains subject to host approval, visible-session activation, authorization, and fail-closed gates

#### Scenario: Host mode rejects request reason

- **WHEN** the host shell is started with a request reason option
- **THEN** argument parsing rejects it before the runtime starts, opens a relay connection, sends protocol messages, or emits workflow audit events

#### Scenario: Request reason without requested permissions is rejected

- **WHEN** CLI or direct runtime options include a request reason without requested permissions
- **THEN** validation rejects the input before relay connection, socket write, local trusted `sent` event emission, or host consent prompt display
- **AND** diagnostics, runtime events, logs, and usage output MUST NOT expose the raw rejected reason text

#### Scenario: Request reason validation rejects unsafe text

- **WHEN** CLI or direct runtime options include a request reason that is blank, untrimmed, oversized, contains ASCII control characters, contains Unicode bidirectional or zero-width formatting controls, or contains secret-bearing metadata
- **THEN** validation rejects the input before relay connection, socket write, local trusted `sent` event emission, or host consent prompt display
- **AND** diagnostics, runtime events, logs, and usage output MUST NOT expose the raw rejected reason text

#### Scenario: Host prompt displays request reason

- **WHEN** a host shell is configured for interactive consent and receives a same-session authorization request from the observed viewer with a validated reason
- **THEN** the host-facing prompt text includes the request reason before asking for `approve` or `deny`
- **AND** prompt handling still fails closed for timeout, invalid input, hidden visibility, denied consent, revoked permissions, terminated sessions, and missing authorization

#### Scenario: Host prompt marks omitted request reason unavailable

- **WHEN** a host shell is configured for interactive consent and receives a same-session authorization request from the observed viewer without a reason
- **THEN** the host-facing prompt text marks the request reason as `unavailable`
- **AND** the prompt MUST NOT invent consent context, approve authorization, activate visibility, grant permissions, start capture, or send input

### Requirement: Viewer host acknowledgement defaults are omitted
The agent shell SHALL represent an omitted viewer `--host-signal-probe-ack` option as absent host acknowledgement configuration before managed runtime creation. This omitted viewer default MUST NOT be treated as explicit host workflow state, MUST NOT block otherwise valid viewer CLI startup, and MUST NOT enable host signal acknowledgement behavior. Explicit viewer `--host-signal-probe-ack` values, including `false`, remain host-only configuration and MUST be rejected before runtime startup.

#### Scenario: Viewer default handoff omits host acknowledgement
- **WHEN** the agent shell parses a viewer CLI invocation that omits `--host-signal-probe-ack`
- **THEN** the parsed runtime handoff does not define host acknowledgement configuration
- **AND** managed runtime creation may proceed when all other viewer options are valid

#### Scenario: Explicit viewer host acknowledgement false remains rejected
- **WHEN** the agent shell parses a viewer CLI invocation with `--host-signal-probe-ack false`
- **THEN** it exits through bounded usage handling before creating the managed runtime, connecting to the relay, sending protocol messages, scheduling workflow timers, acknowledging signals, activating host visibility, or invoking host controls

#### Scenario: Omitted viewer default remains non-authorizing
- **WHEN** viewer CLI startup omits host acknowledgement configuration
- **THEN** the omission MUST NOT grant permissions, approve authorization, send host acknowledgements, start capture, send input, reconnect peers, suppress host visibility, sync clipboard, transfer files, expose diagnostics, install services, configure startup persistence, collect credentials, hide the session from the host, or bypass consent workflows

### Requirement: Host local disconnect diagnostics are best-effort
The agent shell SHALL treat diagnostics emitted after local host disconnect audit persistence failure as best-effort cleanup observability. If local disconnect audit persistence fails, failures from diagnostic event callbacks or diagnostic loggers MUST NOT prevent local peer disconnected state, inactive host indicator emission, or local WebSocket close. Diagnostic callback or logger failure MUST NOT send peer-originated `peer-disconnected`, lifecycle, signal, control, or workflow audit messages; grant permissions; start capture; send input; reconnect peers; suppress host visibility; hide the session from the host; or bypass consent workflows. Diagnostics for this path MUST remain bounded and MUST NOT expose raw audit sink error text, raw diagnostic callback error text, raw logger error text, raw close reasons, pairing codes, tokens, protocol payloads, display names, private reasons, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets.

#### Scenario: Scheduled local host disconnect survives diagnostic callback failure
- **WHEN** a host shell with visible active authorization runs scheduled local disconnect
- **AND** writing `agent-shell.session.disconnected` audit persistence fails
- **AND** the local runtime diagnostic event callback or diagnostic logger fails while reporting the sanitized audit failure
- **THEN** the host shell still records local peer disconnected state
- **AND** the host shell still emits an inactive local host indicator
- **AND** the host shell still closes the local WebSocket
- **AND** the cleanup result remains secret-safe

#### Scenario: Direct local host disconnect survives diagnostic callback failure
- **WHEN** caller code invokes direct local host disconnect after visible active or paused authorization
- **AND** writing `agent-shell.session.disconnected` audit persistence fails
- **AND** the local runtime diagnostic event callback or diagnostic logger fails while reporting the sanitized audit failure
- **THEN** the direct disconnect call MUST NOT throw raw audit, callback, logger, close reason, pairing, token, payload, credential, or remote-content text
- **AND** the host shell still emits an inactive local host indicator and closes the local WebSocket

#### Scenario: Local host disconnect diagnostic failure remains non-authorizing
- **WHEN** local host disconnect cleanup contains an audit persistence failure, diagnostic callback failure, or diagnostic logger failure
- **THEN** that failure MUST NOT send lifecycle, signal, control, workflow audit, or peer-originated disconnect protocol messages
- **AND** it MUST NOT grant permissions, start capture, send input, reconnect peers, suppress host visibility, expose clipboard, transfer files, expose diagnostics, install services, configure startup persistence, collect credentials, hide the session from the host, or bypass consent workflows

### Requirement: Interactive host consent failure diagnostics are best-effort
The agent shell SHALL treat diagnostics emitted after interactive host consent provider failure as best-effort failure observability. If the host decision provider fails, failures from diagnostic event callbacks or diagnostic loggers MUST NOT prevent the runtime from failing closed without approval. Diagnostic callback or logger failure MUST NOT send `session-authorization-decision`, `session-authorization-state`, `session-control`, `permission-revoked`, `signal`, or workflow `audit-event` messages; grant permissions; activate the host indicator; start capture; send input; reconnect peers; suppress host visibility; hide the session from the host; or bypass consent workflows. Diagnostics for this path MUST remain bounded and MUST NOT expose raw provider error text, raw diagnostic callback error text, raw logger error text, raw viewer display names, raw close reasons, pairing codes, tokens, protocol payloads, private reasons, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets.

#### Scenario: Provider failure remains fail-closed when diagnostic callback fails
- **WHEN** a host shell receives a viewer authorization request and the interactive host decision provider fails
- **AND** the runtime diagnostic event callback fails while reporting the sanitized provider failure
- **THEN** the host shell MUST NOT send an approval, denial, active state, control, signal, permission, or workflow audit message
- **AND** the host shell MUST NOT activate the host indicator
- **AND** the failure result remains secret-safe

#### Scenario: Provider failure remains fail-closed when diagnostic logger fails
- **WHEN** a host shell receives a viewer authorization request and the interactive host decision provider fails
- **AND** the diagnostic logger fails while reporting the sanitized provider failure or the static fail-closed log
- **THEN** the host shell MUST NOT send an approval, denial, active state, control, signal, permission, or workflow audit message
- **AND** the host shell MUST NOT grant permissions, start capture, send input, reconnect peers, hide the session from the host, or bypass consent workflows

### Requirement: Viewer local leave close diagnostics are best-effort
The managed viewer agent shell runtime SHALL treat diagnostics emitted from the local WebSocket close event during viewer local leave as best-effort cleanup observability. If the close event callback or disconnected logger fails, the viewer local leave operation MUST still close only the local viewer relay connection, clear connection-scoped local viewer authorization state, and record bounded inactive viewer status. Diagnostic callback or logger failure MUST NOT send authorization, lifecycle, signal, control, `peer-disconnected`, or workflow `audit-event` messages; grant permissions; start signaling; invoke host controls; reconnect peers; suppress host visibility; expose screen, input, clipboard, file-transfer, diagnostics, token, pairing, credential, private-reason, display-name, signal-payload, raw protocol data, or raw WebSocket close reason text.

#### Scenario: Viewer leave survives close diagnostic callback failure
- **WHEN** a viewer runtime invokes local leave while connected
- **AND** the local WebSocket close event callback fails while reporting bounded close metadata
- **THEN** the leave operation still resolves after closing the local viewer relay connection
- **AND** the viewer status snapshot reports inactive local state, `visibleToHost: false`, permission count `0`, and bounded local inactive cause `local-leave`
- **AND** the viewer runtime MUST NOT send authorization, lifecycle, signal, control, `peer-disconnected`, or workflow audit messages because of the diagnostic failure

#### Scenario: Viewer leave survives close diagnostic logger failure
- **WHEN** a viewer runtime invokes local leave while connected
- **AND** the disconnected logger fails while logging bounded close metadata
- **THEN** the leave operation still resolves after closing the local viewer relay connection
- **AND** the viewer status snapshot reports inactive local state, `visibleToHost: false`, permission count `0`, and bounded local inactive cause `local-leave`
- **AND** the viewer runtime MUST NOT grant permissions, start signaling, invoke host controls, reconnect peers, hide the session from the host, or bypass consent workflows

### Requirement: Control prompt command line length bounds
The interactive host and viewer control prompts SHALL reject any complete local command line whose UTF-8 byte length is greater than the implementation-defined maximum before parsing the command or invoking runtime operations. The maximum MUST be finite and no greater than 256 bytes. Oversized command rejection MUST use generic secret-safe prompt output and MUST NOT echo raw command text, byte contents, tokens, pairing codes, private reasons, peer ids, display names, protocol payloads, signal payloads, keystrokes, screenshots, screen contents, input contents, clipboard contents, file-transfer contents, diagnostics dumps, raw WebSocket close reason text, or raw runtime exception text.

#### Scenario: Host control prompt rejects oversized command lines
- **WHEN** host control prompt mode receives a complete command line whose UTF-8 byte length is greater than the control prompt maximum
- **THEN** it rejects the command before parsing permissions, reading host status, invoking pause, resume, revoke, terminate, disconnect, or public runtime sends
- **AND** it MUST NOT send session-control, permission-revoked, authorization-state, disconnect, signal, `peer-disconnected`, or workflow audit messages because of that command
- **AND** prompt output MUST NOT echo the raw command line or expose its byte contents

#### Scenario: Viewer control prompt rejects oversized command lines
- **WHEN** viewer control prompt mode receives a complete command line whose UTF-8 byte length is greater than the control prompt maximum
- **THEN** it rejects the command before reading viewer status, stopping the local viewer runtime, invoking host lifecycle controls, or sending public runtime messages
- **AND** it MUST NOT send authorization, lifecycle, signal, control, `peer-disconnected`, or workflow audit messages because of that command
- **AND** prompt output MUST NOT echo the raw command line or expose its byte contents

### Requirement: Viewer signal acknowledgement status is bounded and read-only

The managed viewer agent shell runtime SHALL expose optional viewer status metadata after receiving a trusted host signal probe acknowledgement for the current active visible `screen:view` authorization. The metadata MUST be bounded to `signalProbeAckReceived=true` and MUST NOT expose raw signal payload markers, payload keys, payload values, peer ids, display names, private reasons, tokens, pairing codes, credentials, keystrokes, screenshots, screen contents, input contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, raw protocol data, or raw WebSocket close reason text. Reading or printing the status MUST NOT send protocol messages, emit workflow audit events, grant permissions, start capture, send input, start signaling, reconnect peers, invoke host controls, or bypass consent workflows.

#### Scenario: Viewer status reports trusted host acknowledgement

- **WHEN** a viewer runtime with active visible `screen:view` authorization receives a trusted host signal probe acknowledgement for the same authorization id
- **THEN** viewer status includes `signalProbeAckReceived=true`
- **AND** the status output MUST NOT expose the raw acknowledgement payload marker or any raw signal payload contents

#### Scenario: Viewer status omits acknowledgement before trusted acknowledgement

- **WHEN** a viewer runtime has active visible `screen:view` authorization but has not received a trusted matching host signal probe acknowledgement
- **THEN** viewer status omits signal acknowledgement metadata
- **AND** the omitted metadata MUST NOT grant permissions, start capture, send input, start signaling, reconnect peers, invoke host controls, or bypass consent workflows

#### Scenario: Viewer status clears acknowledgement after authorization loss

- **WHEN** a viewer runtime previously received a trusted host signal probe acknowledgement
- **AND** the viewer authorization becomes paused, revoked, terminated, expired, locally disconnected, remotely disconnected, socket-closed, invisible, or no longer includes `screen:view`
- **THEN** viewer status omits signal acknowledgement metadata
- **AND** stale acknowledgement metadata MUST NOT authorize signaling, capture, input, clipboard, file transfer, diagnostics, reconnect, host controls, or consent bypass

### Requirement: Immutable agent status snapshots
The managed agent shell runtime SHALL return immutable host and viewer status snapshot objects from status APIs. Immutability MUST prevent callers from changing local state, host visibility, permission count, authorization metadata, inactive cause metadata, disconnect reason metadata, or signal acknowledgement metadata in place after the snapshot is returned. Immutable status snapshots MUST NOT send protocol messages, emit workflow audit events, grant permissions, change authorization lifecycle state, start signaling, reconnect peers, invoke host controls, start capture, send input, or bypass consent workflows.

#### Scenario: Host status snapshot cannot be mutated
- **WHEN** caller code reads a host runtime status snapshot
- **THEN** the returned snapshot object is immutable
- **AND** attempts to change `state`, `visibleToHost`, `permissionCount`, authorization metadata, inactive cause metadata, or remote disconnect reason metadata MUST NOT mutate the returned snapshot or trusted runtime state

#### Scenario: Viewer status snapshot cannot be mutated
- **WHEN** caller code reads a viewer runtime status snapshot
- **THEN** the returned snapshot object is immutable
- **AND** attempts to change `state`, `visibleToHost`, `permissionCount`, authorization metadata, remote disconnect reason metadata, local inactive cause metadata, or signal acknowledgement metadata MUST NOT mutate the returned snapshot or trusted runtime state

### Requirement: Agent status snapshot documentation
The project documentation SHALL describe managed host and viewer status APIs as returning immutable read-only local metadata snapshots. The documentation MUST state that status snapshots are bounded, non-authorizing, and cannot be used to grant permissions, change authorization lifecycle state, start signaling, reconnect peers, invoke host controls, start capture, send input, or bypass consent workflows.

#### Scenario: Host status documentation is immutable and non-authorizing
- **WHEN** a developer reads the host status CLI or runtime documentation
- **THEN** the documentation describes host status as an immutable read-only local snapshot
- **AND** the documentation states that reading or mutating the snapshot MUST NOT send protocol messages, emit workflow audit events, grant permissions, reconnect peers, invoke host controls, start capture, send input, or bypass consent workflows

#### Scenario: Viewer status documentation is immutable and non-authorizing
- **WHEN** a developer reads the viewer status CLI or runtime documentation
- **THEN** the documentation describes viewer status as an immutable read-only local snapshot
- **AND** the documentation states that reading or mutating the snapshot MUST NOT send protocol messages, emit workflow audit events, grant permissions, start signaling, reconnect peers, invoke host controls, start capture, send input, or bypass consent workflows

#### Scenario: Signal acknowledgement status documentation is immutable and non-authorizing
- **WHEN** a developer reads documentation for `signalProbeAckReceived`
- **THEN** the documentation describes the flag as bounded local metadata on an immutable viewer status snapshot
- **AND** the documentation states that the flag MUST NOT expose raw signal payloads or authorize signaling, capture, input, clipboard, file transfer, diagnostics, reconnect, host controls, or consent bypass

### Requirement: Agent status snapshot types are read-only
The managed agent shell runtime SHALL expose host and viewer status snapshot TypeScript types as read-only local metadata snapshots. Compile-time read-only status fields MUST match the runtime immutable snapshot contract and MUST NOT change the serialized status shape, protocol behavior, authorization lifecycle behavior, host visibility behavior, permission counts, disconnect metadata, or signal acknowledgement metadata.

#### Scenario: Host status type prevents direct mutation
- **WHEN** TypeScript code receives a host status snapshot from the managed runtime
- **THEN** the host status snapshot type marks snapshot fields as read-only
- **AND** the type-level read-only contract MUST NOT send protocol messages, emit workflow audit events, grant permissions, reconnect peers, invoke host controls, start capture, send input, or bypass consent workflows

#### Scenario: Viewer status type prevents direct mutation
- **WHEN** TypeScript code receives a viewer status snapshot from the managed runtime
- **THEN** the viewer status snapshot type marks snapshot fields as read-only
- **AND** the type-level read-only contract MUST NOT send protocol messages, emit workflow audit events, grant permissions, start signaling, reconnect peers, invoke host controls, start capture, send input, or bypass consent workflows

#### Scenario: Status type shape remains compatible
- **WHEN** status snapshots are returned, compared in tests, or serialized by existing callers
- **THEN** the status field names, optional fields, and values remain unchanged
- **AND** readonly typing MUST NOT add wrapper metadata, expose raw private data, or change CLI status output semantics

### Requirement: Direct agent-shell scheduler delays are bounded
The agent shell SHALL reject malformed direct scheduler delay values for local host status printing, local viewer status printing, and viewer local disconnect before creating timers. Direct scheduler delay values MUST be finite integer millisecond values from `0` through the safe timer delay bound. Rejection MUST happen before reading status, invoking local viewer leave, invoking host controls, invoking viewer controls, sending public runtime messages, sending protocol messages, emitting workflow audit events, or writing prompt output.

#### Scenario: Host status scheduler rejects malformed delay
- **WHEN** local code schedules a host status print with a negative, fractional, non-finite, `NaN`, or timer-unsafe delay value
- **THEN** the scheduler rejects the request before creating a status timer
- **AND** the rejection MUST NOT call `getHostStatus`, call viewer status, invoke host controls, send public runtime messages, write host status output, or bypass consent workflows

#### Scenario: Viewer status scheduler rejects malformed delay
- **WHEN** local code schedules a viewer status print with a negative, fractional, non-finite, `NaN`, or timer-unsafe delay value
- **THEN** the scheduler rejects the request before creating a status timer
- **AND** the rejection MUST NOT call `getViewerStatus`, call host status, invoke host controls, invoke viewer controls, send public runtime messages, write viewer status output, or bypass consent workflows

#### Scenario: Viewer local disconnect scheduler rejects malformed delay
- **WHEN** local code schedules viewer local disconnect with a negative, fractional, non-finite, `NaN`, or timer-unsafe delay value
- **THEN** the scheduler rejects the request before creating a disconnect timer
- **AND** the rejection MUST NOT call local viewer leave, invoke host controls, invoke viewer controls, send public runtime messages, write disconnect output, reconnect peers, or bypass consent workflows

#### Scenario: Valid direct zero-delay scheduling remains supported
- **WHEN** local code schedules host status print, viewer status print, or viewer local disconnect with `delayMs=0`
- **THEN** the scheduler keeps the existing zero-delay behavior
- **AND** zero-delay scheduling MUST NOT grant permissions, start capture, send input, reconnect peers, suppress host visibility, or bypass consent workflows

### Requirement: Direct host consent prompt timeout is bounded
The agent shell SHALL reject malformed direct interactive host consent prompt timeout values before creating prompt timers or rendering host-facing prompt text. Direct prompt timeout values MUST be finite integer millisecond values from `1` through the safe timer delay bound when supplied. Rejection MUST happen before reading host input, writing prompt output, sending authorization decisions, sending authorization state, sending workflow audit events, activating host visibility, granting permissions, starting capture, sending input, or bypassing consent workflows.

#### Scenario: Prompt helper rejects malformed timeout
- **WHEN** local code calls the interactive host consent prompt helper with a zero, negative, fractional, non-finite, `NaN`, or timer-unsafe timeout value
- **THEN** the helper rejects the request before creating the prompt timer
- **AND** the rejection MUST NOT render viewer identity, requested permissions, request reason, prompt instructions, authorization decisions, authorization state, workflow audit events, or host visibility changes

#### Scenario: Provider factory rejects malformed timeout
- **WHEN** local code creates an interactive host decision provider with a zero, negative, fractional, non-finite, `NaN`, or timer-unsafe timeout value
- **THEN** provider creation rejects the request before a provider can be used for host approval
- **AND** the rejection MUST NOT approve a session, grant permissions, activate host visibility, start capture, send input, or bypass consent workflows

#### Scenario: Omitted and valid timeout behavior remains supported
- **WHEN** local code omits the prompt timeout or supplies a valid positive bounded timeout
- **THEN** the existing prompt timeout and exact `approve` or `deny` handling remains unchanged
- **AND** valid timeout handling MUST NOT grant permissions without explicit host approval, activate invisible sessions, suppress revocation, or bypass consent workflows

### Requirement: Host indicator logger diagnostics are best-effort
The agent shell SHALL treat host indicator logger output as best-effort diagnostics after the local host indicator event has been emitted. A diagnostic logger failure while reporting a host indicator update MUST NOT prevent already-prepared visible authorization workflow from sending active state or workflow audit messages. Host indicator logger failure MUST NOT expose raw logger error text, tokens, pairing codes, protocol payloads, display names, private reasons, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets. Host indicator logger failure MUST NOT grant permissions, approve authorization, change authorization lifecycle state, start capture, send input, reconnect peers, suppress host visibility, hide the session from the host, install services, configure startup persistence, elevate privileges, or bypass consent workflows.

#### Scenario: Active indicator logger failure is contained
- **WHEN** a host shell explicitly approves an authorization request and emits an active visible host indicator
- **AND** the diagnostic logger fails while reporting the bounded host indicator log line
- **THEN** the logger failure MUST NOT prevent the viewer from receiving active visible authorization state
- **AND** the host shell MUST still send the secret-safe active workflow audit-event
- **AND** the logger failure MUST NOT expose raw logger error text or weaken consent, visibility, authorization, audit, lifecycle, signal, or disconnect boundaries

#### Scenario: Indicator event callback remains authoritative
- **WHEN** host indicator event emission itself fails before the diagnostic logger runs
- **THEN** this change does not require the runtime to continue as if host visibility were successfully rendered
- **AND** that failure MUST NOT be hidden by host indicator logger containment

### Requirement: Delayed host workflow skip diagnostics are best-effort
The agent shell SHALL treat delayed host workflow skip logger output as best-effort diagnostics after the runtime has already decided not to send a delayed host workflow action because the local peer is disconnected, the remote peer is disconnected, or the socket is closed. Diagnostic logger failure while reporting a skipped delayed workflow action MUST NOT emit a runtime error event, expose raw logger error text, send `session-control`, `permission-revoked`, `session-authorization-state`, `signal`, `peer-disconnected`, or workflow `audit-event` messages, grant permissions, change authorization lifecycle state, start capture, send input, reconnect peers, suppress host visibility, hide the session from the host, install services, configure startup persistence, elevate privileges, or bypass consent workflows.

#### Scenario: Remote disconnect skip logger failure is contained
- **WHEN** a host shell has delayed revoke, pause, resume, terminate, expiration, or disconnect workflow simulation scheduled
- **AND** the trusted viewer peer disconnects before those delayed workflow timers fire
- **AND** the diagnostic logger fails while reporting a bounded skipped delayed workflow action
- **THEN** the logger failure MUST NOT emit a runtime error event
- **AND** the host shell MUST NOT send delayed lifecycle, control, permission, signal, disconnect, or workflow audit messages after the trusted peer disconnect
- **AND** local runtime events and logs MUST NOT expose raw logger error text, tokens, pairing codes, protocol payloads, credentials, private reasons, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets

#### Scenario: Local disconnect skip logger failure is contained
- **WHEN** a host shell closes its local relay connection before delayed revoke, pause, resume, terminate, expiration, or disconnect workflow timers fire
- **AND** the diagnostic logger fails while reporting a bounded skipped delayed workflow action
- **THEN** the logger failure MUST NOT emit a runtime error event
- **AND** the host shell MUST NOT send delayed lifecycle, control, permission, signal, peer-originated disconnect, or workflow audit messages because of that logger failure
- **AND** the logger failure MUST NOT grant permissions, start capture, send input, reconnect peers, hide the session from the host, or bypass consent workflows

### Requirement: Inbound unsafe diagnostic logger failures are best-effort
The agent shell SHALL treat inbound non-protocol and ignored unsafe inbound protocol logger output as best-effort diagnostics after emitting the redacted local `raw` event. Diagnostic logger failure while reporting an ignored inbound unsafe message MUST NOT emit a runtime error event, expose raw logger error text, expose raw protocol payloads, send `session-authorization-decision`, `session-authorization-state`, `session-control`, `permission-revoked`, `signal`, `peer-disconnected`, or workflow `audit-event` messages, grant permissions, change authorization lifecycle state, activate host visibility, start capture, send input, reconnect peers, suppress host visibility, hide the session from the host, install services, configure startup persistence, elevate privileges, or bypass consent workflows.

#### Scenario: Non-protocol logger failure is contained
- **WHEN** the managed runtime receives inbound data that cannot be decoded as a protocol envelope
- **AND** the diagnostic logger fails while reporting the bounded non-protocol byte summary
- **THEN** the logger failure MUST NOT emit a runtime error event
- **AND** the runtime MUST still expose only a redacted local `raw` event with bounded byte metadata
- **AND** the logger failure MUST NOT send protocol messages, grant permissions, activate host visibility, start capture, send input, reconnect peers, or bypass consent workflows
- **AND** local runtime events and logs MUST NOT expose raw inbound text, raw logger error text, tokens, pairing codes, credentials, private reasons, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets

#### Scenario: Decoded unsafe protocol logger failure is contained
- **WHEN** the managed runtime decodes an inbound protocol envelope but rejects it as unsafe for the current runtime before local `received` protocol event emission
- **AND** the diagnostic logger fails while reporting the bounded ignored unsafe inbound byte summary
- **THEN** the logger failure MUST NOT emit a runtime error event
- **AND** the runtime MUST still expose only a redacted local `raw` event with bounded byte metadata
- **AND** the runtime MUST NOT treat the ignored message as a valid received protocol event
- **AND** the logger failure MUST NOT send authorization, lifecycle, control, permission, signal, disconnect, or workflow audit messages
- **AND** local runtime events and logs MUST NOT expose raw protocol payloads, session ids, peer ids, signal payloads, private reasons, raw logger error text, tokens, pairing codes, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets

### Requirement: Accepted inbound protocol summary logger failures are best-effort
The agent shell SHALL treat accepted inbound protocol summary logger output as best-effort diagnostics after emitting the redacted local `received` event. Diagnostic logger failure while reporting an accepted inbound protocol summary MUST NOT emit a runtime error event, expose raw logger error text, expose raw protocol payloads, suppress consent workflow handling, suppress host visibility after explicit approval, skip required workflow audit persistence, skip signal authorization checks, send messages that would otherwise be blocked, grant permissions without explicit host approval, start capture, send input, reconnect peers, hide the session from the host, install services, configure startup persistence, elevate privileges, or bypass consent workflows.

#### Scenario: Authorization request summary logger failure is contained
- **WHEN** a host runtime receives a valid same-session `session-authorization-request`
- **AND** the diagnostic logger fails while reporting the bounded accepted inbound protocol summary
- **THEN** the logger failure MUST NOT emit a runtime error event
- **AND** the host runtime MUST still process the request only through the normal explicit approval, visible-session, authorization, and workflow audit gates
- **AND** local runtime events and logs MUST NOT expose raw logger error text, raw request reason text, raw protocol payloads, tokens, pairing codes, credentials, private reasons, signal payloads, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets

#### Scenario: Accepted summary logger failure does not weaken blocked sends
- **WHEN** an accepted inbound protocol summary logger failure occurs
- **THEN** the logger failure MUST NOT authorize any host-originated or viewer-originated `signal` send that lacks active visible `screen:view` authorization
- **AND** the logger failure MUST NOT send authorization, lifecycle, control, permission, signal, disconnect, or workflow audit messages except messages that the unchanged consent workflow would send after existing gates pass

### Requirement: Invisible approval diagnostic logger failures are best-effort
The agent shell SHALL treat the invisible-approval withheld-active-state diagnostic logger output as best-effort after sending the approval decision and approval workflow audit event. Diagnostic logger failure while reporting that active state was withheld because visible session state is false MUST NOT emit a runtime error event, expose raw logger error text, send active `session-authorization-state`, emit active host indicator state, send active workflow audit, authorize host-originated or viewer-originated `signal`, grant permissions beyond the approved inactive snapshot, start capture, send input, reconnect peers, hide the session from the host, install services, configure startup persistence, elevate privileges, or bypass consent workflows.

#### Scenario: Invisible approval logger failure is contained
- **WHEN** a host runtime approves a valid same-session authorization request while `visibleToHost` is false
- **AND** the diagnostic logger fails while reporting that active state was withheld
- **THEN** the logger failure MUST NOT emit a runtime error event
- **AND** the viewer MAY receive the normal approved decision and approval workflow audit event
- **AND** the viewer MUST NOT receive active `session-authorization-state`
- **AND** the host runtime MUST NOT emit an active host indicator
- **AND** local runtime events and logs MUST NOT expose raw logger error text, raw request reason text, raw protocol payloads, tokens, pairing codes, credentials, private reasons, signal payloads, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets

#### Scenario: Invisible approval logger failure does not authorize signaling
- **WHEN** invisible approval diagnostic logger failure is contained
- **THEN** the host status MUST remain inactive with `visibleToHost: false`
- **AND** host-originated and viewer-originated `signal` sends MUST remain blocked unless a later unchanged workflow grants active visible `screen:view` authorization

### Requirement: Grant-scope mismatch diagnostic logger failures are best-effort
The agent shell SHALL treat configured grant-scope mismatch diagnostic logger output as best-effort after determining that the configured grant permissions include permissions the viewer did not request. Diagnostic logger failure while reporting that configured grant scope is not requested MUST NOT emit a runtime error event, expose raw logger error text, send `session-authorization-decision`, send `session-authorization-state`, emit active host indicator state, send workflow `audit-event`, authorize host-originated or viewer-originated `signal`, grant permissions, start capture, send input, reconnect peers, hide the session from the host, install services, configure startup persistence, elevate privileges, or bypass consent workflows.

#### Scenario: Grant-scope mismatch logger failure is contained
- **WHEN** a host runtime is configured to approve with a grant permission that was not requested by the viewer
- **AND** the diagnostic logger fails while reporting that configured grant scope is not requested
- **THEN** the logger failure MUST NOT emit a runtime error event
- **AND** the host and viewer MUST NOT send or receive authorization decisions, active authorization state, lifecycle controls, permission revocations, signals, peer-originated disconnects, or workflow audit messages because of that failed approval path
- **AND** the host runtime MUST NOT emit an active host indicator
- **AND** local runtime error events and diagnostic logs MUST NOT expose raw logger error text, raw configured grant permission text, raw protocol payloads, tokens, pairing codes, credentials, private reasons, signal payloads, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets

#### Scenario: Grant-scope mismatch logger failure does not authorize signaling
- **WHEN** configured grant-scope mismatch diagnostic logger failure is contained
- **THEN** host-originated and viewer-originated `signal` sends MUST remain blocked unless a later unchanged workflow grants active visible `screen:view` authorization

### Requirement: Scheduled revoke ineligible diagnostics are best-effort
The agent shell SHALL treat diagnostic logger output emitted while declining ineligible scheduled host revoke configuration as best-effort observability. Ineligible scheduled revoke configuration includes a delayed revoke with no revoke permission configured and a delayed revoke whose configured permission is not included in the active host-approved grant. Diagnostic logger failure in those paths MUST NOT emit runtime error events, undo active visible authorization, change granted permissions, send `session-control`, send `permission-revoked`, send revoked authorization state, send revoke workflow audit messages, start capture, send input, reconnect peers, suppress host visibility, hide the session from the host, install services, configure startup persistence, elevate privileges, or bypass consent workflows. Diagnostic logger failure MUST NOT expose raw logger error text, tokens, pairing codes, protocol payloads, display names, private reasons, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets.

#### Scenario: Out-of-grant scheduled revoke diagnostic logger failure is contained
- **WHEN** a host shell explicitly approves an active visible authorization whose narrowed grant excludes the configured delayed revoke permission
- **AND** the diagnostic logger fails while reporting that the revoke permission was not granted in the active grant
- **THEN** the viewer MUST still observe the active visible authorization state
- **AND** the host shell MUST NOT emit a runtime error because of the logger failure
- **AND** the runtime MUST NOT send revoke control, `permission-revoked`, revoked authorization state, or revoke workflow audit messages
- **AND** the logger failure MUST NOT expose raw logger error text or weaken consent, visibility, authorization, audit, lifecycle, signal, or disconnect boundaries

#### Scenario: Missing scheduled revoke permission diagnostic logger failure is contained
- **WHEN** a host shell explicitly approves an active visible authorization with a delayed revoke configured but no revoke permission configured
- **AND** the diagnostic logger fails while reporting that no revoke permission is configured
- **THEN** the host shell MUST NOT emit a runtime error because of the logger failure
- **AND** the runtime MUST NOT send revoke control, `permission-revoked`, revoked authorization state, or revoke workflow audit messages
- **AND** active authorization, host visibility, and granted permissions MUST remain governed by the host-approved grant

### Requirement: Interactive host consent no-decision diagnostics are best-effort
The agent shell SHALL treat diagnostic logger output emitted after interactive host consent timeout or invalid/no-accepted-decision outcomes as best-effort observability. Diagnostic logger failure in those no-decision paths MUST NOT emit runtime error events, send `session-authorization-decision`, send `session-authorization-state`, send `session-control`, send `permission-revoked`, send `signal`, send workflow `audit-event` messages, grant permissions, activate the host indicator, start capture, send input, reconnect peers, suppress host visibility, hide the session from the host, install services, configure startup persistence, elevate privileges, or bypass consent workflows. Diagnostic logger failure MUST NOT expose raw logger error text, tokens, pairing codes, protocol payloads, display names, private reasons, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets.

#### Scenario: Invalid consent diagnostic logger failure is contained
- **WHEN** an interactive host consent provider returns anything other than an accepted approval or denial response
- **AND** the diagnostic logger fails while reporting that interactive host consent returned no accepted decision
- **THEN** the host runtime MUST keep the authorization request unapproved
- **AND** the host shell MUST NOT emit a runtime error because of the logger failure
- **AND** the runtime MUST NOT send authorization decision, authorization state, lifecycle control, permission revocation, signal, or workflow audit messages
- **AND** the logger failure MUST NOT expose raw logger error text or weaken consent, visibility, authorization, audit, lifecycle, signal, or disconnect boundaries

#### Scenario: Consent timeout diagnostic logger failure is contained
- **WHEN** an interactive host consent provider times out before returning an accepted approval or denial response
- **AND** the diagnostic logger fails while reporting the bounded timeout diagnostic
- **THEN** the host runtime MUST keep the authorization request unapproved
- **AND** the host shell MUST NOT emit a runtime error because of the logger failure
- **AND** the runtime MUST NOT send authorization decision, authorization state, lifecycle control, permission revocation, signal, or workflow audit messages
- **AND** active permissions and host visibility MUST remain unavailable unless a later unchanged workflow explicitly approves a new authorization request visibly

### Requirement: Host lifecycle skip diagnostics are best-effort
The agent shell SHALL treat diagnostic logger output emitted after declining ineligible host lifecycle actions as best-effort observability. Ineligible host lifecycle actions include revoke, pause, resume, terminate, expiration, and local disconnect skip paths caused by terminal authorization, expiration, already-paused state, not-paused state, missing granted permission, missing active visible state, missing active-or-paused visible state, or resume delay configured without a pause delay. Diagnostic logger failure in those skip paths MUST NOT emit runtime error events, change authorization lifecycle state, change granted permissions, send `session-control`, send `permission-revoked`, send `session-authorization-state`, send workflow `audit-event` messages, activate or suppress host visibility beyond the already-decided state, start capture, send input, reconnect peers, hide the session from the host, install services, configure startup persistence, elevate privileges, or bypass consent workflows. Diagnostic logger failure MUST NOT expose raw logger error text, tokens, pairing codes, protocol payloads, display names, private reasons, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets.

#### Scenario: Terminal lifecycle skip diagnostic logger failure is contained
- **WHEN** a host lifecycle action is skipped because the authorization is already terminal
- **AND** the diagnostic logger fails while reporting the bounded terminal skip diagnostic
- **THEN** the host shell MUST NOT emit a runtime error because of the logger failure
- **AND** the runtime MUST NOT send the skipped lifecycle control, authorization state, permission revocation, or workflow audit messages
- **AND** the logger failure MUST NOT expose raw logger error text or weaken consent, visibility, authorization, audit, lifecycle, signal, or disconnect boundaries

#### Scenario: Resume-without-pause diagnostic logger failure is contained
- **WHEN** a host shell explicitly approves an active visible authorization with a resume delay configured but no pause delay configured
- **AND** the diagnostic logger fails while reporting that resume delay was configured without pause delay
- **THEN** the viewer MUST still observe the active visible authorization state
- **AND** the host shell MUST NOT emit a runtime error because of the logger failure
- **AND** the runtime MUST NOT send pause, resume, permission revocation, termination, expiration, disconnect, or workflow audit messages because of that diagnostic failure

### Requirement: Authorization decision skip diagnostics are best-effort
The agent shell SHALL treat diagnostic logger output emitted after declining to send a host authorization decision because the requesting viewer is no longer the connected observed viewer as best-effort observability. Diagnostic logger failure in this skip path MUST NOT emit runtime error events, send `session-authorization-decision`, send `session-authorization-state`, send `session-control`, send `permission-revoked`, send `signal`, send workflow `audit-event` messages, grant permissions, activate or suppress host visibility beyond the already-decided disconnected state, start capture, send input, reconnect peers, hide the session from the host, install services, configure startup persistence, elevate privileges, or bypass consent workflows. Diagnostic logger failure MUST NOT expose raw logger error text, tokens, pairing codes, protocol payloads, display names, private reasons, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets.

#### Scenario: Viewer-disconnected authorization decision skip logger failure is contained
- **WHEN** a host consent decision resolves after the requesting viewer has disconnected
- **AND** the host shell declines to send the delayed authorization decision because the viewer is no longer connected
- **AND** the diagnostic logger fails while reporting the bounded skip diagnostic
- **THEN** the host shell MUST NOT emit a runtime error because of the logger failure
- **AND** the runtime MUST NOT send authorization decision, authorization state, lifecycle control, permission revocation, signal, or workflow audit messages because of that logger failure
- **AND** the host runtime MUST NOT emit an active host indicator
- **AND** the logger failure MUST NOT expose raw logger error text or weaken consent, visibility, authorization, audit, signal, or disconnect boundaries

### Requirement: Runtime error logger diagnostics are best-effort
The agent shell SHALL treat diagnostic logger output emitted while reporting a sanitized runtime error as best-effort observability after the sanitized runtime error event is emitted. Diagnostic logger failure in this path MUST NOT replace the sanitized runtime error thrown by direct host controls, send `session-authorization-decision`, send `session-authorization-state`, send `session-control`, send `permission-revoked`, send `signal`, send workflow `audit-event` messages, grant permissions, activate or suppress host visibility beyond the already-decided failure state, start capture, send input, reconnect peers, hide the session from the host, install services, configure startup persistence, elevate privileges, or bypass consent workflows. Diagnostic logger failure MUST NOT expose raw logger error text, raw runtime failure text, tokens, pairing codes, protocol payloads, display names, private reasons, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets.

#### Scenario: Direct host control runtime error logger failure is contained
- **WHEN** a direct host lifecycle control fails before sending protocol messages because required audit persistence fails
- **AND** the host shell emits a sanitized runtime error event for that audit failure
- **AND** the diagnostic logger fails while reporting the bounded runtime error diagnostic
- **THEN** the direct host control MUST still throw only the sanitized runtime error
- **AND** the host shell MUST NOT send the failed lifecycle control, authorization state, permission revocation, signal, or workflow audit messages because of the logger failure
- **AND** the logger failure MUST NOT expose raw logger error text, raw audit failure text, or weaken consent, visibility, authorization, audit, signal, or disconnect boundaries

### Requirement: Runtime error event diagnostics are best-effort
The agent shell SHALL treat diagnostic event callback output emitted while reporting a sanitized runtime error as best-effort observability after the sanitized runtime error has been prepared. Diagnostic event callback failure in this path MUST NOT replace the sanitized runtime error thrown by direct host controls, prevent bounded runtime error logging, send `session-authorization-decision`, send `session-authorization-state`, send `session-control`, send `permission-revoked`, send `signal`, send workflow `audit-event` messages, grant permissions, activate or suppress host visibility beyond the already-decided failure state, start capture, send input, reconnect peers, hide the session from the host, install services, configure startup persistence, elevate privileges, or bypass consent workflows. Diagnostic event callback failure MUST NOT expose raw callback error text, raw runtime failure text, tokens, pairing codes, protocol payloads, display names, private reasons, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets.

#### Scenario: Direct host control runtime error event callback failure is contained
- **WHEN** a direct host lifecycle control fails before sending protocol messages because required audit persistence fails
- **AND** the host shell prepares a sanitized runtime error event for that audit failure
- **AND** the diagnostic event callback fails while observing the bounded runtime error diagnostic
- **THEN** the direct host control MUST still throw only the sanitized runtime error
- **AND** the host shell MUST still attempt bounded runtime error logging
- **AND** the host shell MUST NOT send the failed lifecycle control, authorization state, permission revocation, signal, or workflow audit messages because of the event callback failure
- **AND** the event callback failure MUST NOT expose raw callback error text, raw audit failure text, or weaken consent, visibility, authorization, audit, signal, or disconnect boundaries

### Requirement: Accepted inbound runtime event diagnostics are best-effort
The agent shell SHALL treat diagnostic `received` runtime event callback output emitted for accepted inbound protocol messages as best-effort observability after protocol validation and before workflow handling. Diagnostic `received` event callback failure in this path MUST NOT emit a runtime error event, suppress consent workflow handling, suppress host visibility after explicit approval, skip required workflow audit persistence, skip signal authorization checks, send messages that would otherwise be blocked, grant permissions without explicit host approval, start capture, send input, reconnect peers, hide the session from the host, install services, configure startup persistence, elevate privileges, or bypass consent workflows. Diagnostic `received` event callback failure MUST NOT expose raw callback error text, raw request reason text, raw protocol payloads, tokens, pairing codes, credentials, private reasons, signal payloads, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets.

#### Scenario: Authorization request event callback failure is contained
- **WHEN** a host runtime receives a valid same-session `session-authorization-request`
- **AND** the diagnostic `received` event callback fails while observing the redacted inbound protocol event
- **THEN** the callback failure MUST NOT emit a runtime error event
- **AND** the host runtime MUST still process the request only through the normal explicit approval, visible-session, authorization, and workflow audit gates
- **AND** the viewer MAY receive the normal approved decision, active visible authorization state, approval workflow audit event, and active workflow audit event if those existing gates pass
- **AND** local runtime events and logs MUST NOT expose raw callback error text, raw request reason text, raw protocol payloads, tokens, pairing codes, credentials, private reasons, signal payloads, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets

### Requirement: Unsafe inbound raw event diagnostics are best-effort
The agent shell SHALL treat diagnostic `raw` runtime event callback output emitted for non-protocol inbound data and ignored unsafe inbound protocol messages as best-effort observability after the inbound input has been classified as rejected. Diagnostic `raw` event callback failure in this path MUST NOT emit a runtime error event, expose raw callback error text, expose raw inbound text or protocol payloads, send `session-authorization-decision`, send `session-authorization-state`, send `session-control`, send `permission-revoked`, send `signal`, send `peer-disconnected`, send workflow `audit-event` messages, grant permissions, change authorization lifecycle state, activate host visibility, start capture, send input, reconnect peers, suppress host visibility, hide the session from the host, install services, configure startup persistence, elevate privileges, or bypass consent workflows.

#### Scenario: Non-protocol raw event callback failure is contained
- **WHEN** the managed runtime receives inbound data that cannot be decoded as a protocol envelope
- **AND** the diagnostic `raw` event callback fails while observing the bounded non-protocol byte metadata
- **THEN** the callback failure MUST NOT emit a runtime error event
- **AND** the runtime MUST still attempt bounded non-protocol summary logging
- **AND** the callback failure MUST NOT send protocol messages, grant permissions, activate host visibility, start capture, send input, reconnect peers, or bypass consent workflows
- **AND** local runtime events and logs MUST NOT expose raw inbound text, raw callback error text, tokens, pairing codes, credentials, private reasons, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets

#### Scenario: Decoded unsafe protocol raw event callback failure is contained
- **WHEN** the managed runtime decodes an inbound protocol envelope but rejects it as unsafe for the current runtime before local `received` protocol event emission
- **AND** the diagnostic `raw` event callback fails while observing the bounded ignored unsafe inbound byte metadata
- **THEN** the callback failure MUST NOT emit a runtime error event
- **AND** the runtime MUST still attempt bounded ignored unsafe inbound summary logging
- **AND** the runtime MUST NOT treat the ignored message as a valid received protocol event
- **AND** the callback failure MUST NOT send authorization, lifecycle, control, permission, signal, disconnect, or workflow audit messages
- **AND** local runtime events and logs MUST NOT expose raw protocol payloads, session ids, peer ids, signal payloads, private reasons, raw callback error text, tokens, pairing codes, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets

### Requirement: Sent runtime event diagnostics are best-effort
The agent shell SHALL treat local `sent` runtime event callback output as best-effort diagnostics after an outbound protocol envelope has passed validation and has been written to the WebSocket. Diagnostic `sent` event callback failure in this path MUST NOT emit a runtime error event, expose raw callback error text, undo or reclassify the already-written send, block workflow continuation, suppress host visibility after explicit approval, skip required workflow audit sends that have already passed their audit persistence gate, grant permissions without explicit host approval, authorize signals without active visible permission, start capture, send input, reconnect peers, hide the session from the host, install services, configure startup persistence, elevate privileges, or bypass consent workflows. Diagnostic `sent` event callback failure MUST NOT expose raw protocol payloads, raw signal payloads, raw callback error text, tokens, pairing codes, credentials, private reasons, signal payload keys, audit details, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets.

#### Scenario: Workflow sent event callback failure is contained
- **WHEN** a host runtime explicitly approves a visible authorization request and sends workflow messages through the managed runtime
- **AND** a local `sent` runtime event callback fails while observing a redacted workflow `sent` event
- **THEN** the callback failure MUST NOT emit a runtime error event
- **AND** the viewer MAY still receive workflow messages that passed the existing consent, visibility, authorization, audit, and socket gates
- **AND** the host runtime MUST NOT grant permissions without explicit host approval, authorize signals without active visible permission, start capture, send input, reconnect peers, hide the session from the host, or bypass consent workflows
- **AND** local runtime events and logs MUST NOT expose raw callback error text, raw protocol payloads, raw request reason text, tokens, pairing codes, credentials, private reasons, signal payloads, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets

#### Scenario: Public signal sent event callback failure is contained
- **WHEN** caller code invokes public runtime `send()` with an authorized same-session `signal` after active visible `screen:view` authorization
- **AND** a local `sent` runtime event callback fails while observing the redacted signal `sent` event
- **THEN** the public send MUST NOT throw because of the callback failure
- **AND** the runtime MUST preserve the already-written signal send and redacted `sent` event view
- **AND** the callback failure MUST NOT authorize later signals, change authorization state, grant permissions, start capture, send input, reconnect peers, hide the session from the host, or bypass consent workflows
- **AND** local runtime events and logs MUST NOT expose raw callback error text, raw signal payloads, signal payload keys, tokens, pairing codes, credentials, private reasons, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets

#### Scenario: Blocked sends remain blocked before sent event diagnostics
- **WHEN** caller code invokes public runtime `send()` with malformed, cross-session, unauthorized, disconnected, unsafe, workflow-authority, or signal-gated protocol input
- **THEN** the runtime MUST still reject the send before socket write and before local `sent` event emission
- **AND** no diagnostic `sent` event callback failure can convert the blocked send into a socket write, permission grant, host visibility activation, signal authorization, capture, input, reconnect, hidden session, or consent bypass

### Requirement: Host consent prompt receives viewer device identity context
The agent shell SHALL pass bounded viewer device identity context to an interactive host consent provider when the host has observed a trusted opposite-role viewer `hello` for the authorization requester and that `hello` includes schema-valid `deviceIdentity`. The provider request MUST include only optional viewer device id and platform metadata. The provider request MUST NOT include remote self-asserted device trust-level metadata. This context MUST remain non-authorizing and MUST NOT grant permissions, approve authorization, activate host visibility, start signaling, start capture, send input, reconnect peers, invoke controls, emit workflow audit events by itself, or bypass consent workflows.

#### Scenario: Provider receives trusted viewer device metadata
- **WHEN** a host runtime receives a valid opposite-role viewer `hello` with matching schema-valid `deviceIdentity` before receiving that viewer's `session-authorization-request`
- **THEN** the interactive host decision provider request includes the viewer device id and platform
- **AND** the provider still requires an explicit approve or deny decision before any authorization decision is sent

#### Scenario: Provider suppresses self-asserted trust level
- **WHEN** a host runtime receives a valid opposite-role viewer `hello` whose schema-valid `deviceIdentity.trustLevel` is `verified`
- **THEN** the interactive host decision provider request MUST NOT include that remote self-asserted trust level
- **AND** trust-level suppression MUST NOT approve authorization, grant permissions, activate host visibility, start signaling, start capture, send input, reconnect peers, invoke controls, or bypass consent workflows

#### Scenario: Provider omits unavailable viewer device metadata
- **WHEN** the host runtime has not observed a trusted viewer `hello` with schema-valid device identity for the requesting viewer
- **THEN** the interactive host decision provider request omits viewer device identity fields
- **AND** omission MUST NOT approve authorization, grant permissions, activate host visibility, start signaling, start capture, send input, reconnect peers, invoke controls, or bypass consent workflows

#### Scenario: Stale viewer device metadata is not reused
- **WHEN** the host runtime has observed device identity for a different peer or a peer that has disconnected
- **THEN** a later authorization request MUST NOT receive stale viewer device identity metadata from the prior peer scope

### Requirement: Host consent prompt renders viewer device identity safely
The interactive host consent prompt SHALL render optional viewer device id and platform metadata when the direct prompt request contains safe bounded values. Missing or unsafe optional viewer device metadata MUST render as `unavailable` without echoing raw values. The prompt MUST NOT render remote self-asserted trust-level metadata as verified trust context. Rendering viewer device metadata MUST NOT grant permissions, approve authorization, activate host visibility, start signaling, start capture, send input, reconnect peers, invoke controls, emit workflow audit events, or bypass consent workflows.

#### Scenario: Prompt renders safe viewer device metadata
- **WHEN** the host consent prompt receives safe viewer device id and platform values
- **THEN** it prints bounded viewer device identity context before accepting the host's exact `approve` or `deny` response

#### Scenario: Prompt omits self-asserted trust level
- **WHEN** direct prompt caller input includes viewer trust-level metadata such as `verified`
- **THEN** the prompt does not print that value as viewer device trust context
- **AND** omission MUST NOT approve authorization, grant permissions, activate host visibility, start signaling, start capture, send input, reconnect peers, invoke controls, or bypass consent workflows

#### Scenario: Prompt suppresses unsafe viewer device metadata
- **WHEN** direct prompt caller input includes malformed, untrimmed, control-character, Unicode formatting-control, unknown, or secret-bearing viewer device metadata
- **THEN** the prompt prints `unavailable` for that optional device metadata
- **AND** prompt output MUST NOT expose raw unsafe device ids, raw unsafe platform text, pairing codes, tokens, credentials, protocol payloads, screen contents, input contents, clipboard contents, file-transfer contents, diagnostics dumps, or full secrets

#### Scenario: Device metadata remains prompt-only context
- **WHEN** host consent prompt rendering starts, succeeds, times out, receives invalid input, or fails closed
- **THEN** viewer device identity metadata MUST NOT by itself send authorization decisions, emit workflow audit events, grant permissions, activate host visibility, start signaling, start capture, send input, reconnect peers, invoke controls, or bypass consent workflows

### Requirement: Agent shell sends consent-bound remote interaction messages

The agent shell SHALL expose explicit non-native development runtime operations for sending `screen-frame` from host runtimes and `input-event` from viewer runtimes. Each operation MUST validate the message, role, session id, local peer id, observed recipient peer id, authorization id, active visible unexpired authorization status, and required permission immediately before writing to the socket.

#### Scenario: Host sends authorized development screen frame
- **WHEN** a host runtime has an active visible unexpired authorization that grants `screen:view`
- **AND** the host invokes the development screen-frame send operation with the current authorization id and a schema-valid frame
- **THEN** the runtime writes a metadata-only accepted local audit record before sending the `screen-frame` to the relay
- **AND** local sent events and logs MUST NOT expose raw frame bytes, encoded frame data, screenshots, screen contents, credentials, tokens, pairing codes, private reasons, or full secrets

#### Scenario: Viewer sends authorized development pointer input
- **WHEN** a viewer runtime has an active visible unexpired authorization that grants `input:pointer`
- **AND** the viewer invokes the development input-event send operation with the current authorization id and a schema-valid pointer event
- **THEN** the runtime writes a metadata-only accepted local audit record before sending the `input-event` to the relay
- **AND** local sent events and logs MUST NOT expose pointer coordinates, button values, raw input payloads, credentials, tokens, pairing codes, private reasons, or full secrets

#### Scenario: Viewer sends authorized development keyboard input
- **WHEN** a viewer runtime has an active visible unexpired authorization that grants `input:keyboard`
- **AND** the viewer invokes the development input-event send operation with the current authorization id and a schema-valid keyboard event
- **THEN** the runtime writes a metadata-only accepted local audit record before sending the `input-event` to the relay
- **AND** local sent events and logs MUST NOT expose key values, modifier values, raw input payloads, credentials, tokens, pairing codes, private reasons, keystroke buffers, or full secrets

#### Scenario: Local remote interaction send lacks authorization
- **WHEN** a host or viewer invokes a remote interaction send operation without active visible unexpired authorization for the required permission and matching authorization id
- **THEN** the runtime rejects the operation before audit acceptance, socket write, local sent event emission, rendering, capture side effects, input side effects, native adapter calls, reconnection, hidden session behavior, or consent bypass

#### Scenario: Local remote interaction audit fails
- **WHEN** a runtime is otherwise authorized to send a remote interaction message but accepted local audit persistence fails
- **THEN** the runtime rejects the operation before writing the message to the socket
- **AND** diagnostics MUST remain bounded and MUST NOT expose raw frame bytes, screen contents, pointer data, key data, modifier data, credentials, tokens, pairing codes, private reasons, or full secrets

### Requirement: Agent shell accepts inbound remote interaction messages only after matching authorization

The agent shell SHALL process inbound `screen-frame` and `input-event` envelopes as non-native development observations only when the sender role, sender peer id, session id, target peer id, authorization id, visible active unexpired authorization state, and required permission match the local runtime state. Inbound acceptance MUST NOT render frames, capture the screen, inject OS input, reconnect peers, suppress host visibility, install services, configure startup persistence, elevate privileges, hide sessions, collect credentials, or bypass Windows prompts.

#### Scenario: Viewer accepts authorized development screen frame
- **WHEN** a viewer runtime receives a `screen-frame` from the observed host for the active visible unexpired authorization that grants `screen:view`
- **THEN** the runtime emits only a redacted received event summary for the frame
- **AND** local events and logs MUST NOT expose raw frame bytes, encoded frame data, screenshots, screen contents, credentials, tokens, pairing codes, private reasons, or full secrets

#### Scenario: Host accepts authorized development input event
- **WHEN** a host runtime receives an `input-event` from the observed viewer for the active visible unexpired authorization that grants the matching input permission
- **THEN** the runtime emits only a redacted received event summary for the input intent
- **AND** local events and logs MUST NOT expose pointer coordinates, button values, key values, modifier values, raw input payloads, credentials, tokens, pairing codes, private reasons, keystroke buffers, or full secrets

#### Scenario: Inbound remote interaction is stale after pause or revoke
- **WHEN** a runtime receives a schema-valid remote interaction envelope after the relevant authorization is paused, revoked, terminated, expired, missing, invisible, or missing the required permission
- **THEN** the runtime rejects or ignores the envelope before trusted received event emission, rendering, capture side effects, input side effects, native adapter calls, reconnection, hidden session behavior, or consent bypass

#### Scenario: Inbound remote interaction is misbound
- **WHEN** a runtime receives a remote interaction envelope whose session id, sender peer id, target peer id, local role direction, or authorization id does not match the current observed peer and authorization
- **THEN** the runtime rejects or ignores the envelope before trusted received event emission, rendering, capture side effects, input side effects, native adapter calls, reconnection, hidden session behavior, or consent bypass

### Requirement: Agent shell remote interaction diagnostics remain metadata-only

The agent shell SHALL redact remote interaction data in public runtime events, diagnostic logs, thrown errors, local audit details, and raw-event summaries. Metadata-only summaries MAY include message type, message id, authorization id, frame id or event id, sequence, format, dimensions, payload byte length, input kind, and permission count, but MUST NOT include raw frame data, screen contents, pointer coordinates, button values, key values, modifier values, keylogging buffers, clipboard contents, file contents, diagnostics dumps, credentials, tokens, pairing codes, private reasons, or full secrets.

#### Scenario: Remote interaction sent event is redacted
- **WHEN** a runtime emits a local `sent` event for a `screen-frame` or `input-event`
- **THEN** the event contains only metadata-safe summary fields for the remote interaction payload
- **AND** it MUST NOT expose raw frame bytes, encoded frame data, pointer coordinates, button values, key values, modifier values, raw input payloads, credentials, tokens, pairing codes, private reasons, or full secrets

#### Scenario: Remote interaction rejection diagnostics are redacted
- **WHEN** a runtime rejects a malformed, unauthorized, misrouted, stale, or audit-blocked remote interaction send or inbound message
- **THEN** thrown errors, runtime events, and logs remain bounded and metadata-only
- **AND** they MUST NOT expose raw frame bytes, encoded frame data, screen contents, pointer coordinates, button values, key values, modifier values, raw input payloads, credentials, tokens, pairing codes, private reasons, or full secrets

### Requirement: Agent shell CLI exercises consent-bound development screen frames

The agent shell CLI SHALL expose a host-only non-native development operation that schedules at most one `screen-frame` send through the dedicated runtime screen-frame method. The operation MUST validate all CLI frame inputs before runtime startup, wait for an active visible unexpired authorization that grants `screen:view`, and rely on the runtime method for final authorization, routing, audit-before-send, socket, and redaction gates.

#### Scenario: Host schedules a development screen frame
- **WHEN** a host CLI process is started with the development screen-frame option and later has active visible unexpired `screen:view` authorization
- **THEN** it sends one schema-valid `screen-frame` through the dedicated runtime screen-frame method
- **AND** the send path MUST write metadata-only accepted local audit before socket write
- **AND** CLI output, runtime events, logs, and audit records MUST NOT expose raw frame bytes, encoded frame data, screenshots, screen contents, credentials, tokens, pairing codes, private reasons, or full secrets

#### Scenario: Host screen frame CLI fires after authorization loss
- **WHEN** a scheduled host development screen-frame send fires after authorization is paused, revoked, terminated, expired, invisible, missing, or no longer grants `screen:view`
- **THEN** it MUST fail closed before accepted-send audit, socket write, local sent event emission, capture side effects, rendering side effects, native adapter calls, reconnection, hidden session behavior, or consent bypass

#### Scenario: Screen frame CLI input is malformed
- **WHEN** a host CLI process is started with malformed development screen-frame configuration such as unsafe delay, unsupported format, invalid dimensions, malformed base64, oversized encoded data, unsafe frame id, or role-mismatched use
- **THEN** it exits through bounded usage handling before opening a relay connection, sending protocol messages, writing audit records, starting capture, rendering frames, invoking native adapters, or exposing the raw frame payload

### Requirement: Agent shell CLI exercises consent-bound development frame streams

The agent shell CLI SHALL expose a host-only non-native development operation that sends a finite sequence of `screen-frame` messages through the dedicated runtime screen-frame method. The operation MUST validate the frame source, frame count, frame interval, derived frame ids, and timing controls before runtime startup. Each frame send MUST wait for active visible unexpired authorization that grants `screen:view` and rely on the runtime method for final authorization, routing, audit-before-send, socket, and redaction gates.

#### Scenario: Host streams bounded development frames
- **WHEN** a host CLI process is started with a valid development screen-frame stream count greater than one and a positive interval
- **AND** the host later has active visible unexpired `screen:view` authorization
- **THEN** it sends no more than the configured count of schema-valid `screen-frame` messages through the dedicated runtime screen-frame method
- **AND** each frame uses a deterministic schema-valid derived frame id and monotonically increasing sequence
- **AND** each accepted send path MUST write metadata-only local audit before socket write
- **AND** CLI output, runtime events, logs, and audit records MUST NOT expose raw frame bytes, encoded frame data, screenshots, screen contents, credentials, tokens, pairing codes, private reasons, or full secrets

#### Scenario: Frame stream waits for authorization
- **WHEN** the host CLI frame stream starts before active visible `screen:view` authorization exists
- **THEN** it waits without sending frames, writing accepted-send audit records, emitting local sent events, opening native adapters, capturing the screen, reconnecting peers, granting permissions, hiding the session, or bypassing consent

#### Scenario: Frame stream stops after authorization loss
- **WHEN** a host CLI frame stream has sent fewer than the configured count and authorization becomes paused, revoked, terminated, expired, invisible, disconnected, or no longer grants `screen:view`
- **THEN** it MUST stop before any further accepted-send audit, socket write, local sent event emission, capture side effects, rendering side effects, native adapter calls, reconnection, hidden session behavior, or consent bypass
- **AND** it MUST NOT continue retrying in a send loop

#### Scenario: Frame stream configuration is malformed
- **WHEN** a host CLI process is started with malformed development frame stream configuration such as missing positive interval for multi-frame streaming, unsafe frame count, frame id suffix overflow, role-mismatched use, malformed frame source, or unsupported frame source option combinations
- **THEN** it exits through bounded usage handling before opening a relay connection, sending protocol messages, writing audit records, starting capture, rendering frames, invoking native adapters, or exposing the raw frame payload

#### Scenario: Frame stream remains non-native
- **WHEN** a host uses development frame stream CLI options
- **THEN** the process MUST NOT capture the screen, read arbitrary frame files, render a remote desktop UI, inject OS input, sync clipboard, transfer files, collect diagnostics, install services, configure startup persistence, elevate privileges, run unattended, collect credentials, keylog, evade AV/EDR, or bypass Windows prompts

### Requirement: Agent shell CLI exercises consent-bound development input events

The agent shell CLI SHALL expose a viewer-only non-native development operation that schedules at most one `input-event` send through the dedicated runtime input-event method. The operation MUST validate all CLI input-event fields before runtime startup, wait for active visible unexpired authorization that grants the required input permission, and rely on the runtime method for final authorization, routing, audit-before-send, socket, and redaction gates.

#### Scenario: Viewer schedules development pointer input
- **WHEN** a viewer CLI process is started with a development pointer input option and later observes active visible unexpired authorization that grants `input:pointer`
- **THEN** it sends one schema-valid pointer `input-event` through the dedicated runtime input-event method
- **AND** the send path MUST write metadata-only accepted local audit before socket write
- **AND** CLI output, runtime events, logs, and audit records MUST NOT expose pointer coordinates, button values, raw input payloads, credentials, tokens, pairing codes, private reasons, or full secrets

#### Scenario: Viewer schedules development keyboard input
- **WHEN** a viewer CLI process is started with a development keyboard input option and later observes active visible unexpired authorization that grants `input:keyboard`
- **THEN** it sends one schema-valid keyboard `input-event` through the dedicated runtime input-event method
- **AND** the send path MUST write metadata-only accepted local audit before socket write
- **AND** CLI output, runtime events, logs, and audit records MUST NOT expose key values, code values, modifier values, raw input payloads, credentials, tokens, pairing codes, private reasons, keystroke buffers, or full secrets

#### Scenario: Viewer input CLI fires after authorization loss
- **WHEN** a scheduled viewer development input send fires after authorization is paused, revoked, terminated, expired, invisible, missing, or no longer grants the required input permission
- **THEN** it MUST fail closed before accepted-send audit, socket write, local sent event emission, host input side effects, native adapter calls, reconnection, hidden session behavior, or consent bypass

#### Scenario: Input CLI configuration is malformed
- **WHEN** a viewer CLI process is started with malformed development input configuration such as unsafe delay, unknown input kind, invalid pointer coordinate, invalid button, invalid key/code/modifier value, role-mismatched use, missing required input permission, or keylogging-buffer-shaped data
- **THEN** it exits through bounded usage handling before opening a relay connection, sending protocol messages, writing audit records, invoking host input side effects, invoking native adapters, or exposing raw input details

### Requirement: Agent shell applies inbound Windows input only after explicit host opt-in

The agent shell SHALL expose a host-only opt-in runtime configuration for
applying accepted inbound `input-event` messages through the Windows input
adapter. The runtime MUST keep native input application disabled by default. On
an opted-in host, native input MUST be invoked only after the inbound
`input-event` passes existing sender role, sender peer id, session id, target
peer id, authorization id, visible active unexpired authorization state, and
required `input:pointer` or `input:keyboard` permission checks. The runtime MUST
write metadata-only local audit before invoking the Windows input adapter, and
audit failure MUST block native input.

#### Scenario: Host applies authorized pointer input
- **WHEN** an opted-in host runtime with local audit configuration receives a pointer `input-event` from the observed viewer for the active visible unexpired authorization that grants `input:pointer`
- **THEN** the runtime writes metadata-only local input-application audit before invoking the Windows input adapter
- **AND** the adapter receives a grant snapshot bound to the current authorization, visibility, permissions, expiry, and connected viewer state
- **AND** local events, logs, audit records, thrown errors, and status output MUST NOT expose pointer coordinates, button values, raw input payloads, credentials, tokens, pairing codes, private reasons, command output, or full secrets

#### Scenario: Host applies authorized keyboard input
- **WHEN** an opted-in host runtime with local audit configuration receives a keyboard `input-event` from the observed viewer for the active visible unexpired authorization that grants `input:keyboard`
- **THEN** the runtime writes metadata-only local input-application audit before invoking the Windows input adapter
- **AND** local events, logs, audit records, thrown errors, and status output MUST NOT expose key values, code values, modifier values, raw input payloads, keylogging buffers, credentials, tokens, pairing codes, private reasons, command output, or full secrets

#### Scenario: Host input application is not opted in
- **WHEN** a host runtime receives an otherwise authorized `input-event` while native input application is disabled
- **THEN** the runtime keeps existing metadata-only inbound observation behavior and MUST NOT write input-application audit, invoke the Windows input adapter, inject OS input, reconnect peers, hide the session, or bypass consent

#### Scenario: Host input application lacks local audit
- **WHEN** a host runtime is configured to apply inbound input without a local audit sink
- **THEN** runtime creation or startup fails closed before opening a relay connection, receiving input, invoking the Windows input adapter, injecting OS input, reconnecting peers, hiding the session, or bypassing consent

#### Scenario: Input application audit fails
- **WHEN** an opted-in host is otherwise authorized to apply an inbound `input-event` but metadata-only local audit persistence fails
- **THEN** the runtime rejects before invoking the Windows input adapter, injecting OS input, writing trusted success metadata, reconnecting peers, hiding the session, or bypassing consent
- **AND** diagnostics MUST NOT expose pointer coordinates, button values, key values, modifier values, raw input payloads, keylogging buffers, credentials, tokens, pairing codes, private reasons, command output, or full secrets

#### Scenario: Authorization is lost before input application
- **WHEN** a host receives an `input-event` after authorization is paused, revoked, terminated, expired, invisible, disconnected, missing, mismatched, or missing the required input permission
- **THEN** the runtime rejects or ignores the event before input-application audit, Windows input adapter invocation, trusted received event emission, injected OS input, reconnection, hidden session behavior, or consent bypass

#### Scenario: Windows input adapter fails
- **WHEN** an opted-in host passes an authorized inbound input event to the Windows input adapter and the adapter rejects or fails
- **THEN** the runtime reports only bounded generic failure metadata
- **AND** it MUST NOT expose pointer coordinates, button values, key values, modifier values, raw input payloads, keylogging buffers, credentials, tokens, pairing codes, private reasons, command output, or full secrets

#### Scenario: Host input application remains scoped
- **WHEN** a host enables inbound Windows input application
- **THEN** the process MUST NOT capture input, keylog, read clipboard data, sync clipboard, transfer files, collect diagnostics, install services, configure startup persistence, elevate privileges, run unattended, collect credentials, evade AV/EDR, bypass Windows prompts, hide the active host session indicator, or suppress host pause, revoke, terminate, or disconnect controls

### Requirement: Agent shell CLI remote interaction diagnostics remain metadata-only

The agent shell CLI SHALL keep all remote interaction exerciser diagnostics metadata-only. CLI usage errors, expected send failures, unexpected runtime diagnostics, logs, and local status output MUST NOT include raw frame data, screen contents, pointer coordinates, button values, key values, code values, modifier values, raw input payloads, keylogging buffers, clipboard contents, file contents, diagnostics dumps, credentials, tokens, pairing codes, private reasons, or full secrets.

#### Scenario: Scheduled remote interaction send fails
- **WHEN** a scheduled CLI remote interaction send fails because authorization is missing, stale, misrouted, audit-blocked, disconnected, malformed, or otherwise rejected
- **THEN** the CLI reports only bounded generic failure metadata
- **AND** it MUST NOT retry in a loop, reconnect peers, grant permissions, suppress host visibility, start capture, inject input, install services, configure startup persistence, elevate privileges, hide the session, or bypass Windows prompts

#### Scenario: Remote interaction CLI remains non-native
- **WHEN** a host or viewer uses the development remote interaction CLI options
- **THEN** the process MUST NOT capture the screen, render a remote desktop UI, inject OS input, sync clipboard, transfer files, collect diagnostics, install services, configure startup persistence, elevate privileges, run unattended, collect credentials, keylog, evade AV/EDR, or bypass Windows prompts

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

### Requirement: Agent shell viewer writes consent-bound screen frames to an explicit output file

The agent shell CLI SHALL expose an explicit viewer-only latest-frame file
output for development MVP checks. The output path MUST be configured through
the validated `--viewer-screen-frame-output` option, the viewer MUST request
`screen:view`, and the viewer MUST configure local audit persistence before the
runtime starts. The runtime MUST persist frame bytes only after inbound
`screen-frame` sender role, target peer, authorization id, active visible
unexpired authorization, `screen:view` permission, and metadata-only output
audit gates pass. Each latest-frame update MUST create the configured output
directory recursively before publishing complete frame bytes by writing to a
same-directory temporary file and then replacing the configured output path; the
local viewer surface MUST NOT be able to read a partially written frame as
trusted current state. Output writes, logs, local events, HTTP responses, and
audit records MUST NOT expose raw frame bytes, encoded frame data, screenshots,
screen contents, credentials, tokens, pairing codes, private reasons, or full
secrets.

#### Scenario: Viewer writes a complete latest frame

- **WHEN** a viewer with configured latest-frame output receives an authorized
  inbound `screen-frame` and metadata-only output audit succeeds
- **THEN** it creates the configured output directory recursively before writing
  the decoded frame bytes to a temporary file in that directory
- **AND** it replaces the configured latest-frame path only after the full frame
  write succeeds
- **AND** the configured latest-frame path contains either the previous complete
  frame or the new complete frame, never a partially written frame
- **AND** diagnostics and audit remain metadata-only

#### Scenario: Latest-frame replacement fails

- **WHEN** the runtime cannot create the configured output directory, write the
  temporary frame file, or replace the configured latest-frame path
- **THEN** it fails closed before treating the new frame as published
- **AND** the failure MUST NOT send protocol messages, grant permissions,
  reconnect peers, start capture, send input, hide the host session, bypass
  consent, or expose raw frame bytes, encoded frame data, screenshots, screen
  contents, credentials, tokens, pairing codes, private reasons, or full secrets

### Requirement: Agent shell viewer serves a loopback local control surface

The agent shell CLI SHALL expose an opt-in viewer-only local control surface
that binds only to `127.0.0.1` on an explicitly configured port, requires the
existing explicit viewer screen-frame output path, and stops with the CLI
runtime shutdown. The surface SHALL serve only the configured latest-frame path
through a no-store frame endpoint and MUST NOT serve arbitrary paths,
same-directory temporary frame output files, raw directory listings, or host
machine files. The generated page SHALL load replacement frames through a
bounded same-origin preload step and SHALL replace the displayed frame only
after the replacement image has loaded. While a displayed frame is ready, a
replacement refresh MAY be in progress without making the displayed frame
not-ready. Before any displayed frame is ready, failed or missing frame refreshes
MUST keep the local surface in a not-ready state without enabling browser
pointer arming. The surface SHALL serve no-store/nosniff HTML with a
nonce-based Content Security Policy for generated inline style and script, and
SHALL expose only token-protected local POST endpoints for input and local
viewer disconnect actions.

#### Scenario: Local surface preloads replacement frames

- **WHEN** the generated local viewer page already displays a ready frame and
  starts refreshing the latest frame endpoint
- **THEN** it preloads the replacement frame before swapping the displayed frame
- **AND** browser pointer arming MAY remain available for the currently
  displayed ready frame while the replacement is loading
- **AND** a failed replacement refresh MUST NOT expose frame paths, frame bytes,
  raw error bodies, tokens, pairing codes, private reasons, or diagnostics

### Requirement: Local viewer surface displays only the configured latest frame

The local viewer surface SHALL serve generated HTML for a loopback-only viewer
page and SHALL serve the current configured latest-frame file through a fixed
`/frame` endpoint only after the file is available for the current surface run.
The generated page SHALL poll only bounded local status metadata and the fixed
frame endpoint. The generated page MAY display the bounded
`signalProbeAckReceived=true` viewer status flag when present, but MUST NOT
expose authorization ids, raw signal payload markers, payload keys, payload
values, peer ids, display names, private reasons, tokens, pairing codes,
credentials, screen contents, input contents, clipboard contents,
file-transfer contents, diagnostics dumps, or raw protocol data. The generated
page MUST NOT treat signal acknowledgement status as authorization or as
permission to send input; input authorization remains enforced by the existing
runtime gates.

#### Scenario: Local surface shows bounded signal acknowledgement readiness

- **WHEN** the local viewer page polls `/status` and receives
  `signalProbeAckReceived=true`
- **THEN** the visible local status text includes
  `signalProbeAckReceived=true`
- **AND** it MUST NOT include raw signal markers, authorization ids, peer ids,
  display names, tokens, pairing codes, credentials, private reasons, screen
  contents, input contents, clipboard contents, file-transfer contents, or
  diagnostics dumps
- **AND** displaying the flag MUST NOT send protocol messages, grant
  permissions, start capture, send input, invoke host controls, reconnect
  peers, or bypass consent

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
ready displayed frame before they can send pointer input. Browser-native context
menu and image drag defaults MAY be suppressed for the displayed remote frame
only and MUST NOT be suppressed through document-level or window-level pointer
capture. The surface MUST verify that the current viewer status is active,
visible, and bound to an authorization id before requesting the runtime send.
The runtime remains authoritative for required permission, peer routing,
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

- **WHEN** the generated local viewer page is loaded and no displayed frame is
  ready
- **THEN** browser pointer movement, wheel, and pointer button handlers are not
  armed to send remote input
- **AND** the visible pointer arming control is disabled until a displayed frame
  is ready
- **AND** pointer handlers can send only after the viewer user uses the visible
  same-page pointer arming control while a displayed frame is ready
- **AND** arming state changes MUST NOT send pointer input, grant permissions,
  bypass runtime authorization gates, install global pointer listeners, or hide
  the host active-session indicator

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

### Requirement: Agent shell CLI signal shutdown is idempotent

The agent shell CLI SHALL handle SIGINT and SIGTERM through a single
idempotent shutdown path. After the first handled signal, the CLI MUST stop
local prompt, status, viewer surface, disconnect, remote interaction, and
managed runtime handles through the existing shutdown ordering before exiting.
Additional SIGINT or SIGTERM events while shutdown is in progress or complete
MUST NOT start a second cleanup attempt, send protocol messages, reconnect
peers, grant permissions, keep local listeners alive, expose secrets, hide the
host active-session indicator, or bypass consent.

#### Scenario: Signal shutdown succeeds once

- **WHEN** the agent shell CLI receives SIGINT or SIGTERM
- **THEN** it starts the existing local shutdown sequence at most once
- **AND** successful cleanup exits with code `0`

#### Scenario: Signal shutdown fails closed

- **WHEN** the existing local shutdown sequence rejects during signal handling
- **THEN** the CLI reports the failure through bounded agent-shell diagnostics
- **AND** it exits with code `1`
- **AND** later signals MUST NOT start another cleanup attempt or expose raw
  tokens, pairing codes, credentials, private reasons, screen contents, input
  contents, clipboard contents, file-transfer contents, or diagnostics dumps

### Requirement: Viewer local control surface supports explicit key modifiers

The opt-in viewer local control surface SHALL expose visible fixed modifier toggles for `shift`, `control`, `alt`, and `meta` that can be applied only to explicit keyboard button actions. Modifier toggles MUST be disabled until a displayed frame is ready, MUST NOT send input by themselves, and MUST be cleared after one attempted explicit key press. The surface MUST continue routing key input through the existing token-protected same-origin `/input` path and runtime `sendInputEvent()` authorization checks. It MUST NOT install document-level or window-level keyboard listeners, buffer typed text, record macros, capture keystrokes, read clipboard data, expose key or modifier values in HTTP responses, or bypass host consent and active visible `input:keyboard` authorization.

#### Scenario: Modifier toggles apply to one explicit key press

- **WHEN** the viewer page has a ready frame, the viewer enables a visible modifier toggle, and then clicks an explicit keyboard button
- **THEN** the page sends the existing bounded `key-down <key> <modifiers>` and `key-up <key> <modifiers>` commands through the protected `/input` path
- **AND** it clears modifier toggles after that attempted key press
- **AND** the server response remains metadata-only and does not expose key values, modifier values, raw command text, tokens, pairing codes, credentials, private reasons, or full secrets

#### Scenario: Modifier toggles do not capture keyboard input

- **WHEN** the viewer local control surface is rendered
- **THEN** it provides only fixed visible modifier buttons and existing explicit key buttons for modified keyboard input
- **AND** it MUST NOT attach document-level or window-level keyboard listeners, buffer typed text, record macros, read clipboard data, send modifier-only input, or bypass runtime authorization gates

#### Scenario: Modifier toggles stay unavailable before a frame is ready

- **WHEN** the viewer local control surface has no displayed ready frame
- **THEN** modifier toggles are disabled along with pointer arming controls
- **AND** toggling modifier UI MUST NOT send input, grant permissions, activate visibility, hide host indicators, or start capture

### Requirement: Local viewer surface displays bounded frame freshness

The opt-in viewer local control surface SHALL display bounded local freshness
metadata for the currently displayed frame. The generated page SHALL update
freshness based only on local browser time since the last successful displayed
frame replacement and SHALL mark the frame stale after a bounded local
threshold. Freshness text MUST NOT expose frame paths, frame bytes, frame URLs,
file timestamps, local filesystem metadata, raw fetch errors, mutation tokens,
authorization ids, peer ids, display names, pairing codes, relay tokens,
credentials, screen contents, input contents, clipboard contents, protocol
payloads, diagnostics dumps, or full secrets. Freshness display MUST NOT grant
permissions, send input, reconnect peers, start capture, hide host visibility,
or bypass runtime authorization gates.

#### Scenario: Freshness updates after a frame loads

- **WHEN** the generated local viewer page successfully loads and displays a
  replacement frame
- **THEN** the frame status text includes bounded freshness metadata such as
  `frameAgeMs=<bucket>`
- **AND** the status remains metadata-only and does not include frame paths,
  URLs, byte contents, authorization ids, tokens, pairing codes, credentials,
  private reasons, screen contents, input contents, raw errors, or protocol
  payloads

#### Scenario: Freshness marks stale displayed frames

- **WHEN** the generated local viewer page has a previously displayed frame and
  no successful replacement has loaded within the bounded stale threshold
- **THEN** the frame status text marks the displayed frame as stale
- **AND** the stale marker MUST NOT send input, grant permissions, reconnect
  peers, start capture, hide host visibility, suppress host controls, or bypass
  consent

### Requirement: Local viewer surface gates visible input controls on readiness

The opt-in viewer local control surface SHALL keep visible input-sending
controls disabled until the generated page has both a ready displayed frame and
sanitized viewer status indicating active visible authorization with bounded
input readiness metadata for the matching input kind. The generated page SHALL
gate pointer arming and browser pointer interactions on bounded `input:pointer`
readiness metadata, and SHALL gate explicit key buttons and modifier toggles on
bounded `input:keyboard` readiness metadata. The manual send action SHALL remain
disabled until at least one input permission readiness flag is true. The
disconnect action MAY remain available while input is not ready. This local UI
gate MUST NOT replace runtime authorization: every input POST MUST still pass
the existing token, origin, content-type, active visible authorization,
permission, routing, socket, audit, pause, revoke, termination, expiration,
disconnect, and redaction gates. Readiness text, status responses, and HTTP
responses MUST NOT expose authorization ids, raw permission lists, raw command
text, pointer coordinates, key values, modifier values, frame paths, frame
bytes, tokens, pairing codes, credentials, private reasons, screen contents,
input contents, clipboard contents, diagnostics dumps, or full secrets.

#### Scenario: Input controls are disabled before readiness

- **WHEN** the generated viewer page has no ready displayed frame, sanitized
  viewer status is inactive or invisible, or neither input permission readiness
  flag is true
- **THEN** visible controls that can send input remain disabled or unarmed
- **AND** the page MUST NOT send input, grant permissions, activate visibility,
  reconnect peers, start capture, hide host visibility, or bypass runtime
  authorization gates

#### Scenario: Pointer controls require pointer readiness

- **WHEN** the generated viewer page has a ready displayed frame and sanitized
  viewer status reports active visible authorization with
  `inputPointerReady=false`
- **THEN** pointer arming and browser pointer interactions remain unavailable
- **AND** the page MUST NOT send pointer input, grant permissions, hide host
  visibility, or bypass runtime authorization gates

#### Scenario: Keyboard controls require keyboard readiness

- **WHEN** the generated viewer page has a ready displayed frame and sanitized
  viewer status reports active visible authorization with
  `inputKeyboardReady=false`
- **THEN** explicit key buttons and modifier toggles remain unavailable
- **AND** the page MUST NOT send keyboard input, buffer typed text, capture
  keystrokes, read clipboard data, or bypass runtime authorization gates

#### Scenario: Input controls enable after matching local readiness

- **WHEN** the generated viewer page has a ready displayed frame and sanitized
  viewer status reports active visible authorization with
  `inputPointerReady=true` or `inputKeyboardReady=true`
- **THEN** only the visible controls for the matching ready input kind may
  become enabled
- **AND** accepted clicks still route through the existing token-protected
  local `/input` path and runtime authorization gates

#### Scenario: Readiness metadata remains bounded

- **WHEN** the local viewer page polls `/status`
- **THEN** the response may include only bounded boolean input readiness
  metadata for supported input kinds
- **AND** it MUST NOT include raw permission arrays, authorization ids,
  command text, pointer coordinates, key values, modifier values, frame paths,
  frame bytes, tokens, pairing codes, credentials, private reasons, screen
  contents, input contents, clipboard contents, diagnostics dumps, or full
  secrets

### Requirement: Viewer local surface supports explicit ephemeral loopback port

The agent shell SHALL accept `--viewer-control-surface-port 0` only for the
existing viewer-only local surface path that also requires explicit
`--viewer-screen-frame-output`, local audit configuration, and requested
`screen:view`. When `0` is configured, the surface SHALL bind only to
`127.0.0.1` with an OS-assigned ephemeral port, resolve the actual listener
port after successful startup, and log only the bounded loopback URL for the
operator to open. The surface MUST NOT bind to LAN interfaces, expose mutation
tokens, start hidden browser processes, bypass consent, or weaken runtime
authorization and audit gates.

#### Scenario: Ephemeral viewer surface port resolves to loopback URL

- **WHEN** a viewer starts the local control surface with
  `--viewer-control-surface-port 0` and all existing viewer frame-output gates
  pass
- **THEN** the local surface listens on `127.0.0.1` with an assigned TCP port
- **AND** the logged URL uses `http://127.0.0.1:<resolved-port>/`
- **AND** logs and status output MUST NOT expose mutation tokens, frame bytes,
  pairing codes, credentials, raw command bodies, screen contents, input
  contents, clipboard contents, or full secrets

#### Scenario: Ephemeral viewer surface port preserves existing denials

- **WHEN** `--viewer-control-surface-port 0` is used by a host, without frame
  output, without `screen:view`, or without local audit configuration
- **THEN** parsing fails before relay startup
- **AND** diagnostics remain bounded and do not echo raw unsafe input

### Requirement: Viewer local surface validates loopback Host header

The opt-in viewer local control surface SHALL reject every request whose `Host`
header is missing or does not exactly match the resolved loopback surface host
and port. Host-header rejection MUST happen before serving HTML, sanitized
status, frame bytes, input requests, or disconnect requests. Rejection responses
MUST be bounded and MUST NOT expose mutation tokens, authorization IDs, frame
paths, frame bytes, local file paths, command contents, input contents, requested
host names, credentials, or raw diagnostics.

#### Scenario: Canonical loopback host is accepted

- **WHEN** the viewer local control surface is started on its resolved
  `127.0.0.1:<port>` URL
- **THEN** requests using that exact `Host` value can reach the existing
  route-specific HTML, status, frame, input, and disconnect checks

#### Scenario: Mismatched host is rejected before read data

- **WHEN** a request for `/`, `/status`, or `/frame` uses a different `Host`
  value from the resolved loopback surface URL
- **THEN** the surface rejects the request before serving HTML, status, or frame
  bytes
- **AND** the response does not expose tokens, authorization IDs, frame bytes,
  local file paths, or the provided host name

#### Scenario: Mismatched host is rejected before mutation behavior

- **WHEN** a request for `/input` or `/disconnect` uses a different or missing
  `Host` value
- **THEN** the surface rejects the request before reading authorization state,
  sending input events, or leaving the viewer runtime
- **AND** the response does not expose command contents, input contents,
  mutation tokens, or the provided host name

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

