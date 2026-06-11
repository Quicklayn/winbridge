## ADDED Requirements

### Requirement: Testable peer disconnect notification
The relay runtime SHALL expose peer disconnect notification behavior through integration tests and secret-safe audit metadata.

#### Scenario: Remaining viewer receives host disconnect notification
- **WHEN** integration tests register a host and viewer, then close the host socket
- **THEN** the viewer receives a schema-valid `peer-disconnected` protocol message for the host

#### Scenario: Remaining host receives viewer disconnect notification
- **WHEN** integration tests register a host and viewer, then close the viewer socket
- **THEN** the host receives a schema-valid `peer-disconnected` protocol message for the viewer

#### Scenario: Disconnect audit includes notification metadata
- **WHEN** a registered peer disconnects
- **THEN** the relay audit record includes secret-safe metadata for the peer role, bounded reason code, notification target count, notification sent count, and notification failure count

#### Scenario: Disconnect audit omits sensitive material
- **WHEN** a registered peer disconnects after joining with pairing credentials
- **THEN** the relay disconnect audit record MUST NOT include raw pairing codes, shared tokens, raw close reasons, protocol payloads, keystrokes, screenshots, or screen contents
