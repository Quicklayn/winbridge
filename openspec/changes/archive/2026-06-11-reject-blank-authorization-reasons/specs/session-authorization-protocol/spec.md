## ADDED Requirements

### Requirement: Non-blank authorization protocol reasons
The protocol SHALL reject authorization-related messages that include blank or whitespace-only reason text.

#### Scenario: Authorization request reason is blank
- **WHEN** a `session-authorization-request` includes a whitespace-only reason
- **THEN** the protocol schema rejects the message before it can be forwarded or processed

#### Scenario: Authorization denial reason is blank
- **WHEN** a denied `session-authorization-decision` includes a whitespace-only reason
- **THEN** the protocol schema rejects the message so denial remains explicit and auditable

#### Scenario: Authorization state reason is blank
- **WHEN** a `session-authorization-state` includes a whitespace-only reason
- **THEN** the protocol schema rejects the message before peers can record meaningless lifecycle metadata

#### Scenario: Permission revoked reason is blank
- **WHEN** a `permission-revoked` message includes a whitespace-only reason
- **THEN** the protocol schema rejects the message so revocation remains explicit and auditable

#### Scenario: Optional authorization reason is omitted
- **WHEN** an authorization-related protocol message omits an optional reason
- **THEN** the protocol schema accepts the message when all other required fields are valid
