## MODIFIED Requirements

### Requirement: Peer disconnect notification
The relay SHALL send a schema-valid peer disconnect notification to remaining peers in a brokered two-party session when a registered peer disconnects. Disconnect notifications SHALL use only bounded relay-defined reason codes such as `peer-closed` for ordinary close cleanup and `heartbeat-timeout` for heartbeat timeout cleanup.

#### Scenario: Host disconnects from a paired session
- **WHEN** a registered host disconnects from a relay room that still contains a viewer
- **THEN** the relay sends the viewer a `peer-disconnected` protocol message identifying the host peer id, host role, session id, and a bounded reason code

#### Scenario: Viewer disconnects from a paired session
- **WHEN** a registered viewer disconnects from a relay room that still contains a host
- **THEN** the relay sends the host a `peer-disconnected` protocol message identifying the viewer peer id, viewer role, session id, and a bounded reason code

#### Scenario: Heartbeat timeout disconnect is identified
- **WHEN** a registered peer is disconnected by relay heartbeat timeout
- **THEN** the remaining peer receives a `peer-disconnected` protocol message with reason code `heartbeat-timeout`

#### Scenario: Disconnect notification does not grant remote action
- **WHEN** a peer receives a `peer-disconnected` protocol message
- **THEN** the message MUST NOT grant permissions, start capture, send input, reconnect the peer, bypass authorization, or override host consent state

#### Scenario: No remaining peer
- **WHEN** a registered peer disconnects from a room with no other registered peer
- **THEN** the relay records the disconnect without sending a peer disconnect notification

#### Scenario: Secret-safe disconnect reason
- **WHEN** the relay sends a peer disconnect notification
- **THEN** the notification MUST contain only a bounded reason code and MUST NOT include raw close reasons, pairing codes, tokens, protocol payloads, keystrokes, screenshots, or screen contents
