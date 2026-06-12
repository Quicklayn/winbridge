## ADDED Requirements

### Requirement: Canonical authorization lifecycle reasons
The shared authorization state machine SHALL reject authorization record and lifecycle transition `reason` metadata when the reason is blank, oversized, or not already trimmed. Rejection MUST occur before storing the updated authorization record or using it for action authorization, and MUST NOT create or restore access.

#### Scenario: Authorization lifecycle reason is untrimmed
- **WHEN** a caller denies, pauses, resumes, revokes, or terminates a session authorization with a `reason` that has leading or trailing whitespace
- **THEN** the state machine MUST reject the transition before returning a new authorization record

#### Scenario: Parsed authorization record reason is untrimmed
- **WHEN** an authorization record is parsed with a `reason` that has leading or trailing whitespace
- **THEN** schema validation MUST reject the record before any remote action authorization check can use it

#### Scenario: Authorization reason rejection is fail-closed
- **WHEN** authorization reason validation rejects a lifecycle transition or parsed record
- **THEN** the rejection MUST NOT approve a session, activate host visibility, grant permissions, start capture, send input, reconnect a peer, suppress visibility, or bypass consent workflows
