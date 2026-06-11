## ADDED Requirements

### Requirement: Authorization request message
The protocol SHALL provide a session authorization request message that carries viewer identity, requested permissions, and request reason without granting access.

#### Scenario: Viewer requests scoped authorization
- **WHEN** a viewer sends a session authorization request
- **THEN** the message includes viewer peer id, requested permissions, and optional reason

### Requirement: Authorization decision message
The protocol SHALL provide a host decision message that explicitly approves or denies requested permissions and includes expiration for approvals.

#### Scenario: Host approves request
- **WHEN** the host approves a session authorization request
- **THEN** the decision message includes approved status, granted permissions, expiration, and host peer id

#### Scenario: Host denies request
- **WHEN** the host denies a session authorization request
- **THEN** the decision message includes denied status, empty granted permissions, host peer id, and reason

### Requirement: Authorization state update message
The protocol SHALL provide a state update message that carries the current authorization status, visible host state, granted permissions, and expiration.

#### Scenario: Session becomes active
- **WHEN** a session authorization becomes active
- **THEN** the update message includes active status and `visibleToHost` set to true

### Requirement: Permission revoke message
The protocol SHALL provide a permission revoke message that names the revoked permission, actor, and reason.

#### Scenario: Host revokes keyboard input
- **WHEN** the host revokes keyboard input permission
- **THEN** the revoke message identifies `input:keyboard`, actor peer id, and reason
