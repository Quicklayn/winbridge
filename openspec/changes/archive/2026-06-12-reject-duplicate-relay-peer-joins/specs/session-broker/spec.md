## ADDED Requirements

### Requirement: Live peer identity exclusivity
The relay SHALL reject a join attempt before registration when the target session already has a live registered peer with the same `peerId`, and SHALL NOT replace the existing peer connection or treat the duplicate join as an authorized reconnect.

#### Scenario: Duplicate live peer id is rejected
- **WHEN** a peer is already registered in a relay session and another socket attempts to join the same session with the same `peerId`
- **THEN** the relay rejects the duplicate join before registration
- **AND** the original peer remains the registered peer for that `peerId`

#### Scenario: Duplicate live peer rejection is secret-safe
- **WHEN** the relay rejects a duplicate live peer join
- **THEN** the peer-facing relay error and audit reason MUST use bounded metadata-only text and MUST NOT include raw pairing codes, tokens, credentials, protocol payloads, private reasons, keystrokes, screenshots, screen contents, or full secrets

#### Scenario: Peer id can rejoin after disconnect cleanup
- **WHEN** a registered peer disconnects and the relay removes it from room membership
- **THEN** a later join using the same `peerId` MAY be accepted through the normal pairing and room constraints
