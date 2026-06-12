## ADDED Requirements

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
