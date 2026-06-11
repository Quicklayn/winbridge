## ADDED Requirements

### Requirement: Testable forged disconnect rejection
The relay runtime SHALL be verifiable through integration tests for rejecting peer-originated disconnect notices.

#### Scenario: Forged disconnect notice is rejected
- **WHEN** integration tests register a host and viewer, then one peer sends `peer-disconnected` as a normal message
- **THEN** the relay returns a relay error to the sender and does not deliver the forged notice to the other peer

#### Scenario: Forged disconnect rejection audit is secret-safe
- **WHEN** a peer-originated disconnect notice is rejected
- **THEN** the relay audit record identifies the rejected message type and reason without raw tokens, raw pairing codes, protocol payloads, keystrokes, screenshots, screen contents, or full secrets
