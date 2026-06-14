## ADDED Requirements

### Requirement: Immutable identity and pairing records
The identity layer SHALL return immutable snapshots from shared device identity and pairing record factories after successful schema validation. Immutability MUST include device identity records, created pairing tickets, consumed pairing ticket snapshots, and paired-device records, and MUST prevent callers from changing trusted identity or pairing state in place after validation.

#### Scenario: Device identity snapshot cannot be changed
- **WHEN** a device identity record is accepted by the shared identity factory
- **THEN** the returned identity record is immutable
- **AND** callers cannot change device id, display name, platform, trust level, or creation timestamp in place

#### Scenario: Pairing ticket snapshot cannot be widened or replayed by mutation
- **WHEN** a pairing ticket is created or consumed by the shared pairing functions
- **THEN** the returned ticket snapshot is immutable
- **AND** callers cannot change session id, host device id, salted hash metadata, expiration, or remaining use count in place

#### Scenario: Pairing consumption returns stable snapshots
- **WHEN** a valid pairing ticket is consumed
- **THEN** the consumed ticket is a new immutable snapshot with the decremented remaining use count
- **AND** the original ticket snapshot remains unchanged

#### Scenario: Paired-device binding cannot be changed
- **WHEN** a paired-device record is accepted by the shared pairing factory
- **THEN** the returned record is immutable
- **AND** callers cannot change pairing id, session id, host device id, viewer device id, or paired timestamp in place

#### Scenario: Immutable pairing records remain non-authorizing
- **WHEN** immutable identity or pairing records are serialized or used by relay pairing code
- **THEN** their JSON-compatible shape remains unchanged
- **AND** immutability MUST NOT grant screen, input, clipboard, file, diagnostic, reconnect, hidden-session, or consent-bypass permissions by itself
