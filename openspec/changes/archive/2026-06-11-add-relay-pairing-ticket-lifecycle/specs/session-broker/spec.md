## ADDED Requirements

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
