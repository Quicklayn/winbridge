## ADDED Requirements

### Requirement: Local device identity
The system SHALL represent each connecting peer with schema-validated local device identity metadata that is distinct from production account authentication.

#### Scenario: Peer includes device identity
- **WHEN** a peer joins a session with device identity metadata
- **THEN** the receiver validates device id, display name, platform, and trust level before using the metadata

#### Scenario: Device identity is malformed
- **WHEN** a peer sends malformed device identity metadata
- **THEN** the receiver rejects the malformed metadata without treating the peer as authenticated

### Requirement: Expiring pairing ticket
The system SHALL model pairing material as an expiring, replay-resistant ticket that stores a hash of the pairing code instead of the raw code.

#### Scenario: Pairing ticket is created
- **WHEN** the host creates pairing material for a session
- **THEN** the resulting ticket contains session id, host device id, pairing-code hash, creation time, expiration time, and remaining uses

#### Scenario: Pairing ticket is expired
- **WHEN** a peer attempts to use a pairing ticket after its expiration time
- **THEN** the system rejects the ticket before authorizing session access

#### Scenario: Pairing ticket omits raw secret
- **WHEN** a pairing ticket is serialized or audited
- **THEN** the raw pairing code is not present in the ticket or audit details

### Requirement: Pairing ticket consumption
The system SHALL decrement remaining pairing ticket uses and reject tickets after all allowed uses are consumed.

#### Scenario: Ticket has remaining uses
- **WHEN** a valid ticket is consumed
- **THEN** the remaining use count decreases and the ticket remains valid only if uses remain and expiration has not passed

#### Scenario: Ticket has no remaining uses
- **WHEN** a ticket with zero remaining uses is consumed
- **THEN** the system rejects the ticket before authorizing session access

### Requirement: Pairing does not grant remote access
The system SHALL treat successful pairing as a prerequisite identity relationship only, not as approval for screen viewing, input, clipboard, file transfer, or diagnostics.

#### Scenario: Pairing succeeds
- **WHEN** a viewer successfully consumes a valid pairing ticket
- **THEN** the system records the pair relationship without granting remote session permissions

#### Scenario: Viewer requests remote action after pairing
- **WHEN** a paired viewer requests screen, input, clipboard, file, or diagnostic access without a host-approved active session grant
- **THEN** the system denies the action
