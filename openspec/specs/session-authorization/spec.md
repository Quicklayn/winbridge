# session-authorization Specification

## Purpose
TBD - created by archiving change add-session-authorization-state-machine. Update Purpose after archive.
## Requirements
### Requirement: Consent-bound lifecycle
The system SHALL model remote assistance authorization as an explicit lifecycle that begins pending and cannot become active without host approval.

#### Scenario: Session request is created
- **WHEN** a viewer requests remote assistance
- **THEN** the system creates a pending authorization state without granting remote permissions

#### Scenario: Host denies request
- **WHEN** the host denies a pending request
- **THEN** the system marks the authorization denied and remote action checks fail closed

### Requirement: Visible activation gate
The system SHALL activate a remote assistance session only when host consent is approved and the host-visible session indicator is active.

#### Scenario: Approved session lacks visible host indicator
- **WHEN** a host-approved session is activated without visible host session state
- **THEN** the system rejects activation

#### Scenario: Approved session is visible
- **WHEN** a host-approved session is activated with visible host session state
- **THEN** the system marks the authorization active until expiration, revoke, or termination

### Requirement: Scoped action authorization
The system SHALL authorize sensitive remote actions only when the session is active, visible, unexpired, not revoked, and includes the requested permission.

#### Scenario: Requested permission is not granted
- **WHEN** a viewer requests a sensitive action that is not in the active grant
- **THEN** the system denies the action

#### Scenario: Active grant contains permission
- **WHEN** a viewer requests a sensitive action included in an active visible unexpired grant
- **THEN** the system authorizes the action

### Requirement: Revoke and terminate fail closed
The system SHALL immediately deny remote action checks after host revocation, permission revocation, expiration, or session termination.

#### Scenario: Permission is revoked
- **WHEN** the host revokes a granted permission
- **THEN** action checks for that permission fail immediately

#### Scenario: Session is terminated
- **WHEN** the host terminates the session
- **THEN** all remote action checks fail immediately

