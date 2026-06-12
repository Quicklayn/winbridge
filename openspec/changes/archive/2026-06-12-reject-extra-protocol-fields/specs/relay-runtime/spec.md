## ADDED Requirements

### Requirement: Relay rejects unknown fixed protocol fields
The relay runtime SHALL reject inbound protocol messages with unknown fixed-shape fields before peer registration, room mutation, or forwarding.

#### Scenario: Join message has unknown fixed field
- **WHEN** an unregistered peer sends a `join-session` message with an unknown top-level field
- **THEN** the relay rejects the message before registering the peer, creating pairing material, consuming pairing material, or forwarding any peer message

#### Scenario: Registered message has unknown fixed field
- **WHEN** a registered peer sends a protocol message with an unknown top-level field outside allowed metadata containers
- **THEN** the relay returns a bounded relay error to the sender and does not deliver the message to the remaining peer

#### Scenario: Unknown fixed field rejection audit is secret-safe
- **WHEN** the relay audits a protocol rejection caused by an unknown fixed field
- **THEN** the audit record identifies the rejection without raw unknown field values, raw protocol payloads, tokens, pairing codes, credentials, keystrokes, screenshots, screen contents, or full secrets
