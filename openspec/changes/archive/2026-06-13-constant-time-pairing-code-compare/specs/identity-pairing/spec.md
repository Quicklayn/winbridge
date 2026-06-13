## ADDED Requirements

### Requirement: Pairing code hash verification is constant-time
The system SHALL verify valid stored pairing-code hashes against valid candidate pairing-code hashes using a fixed-length constant-time comparison. A mismatch MUST fail closed without decrementing ticket uses, registering a peer, granting remote permissions, activating host visibility, starting capture, sending input, reconnecting peers, or exposing raw pairing codes, salted hashes, credentials, protocol payloads, keystrokes, screenshots, screen contents, or full secrets.

#### Scenario: Matching pairing code consumes ticket
- **WHEN** a viewer presents the pairing code that matches a valid unexpired ticket with remaining uses
- **THEN** the pairing layer accepts the match and decrements remaining uses exactly once

#### Scenario: Mismatched pairing code fails closed
- **WHEN** a viewer presents a different validly formatted pairing code for a valid unexpired ticket with remaining uses
- **THEN** the pairing layer rejects the match without decrementing remaining uses or granting remote access
- **AND** the rejection MUST NOT expose raw pairing codes or salted hash material

#### Scenario: Malformed stored hash is rejected before trust
- **WHEN** a pairing ticket record carries a malformed stored pairing-code hash
- **THEN** the pairing layer rejects the ticket before comparing or consuming it
- **AND** the rejection MUST NOT grant permissions, approve authorization, start capture, send input, reconnect peers, suppress host visibility, or bypass consent workflows
