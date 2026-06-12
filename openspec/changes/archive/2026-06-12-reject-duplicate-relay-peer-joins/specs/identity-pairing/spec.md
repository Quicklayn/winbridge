## ADDED Requirements

### Requirement: Duplicate relay joins do not mutate pairing state
The development relay SHALL reject duplicate live peer-id joins before host pairing-ticket creation, viewer pairing-ticket consumption, paired-device recording, or peer send-path replacement.

#### Scenario: Duplicate host join does not refresh pairing ticket
- **WHEN** a host is already registered in a relay session and another socket attempts to join with the same host `peerId`
- **THEN** the relay rejects the duplicate host join before creating or replacing host pairing material
- **AND** the original host remains registered

#### Scenario: Duplicate viewer join does not consume pairing ticket
- **WHEN** a viewer is already registered in a relay session and another socket attempts to join with the same viewer `peerId`
- **THEN** the relay rejects the duplicate viewer join before consuming pairing material or recording a new paired device
- **AND** the original viewer remains registered
