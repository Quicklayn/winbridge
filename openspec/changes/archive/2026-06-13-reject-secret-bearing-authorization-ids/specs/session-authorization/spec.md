## ADDED Requirements

### Requirement: Authorization identifiers are non-secret metadata
The system SHALL reject session authorization records whose `authorizationId` contains secret-bearing metadata such as token, credential, cookie, API key, access key, private key, SSH key, authorization header, or auth header markers. Rejection MUST occur before storing the authorization record, processing a lifecycle transition, or using the record for remote action authorization.

#### Scenario: Pending authorization id contains secret marker
- **WHEN** a pending authorization record is created with a secret-bearing `authorizationId`
- **THEN** the system rejects the record before creating authorization state
- **AND** the rejection MUST NOT approve a session, activate host visibility, grant permissions, start capture, send input, reconnect a peer, or bypass consent workflows

#### Scenario: Parsed authorization record contains secret marker
- **WHEN** a parsed authorization record contains a secret-bearing `authorizationId`
- **THEN** schema validation rejects the record before any remote action check can use it

#### Scenario: Safe authorization id remains valid
- **WHEN** an authorization record uses a schema-valid non-secret `authorizationId`
- **THEN** the system accepts that identifier if all other consent, visibility, expiration, and permission-scope requirements pass
