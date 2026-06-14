## ADDED Requirements

### Requirement: Authorization snapshot types are read-only
The shared session authorization state machine SHALL expose returned authorization records and consent-bound session grants as read-only TypeScript snapshots. Compile-time read-only authorization and grant fields MUST match the runtime immutable snapshot contract and MUST NOT change authorization lifecycle behavior, permission parsing, grant validation, expiration behavior, host visibility requirements, protocol behavior, audit behavior, or sensitive action authorization behavior.

#### Scenario: Session authorization type prevents direct mutation
- **WHEN** TypeScript code receives a session authorization returned by a lifecycle constructor, transition, expiration check, or successful action authorization check
- **THEN** the authorization snapshot type marks lifecycle metadata, host visibility metadata, and permissions as read-only
- **AND** the type-level read-only contract MUST NOT grant permissions, change lifecycle state, hide host visibility, emit protocol messages, start capture, send input, reconnect peers, or bypass consent workflows

#### Scenario: Consent-bound grant type prevents direct mutation
- **WHEN** TypeScript code receives a consent-bound session grant returned by the shared grant validator
- **THEN** the grant snapshot type marks fixed identifiers, permission list, consent flags, expiration metadata, and audit identifier as read-only
- **AND** the type-level read-only contract MUST NOT widen permission scope, disable host approval, disable visible-session requirements, authorize capture, authorize input, reconnect peers, or bypass consent workflows

#### Scenario: Authorization input construction remains compatible
- **WHEN** TypeScript code constructs authorization inputs, grant inputs, or local permission lists before validation
- **THEN** construction paths remain mutable-friendly
- **AND** readonly output typing MUST NOT require callers to bypass validation, skip host visibility checks, use hidden sessions, suppress audit evidence, or weaken consent-bound flags
