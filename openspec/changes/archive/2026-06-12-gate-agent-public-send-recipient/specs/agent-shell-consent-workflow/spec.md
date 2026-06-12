## ADDED Requirements

### Requirement: Public send recipient binding
The agent shell SHALL reject public managed runtime `send()` calls for peer-directed protocol messages before socket write and before local `sent` event emission until the runtime has observed a recipient peer through an accepted paired `relay-ready` message or an accepted inbound peer `hello`. Recipient availability SHALL be connection-scoped and SHALL be cleared after a trusted remote peer disconnect notice.

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
