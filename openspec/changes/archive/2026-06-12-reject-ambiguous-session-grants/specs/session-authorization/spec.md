## ADDED Requirements

### Requirement: Consent-bound session grant invariants
The system SHALL reject consent-bound session grant records whose permission scope is empty or contains duplicate permissions before any remote action authorization check can use them.

#### Scenario: Session grant has empty permissions
- **WHEN** a consent-bound session grant record contains no permissions
- **THEN** schema validation rejects the record before it can represent remote action authorization

#### Scenario: Session grant has duplicate permissions
- **WHEN** a consent-bound session grant record contains duplicate permissions
- **THEN** schema validation rejects the record so grant scope and audit metadata remain unambiguous

#### Scenario: Session grant has unique permissions
- **WHEN** a consent-bound session grant record contains one or more unique permissions, explicit host approval, visible-session requirement, and a future expiration
- **THEN** the grant can pass schema validation and still must satisfy the requested permission check before any sensitive action is authorized
