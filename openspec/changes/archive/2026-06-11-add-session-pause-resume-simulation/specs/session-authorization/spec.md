## ADDED Requirements

### Requirement: Host pause and resume lifecycle
The system SHALL model host pause as a non-terminal authorization state that immediately denies sensitive remote action checks until the host explicitly resumes the visible unexpired authorization.

#### Scenario: Host pauses active authorization
- **WHEN** the host pauses an active visible unexpired authorization
- **THEN** the system marks the authorization `paused` and remote action checks fail closed

#### Scenario: Paused authorization retains grant scope
- **WHEN** an authorization is paused
- **THEN** the authorization retains its granted permission list without authorizing those permissions while paused

#### Scenario: Host resumes paused authorization
- **WHEN** the host resumes a paused visible unexpired authorization
- **THEN** the system marks the authorization `active` and action checks for granted permissions can succeed again

#### Scenario: Resume rejects non-paused authorization
- **WHEN** a resume is attempted for a pending, denied, active, revoked, terminated, or expired authorization
- **THEN** the system rejects the transition and does not grant remote action access

#### Scenario: Resume rejects invisible or expired authorization
- **WHEN** a resume is attempted for an invisible or expired authorization
- **THEN** the system rejects the transition and remote action checks fail closed
