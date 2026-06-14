## ADDED Requirements

### Requirement: Immutable authorization snapshots
The shared session authorization state machine SHALL return immutable authorization snapshots from every exported lifecycle constructor, transition, expiration check, and successful action authorization check. Immutability MUST include the permission list and MUST prevent callers from widening grant scope, changing lifecycle status, or changing host visibility in place after validation.

#### Scenario: Pending snapshot cannot be widened
- **WHEN** a pending session authorization is created
- **THEN** the returned record and its permission list are immutable
- **AND** callers cannot add a permission to that returned record in place

#### Scenario: Active snapshot cannot hide host visibility
- **WHEN** a host-approved authorization is activated with visible host state
- **THEN** callers cannot change the returned record's status or `visibleToHost` flag in place

#### Scenario: Expiration check preserves immutable terminal state
- **WHEN** an active authorization expires or an already terminal authorization is checked after expiration
- **THEN** the returned authorization snapshot remains immutable and fail-closed
- **AND** callers cannot restore permissions in place after the expiration check
