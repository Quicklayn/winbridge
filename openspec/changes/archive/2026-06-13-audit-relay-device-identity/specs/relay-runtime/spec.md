## ADDED Requirements

### Requirement: Accepted join device identity audit metadata
The relay runtime SHALL include bounded device identity metadata in accepted `relay.peer.join.accepted` audit detail when a peer joins with schema-valid `deviceIdentity`. The accepted join audit metadata MUST NOT include raw display names, raw pairing codes, tokens, credentials, protocol payloads, keystrokes, screenshots, screen contents, or full secrets. Device identity audit metadata MUST remain non-authorizing and MUST NOT grant screen, input, clipboard, file, diagnostics, reconnect, hidden-session, or consent-bypass permissions.

#### Scenario: Accepted host join includes bounded device identity
- **WHEN** a host joins the relay with schema-valid device identity metadata
- **THEN** the accepted join audit detail includes `deviceIdentity.deviceId`, `deviceIdentity.platform`, `deviceIdentity.trustLevel`, and `deviceIdentity.createdAt`
- **AND** the accepted join audit detail MUST NOT include the host display name or raw pairing code

#### Scenario: Accepted viewer join includes bounded device identity
- **WHEN** a viewer joins the relay with schema-valid device identity metadata after consuming a host pairing ticket
- **THEN** the accepted join audit detail includes `deviceIdentity.deviceId`, `deviceIdentity.platform`, `deviceIdentity.trustLevel`, and `deviceIdentity.createdAt`
- **AND** the accepted join audit detail MUST NOT include the viewer display name or raw pairing code

#### Scenario: Device identity audit metadata does not authorize remote actions
- **WHEN** a peer join audit record includes bounded device identity metadata
- **THEN** the relay treats the metadata as audit attribution only
- **AND** the metadata MUST NOT approve a session, activate host visibility, grant permissions, start capture, send input, reconnect a peer, or bypass consent workflows
