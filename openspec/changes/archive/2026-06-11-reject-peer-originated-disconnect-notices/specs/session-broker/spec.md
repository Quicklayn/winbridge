## ADDED Requirements

### Requirement: Relay-originated disconnect notice authority
The relay SHALL treat `peer-disconnected` as a relay-originated lifecycle notice and MUST reject peer-originated `peer-disconnected` messages before forwarding.

#### Scenario: Peer attempts forged disconnect notice
- **WHEN** a registered peer sends a `peer-disconnected` message as an ordinary peer message
- **THEN** the relay rejects the message before forwarding it to the remaining peer

#### Scenario: Relay sends broker-observed disconnect notice
- **WHEN** the relay observes a registered peer disconnect through the transport close path
- **THEN** the relay may send a `peer-disconnected` notice to remaining peers using safe bounded disconnect metadata

#### Scenario: Forged notice does not change remote lifecycle state
- **WHEN** the relay rejects a peer-originated `peer-disconnected` message
- **THEN** the remaining peer MUST NOT receive that forged notice and MUST NOT change session lifecycle state because of it
