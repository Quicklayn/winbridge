## MODIFIED Requirements

### Requirement: Stale peer timeout
The relay SHALL close an accepted WebSocket peer that does not respond to a relay heartbeat within the configured timeout, and SHALL classify the resulting broker-observed disconnect with bounded reason code `heartbeat-timeout`.

#### Scenario: Peer misses heartbeat response
- **WHEN** an accepted peer is awaiting a heartbeat response beyond the configured timeout
- **THEN** the relay terminates that peer connection and removes the peer from relay room membership through the normal close cleanup

#### Scenario: Heartbeat timeout uses bounded disconnect reason
- **WHEN** the relay terminates a registered peer because the peer missed heartbeat response
- **THEN** any `peer-disconnected` notice and disconnect audit emitted during cleanup use reason code `heartbeat-timeout`
- **AND** the reason code MUST NOT include raw close reasons, tokens, pairing codes, protocol payloads, credentials, keystrokes, screenshots, screen contents, or full secrets
