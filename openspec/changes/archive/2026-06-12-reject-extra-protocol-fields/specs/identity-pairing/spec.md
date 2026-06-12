## ADDED Requirements

### Requirement: Identity and pairing records reject unknown fixed fields
The system SHALL reject unknown fields on device identity, pairing ticket, and paired-device records before treating those records as trusted identity or pairing metadata.

#### Scenario: Device identity has unknown fixed field
- **WHEN** a peer sends device identity metadata with an unknown field
- **THEN** the receiver MUST reject the malformed metadata without treating the peer as authenticated

#### Scenario: Pairing ticket has unknown fixed field
- **WHEN** a pairing ticket record includes an unknown field
- **THEN** the pairing layer MUST reject the ticket before consuming it or authorizing session access

#### Scenario: Paired-device record has unknown fixed field
- **WHEN** a paired-device record includes an unknown field
- **THEN** the system MUST reject the record before using it as a pairing relationship
