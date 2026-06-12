## ADDED Requirements

### Requirement: Authorization records and grants reject unknown fixed fields
The system SHALL reject unknown fields on session authorization records and consent-bound session grant records before any remote action authorization check can use them.

#### Scenario: Session authorization has unknown field
- **WHEN** a session authorization record includes an unknown top-level field
- **THEN** schema validation MUST reject the record before any remote action authorization check can use it

#### Scenario: Consent-bound grant has unknown field
- **WHEN** a consent-bound session grant record includes an unknown top-level field
- **THEN** schema validation MUST reject the grant before any sensitive action can be authorized

#### Scenario: Rejection does not weaken lifecycle checks
- **WHEN** an authorization record or grant has no unknown fields
- **THEN** all existing consent, host visibility, expiration, permission scope, revocation, pause, resume, and termination checks MUST continue to apply
