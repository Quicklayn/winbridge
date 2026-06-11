## ADDED Requirements

### Requirement: Peer disconnect state handling
The agent shell SHALL treat a received `peer-disconnected` message as remote peer disconnected state for the current development session.

#### Scenario: Viewer receives host disconnect notice
- **WHEN** the host peer disconnects while a viewer shell remains connected through the relay
- **THEN** the viewer shell receives and records the `peer-disconnected` protocol message without starting capture, sending input, reconnecting, or granting permissions

#### Scenario: Host suppresses delayed workflow after viewer disconnect
- **WHEN** the host shell has delayed workflow simulation scheduled and receives `peer-disconnected` for the viewer
- **THEN** the host shell MUST NOT send later revoke, pause, resume, termination, expiration, authorization state, session control, permission revoke, or workflow audit-event messages for that disconnected peer

#### Scenario: Disconnect summary logging is secret-safe
- **WHEN** the agent shell logs a received peer disconnect notice
- **THEN** the log MAY include peer id, peer role, message id, and bounded reason code, and MUST NOT include raw tokens, raw pairing codes, credentials, raw protocol payloads, keystrokes, screenshots, screen contents, or full secrets

#### Scenario: Disconnect state is not authorization
- **WHEN** the agent shell records remote peer disconnect state
- **THEN** the state MUST NOT approve authorization, activate a visible session, grant permissions, start capture, send input, reconnect the peer, suppress host visibility, or bypass consent workflows
