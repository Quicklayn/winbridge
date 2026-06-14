## ADDED Requirements

### Requirement: Identity and pairing snapshot types are read-only
The identity layer SHALL expose returned device identity records, pairing tickets, consumed pairing ticket snapshots, and paired-device records as read-only TypeScript snapshots. Compile-time read-only identity and pairing fields MUST match the runtime immutable snapshot contract and MUST NOT change identity validation, pairing code hashing, ticket consumption, paired-device validation, relay registration, authorization grant validation, permission parsing, host visibility requirements, protocol behavior, audit behavior, or sensitive action authorization behavior.

#### Scenario: Device identity type prevents direct mutation
- **WHEN** TypeScript code receives a device identity record returned by the shared identity factory
- **THEN** the device identity snapshot type marks fixed identity fields and creation metadata as read-only
- **AND** the type-level read-only contract MUST NOT approve a session, activate host visibility, grant permissions, start capture, send input, reconnect peers, or bypass consent workflows

#### Scenario: Pairing ticket type prevents direct mutation
- **WHEN** TypeScript code receives a pairing ticket returned by the shared pairing ticket factory or ticket consumption function
- **THEN** the pairing ticket snapshot type marks fixed identifiers, salted hash metadata, creation and expiration metadata, and remaining-use count as read-only
- **AND** the type-level read-only contract MUST NOT reopen consumed tickets, extend expiration, expose raw pairing codes, authorize relay access, grant permissions, start capture, send input, reconnect peers, or bypass consent workflows

#### Scenario: Paired-device type prevents direct mutation
- **WHEN** TypeScript code receives a paired-device record returned by the shared pairing factory
- **THEN** the paired-device snapshot type marks fixed identifiers and pairing timestamp metadata as read-only
- **AND** the type-level read-only contract MUST NOT rewrite host or viewer device binding, grant permissions, start capture, send input, reconnect peers, suppress host visibility, or bypass consent workflows

#### Scenario: Identity and pairing input construction remains compatible
- **WHEN** TypeScript code constructs identity inputs, pairing ticket inputs, paired-device inputs, relay audit details, or local validation builders before schema validation
- **THEN** construction paths remain mutable-friendly
- **AND** readonly output typing MUST NOT require callers to bypass validation, skip pairing checks, use hidden sessions, suppress audit evidence, or weaken consent-bound authorization
