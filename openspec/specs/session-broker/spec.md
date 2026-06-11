# session-broker Specification

## Purpose
TBD - created by archiving change bootstrap-remote-assistance-platform. Update Purpose after archive.
## Requirements
### Requirement: Pairing-based session join
The system SHALL require peers to join a brokered session using an explicit session id, role, peer id, and pairing credential before relay messages are accepted.

#### Scenario: Peer joins with required fields
- **WHEN** a peer connects to the relay with a valid session id, role, peer id, and pairing credential
- **THEN** the relay registers the peer in that session and returns a relay-ready message

#### Scenario: Peer omits required fields
- **WHEN** a peer connects without required join fields
- **THEN** the relay rejects the connection before forwarding any peer message

### Requirement: Two-party relay room
The relay SHALL limit each development session room to one host peer and one viewer peer unless a future OpenSpec change introduces multi-viewer semantics.

#### Scenario: Third peer attempts to join
- **WHEN** a session room already contains a host and a viewer
- **THEN** the relay rejects additional peers for that room

### Requirement: Message schema validation
The relay and agents SHALL validate protocol envelopes before accepting or forwarding messages.

#### Scenario: Invalid protocol message
- **WHEN** a peer sends malformed JSON or an unknown protocol message
- **THEN** the receiver rejects the message and emits an audit/error event without forwarding it as trusted data

### Requirement: Development relay token
The relay SHALL support an optional shared token for local/private development and SHALL document that production deployments require stronger identity and authorization.

#### Scenario: Shared token configured
- **WHEN** the relay is started with a shared token
- **THEN** peers without the matching token are rejected before joining a session room

#### Scenario: Shared token omitted
- **WHEN** the relay is started without a shared token
- **THEN** the relay starts in development mode and logs a warning that it is not production authorization

### Requirement: Host-created pairing gate
The relay SHALL require a host-created pairing ticket before registering a viewer in a brokered development session.

#### Scenario: Viewer joins before host
- **WHEN** a viewer attempts to join a relay session before the host has created pairing material
- **THEN** the relay rejects the viewer before registration and does not create a viewer-originated pairing ticket

#### Scenario: Viewer joins after host with valid pairing
- **WHEN** a host has joined and a viewer presents the matching unexpired pairing credential
- **THEN** the relay registers the viewer and returns a relay-ready message

#### Scenario: Invalid pairing fails before forwarding
- **WHEN** a viewer presents missing, mismatched, expired, or consumed pairing material
- **THEN** the relay rejects the join before forwarding any peer message from that viewer

### Requirement: Peer disconnect notification
The relay SHALL send a schema-valid peer disconnect notification to remaining peers in a brokered two-party session when a registered peer disconnects.

#### Scenario: Host disconnects from a paired session
- **WHEN** a registered host disconnects from a relay room that still contains a viewer
- **THEN** the relay sends the viewer a `peer-disconnected` protocol message identifying the host peer id, host role, session id, and a bounded reason code

#### Scenario: Viewer disconnects from a paired session
- **WHEN** a registered viewer disconnects from a relay room that still contains a host
- **THEN** the relay sends the host a `peer-disconnected` protocol message identifying the viewer peer id, viewer role, session id, and a bounded reason code

#### Scenario: Disconnect notification does not grant remote action
- **WHEN** a peer receives a `peer-disconnected` protocol message
- **THEN** the message MUST NOT grant permissions, start capture, send input, reconnect the peer, bypass authorization, or override host consent state

#### Scenario: No remaining peer
- **WHEN** a registered peer disconnects from a room with no other registered peer
- **THEN** the relay records the disconnect without sending a peer disconnect notification

#### Scenario: Secret-safe disconnect reason
- **WHEN** the relay sends a peer disconnect notification
- **THEN** the notification MUST contain only a bounded reason code and MUST NOT include raw close reasons, pairing codes, tokens, protocol payloads, keystrokes, screenshots, or screen contents

### Requirement: Relay-originated disconnect notice authority
The relay SHALL treat `peer-disconnected` as a relay-originated lifecycle notice and MUST reject peer-originated `peer-disconnected` messages before forwarding.

#### Scenario: Peer attempts forged disconnect notice
- **WHEN** a registered peer sends a `peer-disconnected` message as an ordinary peer message
- **THEN** the relay rejects the message before forwarding it to the remaining peer

#### Scenario: Relay sends broker-observed disconnect notice
- **WHEN** the relay observes a registered peer disconnect through the transport close path
- **THEN** the relay may send a `peer-disconnected` notice to remaining peers using safe bounded disconnect metadata

#### Scenario: Forged notice does not change remote lifecycle state
- **WHEN** the relay rejects a peer-originated `peer-disconnected` message
- **THEN** the remaining peer MUST NOT receive that forged notice and MUST NOT change session lifecycle state because of it
