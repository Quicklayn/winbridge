## MODIFIED Requirements

### Requirement: Local device identity
The system SHALL represent each connecting peer with schema-validated local device identity metadata that is distinct from production account authentication, and device identity display names SHALL be non-blank after trimming whitespace.

#### Scenario: Peer includes device identity
- **WHEN** a peer joins a session with device identity metadata
- **THEN** the receiver validates device id, display name, platform, and trust level before using the metadata

#### Scenario: Device identity display name is blank
- **WHEN** a peer sends device identity metadata with an empty or whitespace-only display name
- **THEN** the receiver rejects the malformed metadata without treating the peer as authenticated

#### Scenario: Device identity is malformed
- **WHEN** a peer sends malformed device identity metadata
- **THEN** the receiver rejects the malformed metadata without treating the peer as authenticated
