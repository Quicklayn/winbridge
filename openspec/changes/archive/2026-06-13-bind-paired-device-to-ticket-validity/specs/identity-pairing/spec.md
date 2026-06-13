## MODIFIED Requirements

### Requirement: Pairing does not grant remote access
The system SHALL treat successful pairing as a prerequisite identity relationship only, not as approval for screen viewing, input, clipboard, file transfer, diagnostics, reconnect, hidden sessions, or consent bypass. A paired-device record created from a pairing ticket MUST be recorded only at or after the ticket creation time and before the ticket expiration time.

#### Scenario: Pairing succeeds within ticket validity
- **WHEN** a viewer successfully consumes a valid pairing ticket at or after the ticket creation time and before the ticket expiration time
- **THEN** the system records the pair relationship without granting remote session permissions

#### Scenario: Pairing before ticket creation is rejected
- **WHEN** code attempts to create a paired-device record with `pairedAt` before the source ticket `createdAt`
- **THEN** the pairing layer rejects the record before using it as trusted pairing metadata
- **AND** the rejection MUST NOT grant permissions, approve authorization, start capture, send input, reconnect peers, suppress host visibility, or bypass consent workflows

#### Scenario: Pairing at ticket expiration is rejected
- **WHEN** code attempts to create a paired-device record with `pairedAt` at or after the source ticket `expiresAt`
- **THEN** the pairing layer rejects the record before using it as trusted pairing metadata
- **AND** the rejection MUST NOT expose raw pairing codes, credentials, protocol payloads, keystrokes, screenshots, screen contents, or full secrets

#### Scenario: Viewer requests remote action after pairing
- **WHEN** a paired viewer requests screen, input, clipboard, file, or diagnostic access without a host-approved active session grant
- **THEN** the system denies the action
