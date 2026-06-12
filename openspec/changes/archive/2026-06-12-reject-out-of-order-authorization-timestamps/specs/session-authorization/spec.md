## MODIFIED Requirements

### Requirement: Schema-level authorization record invariants
The system SHALL reject malformed session authorization records during schema parsing before any remote action authorization check can use them, including pre-active or denied records that carry lifecycle timestamps from impossible later states and records whose authorization timestamps are out of order.

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

#### Scenario: Pending authorization carries later lifecycle timestamp
- **WHEN** a pending authorization record carries denied, approved, activated, paused, resumed, revoked, terminated, or expired timestamp metadata
- **THEN** the schema rejects the record so pending consent cannot be confused with a later lifecycle state

#### Scenario: Approved authorization carries later lifecycle timestamp
- **WHEN** an approved authorization record carries denied, activated, paused, resumed, revoked, terminated, or expired timestamp metadata
- **THEN** the schema rejects the record so approval cannot be confused with active or terminal lifecycle history

#### Scenario: Denied authorization carries conflicting lifecycle timestamp
- **WHEN** a denied authorization record carries approved, activated, paused, resumed, revoked, terminated, or expired timestamp metadata
- **THEN** the schema rejects the record so denied consent cannot be confused with an approved, active, or terminal session history

#### Scenario: Authorization record updated before creation
- **WHEN** an authorization record has `updatedAt` earlier than `createdAt`
- **THEN** the schema rejects the record so audit chronology cannot run backward

#### Scenario: Authorization expires before or at creation
- **WHEN** an authorization record has `expiresAt` earlier than or equal to `createdAt`
- **THEN** the schema rejects the record so zero or negative authorization windows cannot be represented

#### Scenario: Lifecycle timestamp is outside record window
- **WHEN** an authorization record carries a lifecycle timestamp earlier than `createdAt` or later than `updatedAt`
- **THEN** the schema rejects the record before any remote action authorization check can use it

#### Scenario: Active authorization resumed from pause lacks resume timestamp
- **WHEN** an active authorization record includes a prior pause timestamp but lacks a resume timestamp
- **THEN** the schema rejects the record so host resume remains explicit and auditable

#### Scenario: Authorization has resume timestamp without prior pause
- **WHEN** an authorization record includes a resume timestamp without a prior pause timestamp
- **THEN** the schema rejects the record as an invalid lifecycle history
