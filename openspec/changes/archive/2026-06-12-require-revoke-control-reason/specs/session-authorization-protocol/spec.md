## MODIFIED Requirements

### Requirement: Session control action payload invariants
The protocol SHALL reject malformed `session-control` messages whose action-specific payload or authorization binding is ambiguous, unauditable, or fail-open.

#### Scenario: Control includes authorization id
- **WHEN** a `session-control` message includes an authorization id and otherwise valid action-specific payload
- **THEN** the protocol schema accepts the message as control intent for that authorization

#### Scenario: Control omits authorization id
- **WHEN** a `session-control` message omits `authorizationId`
- **THEN** the protocol schema rejects the message before peers can process ambiguous lifecycle intent

#### Scenario: Revoke-permission control includes permission and reason
- **WHEN** a `session-control` message has action `revoke-permission`, includes `authorizationId`, includes a permission, and includes a non-blank reason
- **THEN** the protocol schema accepts the message as permission-revocation intent for that authorization

#### Scenario: Revoke-permission control lacks permission
- **WHEN** a `session-control` message has action `revoke-permission` and omits permission
- **THEN** the protocol schema rejects the message before peers can process ambiguous revocation intent

#### Scenario: Revoke-permission control lacks reason
- **WHEN** a `session-control` message has action `revoke-permission` and omits reason
- **THEN** the protocol schema rejects the message before peers can process unauditable revocation intent

#### Scenario: Pause control includes permission
- **WHEN** a `session-control` message has action `pause` and includes permission
- **THEN** the protocol schema rejects the message so pause cannot be confused with permission revocation or grant scope

#### Scenario: Resume control includes permission
- **WHEN** a `session-control` message has action `resume` and includes permission
- **THEN** the protocol schema rejects the message so resume cannot be confused with a permission grant

#### Scenario: Terminate control includes permission
- **WHEN** a `session-control` message has action `terminate` and includes permission
- **THEN** the protocol schema rejects the message because termination applies to the session rather than a single permission

#### Scenario: Control reason is blank
- **WHEN** a `session-control` message includes a whitespace-only reason
- **THEN** the protocol schema rejects the message so optional reasons remain explicit and auditable
