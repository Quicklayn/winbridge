# session-authorization Delta

## MODIFIED Requirements

### Requirement: Scoped action authorization
The system SHALL authorize sensitive remote actions only when the session is active, visible, unexpired, not revoked, and includes the requested permission. Pending, approved, and denied authorizations MUST NOT report host visible active-session state.

#### Scenario: Requested permission is not granted
- **WHEN** a viewer requests a sensitive action that is not in the active grant
- **THEN** the system denies the action

#### Scenario: Active grant contains permission
- **WHEN** a viewer requests a sensitive action included in an active visible unexpired grant
- **THEN** the system authorizes the action

#### Scenario: Pending authorization reports visible state
- **WHEN** a pending authorization record reports `visibleToHost` as true
- **THEN** the schema rejects the record before any remote action check can use it

#### Scenario: Approved authorization reports visible state
- **WHEN** an approved authorization record reports `visibleToHost` as true
- **THEN** the schema rejects the record because host visibility only applies after activation

#### Scenario: Denied authorization reports visible state
- **WHEN** a denied authorization record reports `visibleToHost` as true
- **THEN** the schema rejects the record because denied requests never become active visible sessions

### Requirement: Schema-level authorization record invariants
The system SHALL reject malformed session authorization records during schema parsing before any remote action authorization check can use them.

#### Scenario: Duplicate permissions are parsed
- **WHEN** a session authorization record includes duplicate permissions
- **THEN** the schema rejects the record so grant scope and audit metadata remain unambiguous

#### Scenario: Grant-bearing state has no permissions
- **WHEN** a pending, approved, active, or paused authorization record has no permissions
- **THEN** the schema rejects the record before it can represent a usable remote assistance grant

#### Scenario: Terminal state carries permissions
- **WHEN** a denied, revoked, terminated, or expired authorization record has permissions
- **THEN** the schema rejects the record so fail-closed states cannot carry usable grant scope

#### Scenario: Terminal state has no permissions
- **WHEN** a denied, revoked, terminated, or expired authorization record has an empty permission list
- **THEN** the schema accepts the record as a terminal fail-closed state

#### Scenario: Active authorization is not visible
- **WHEN** an active authorization record is not visible to the host
- **THEN** the schema rejects the record before any remote action check can authorize it

#### Scenario: Paused authorization is not visible
- **WHEN** a paused authorization record is not visible to the host
- **THEN** the schema rejects the record so host pause cannot be represented as hidden remote access

#### Scenario: Pre-active authorization is visible
- **WHEN** a pending or approved authorization record reports host visible state
- **THEN** the schema rejects the record so pre-active consent cannot be confused with an active visible session

#### Scenario: Denied authorization is visible
- **WHEN** a denied authorization record reports host visible state
- **THEN** the schema rejects the record so denied consent cannot be confused with an active visible session

#### Scenario: Lifecycle state lacks required timestamp
- **WHEN** a denied, approved, active, paused, revoked, terminated, or expired authorization record lacks its corresponding lifecycle timestamp
- **THEN** the schema rejects the record so authorization history remains auditable

#### Scenario: Active authorization resumed from pause lacks resume timestamp
- **WHEN** an active authorization record includes a prior pause timestamp but lacks a resume timestamp
- **THEN** the schema rejects the record so host resume remains explicit and auditable

#### Scenario: Authorization has resume timestamp without prior pause
- **WHEN** an authorization record includes a resume timestamp without a prior pause timestamp
- **THEN** the schema rejects the record as an invalid lifecycle history
