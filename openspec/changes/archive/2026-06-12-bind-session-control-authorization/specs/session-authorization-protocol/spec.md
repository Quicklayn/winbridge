## MODIFIED Requirements

### Requirement: Pause and resume state updates
The protocol SHALL represent host pause and resume as explicit session control messages bound to the affected authorization id and paired with authorization state updates.

#### Scenario: Host pauses authorization
- **WHEN** the host pauses a visible active authorization
- **THEN** it sends `session-control` with action `pause` and the affected `authorizationId`
- **AND** it sends `session-authorization-state` with the same authorization id, status `paused`, `visibleToHost` set to true, and the current permission list

#### Scenario: Host resumes authorization
- **WHEN** the host resumes a paused visible unexpired authorization
- **THEN** it sends `session-control` with action `resume` and the affected `authorizationId`
- **AND** it sends `session-authorization-state` with the same authorization id, status `active`, `visibleToHost` set to true, and the current permission list

#### Scenario: Pause and resume are not remote action grants
- **WHEN** pause or resume protocol messages are sent
- **THEN** they do not authorize screen capture, input, clipboard, file transfer, diagnostics, or any other sensitive action unless the resulting authorization state is active, visible, unexpired, and scoped to the requested permission

### Requirement: Session control action payload invariants
The protocol SHALL reject malformed `session-control` messages whose action-specific payload or authorization binding is ambiguous or fail-open.

#### Scenario: Control includes authorization id
- **WHEN** a `session-control` message includes an authorization id and otherwise valid action-specific payload
- **THEN** the protocol schema accepts the message as control intent for that authorization

#### Scenario: Control omits authorization id
- **WHEN** a `session-control` message omits `authorizationId`
- **THEN** the protocol schema rejects the message before peers can process ambiguous lifecycle intent

#### Scenario: Revoke-permission control includes permission
- **WHEN** a `session-control` message has action `revoke-permission`, includes `authorizationId`, and includes a permission
- **THEN** the protocol schema accepts the message as permission-revocation intent for that authorization

#### Scenario: Revoke-permission control lacks permission
- **WHEN** a `session-control` message has action `revoke-permission` and omits permission
- **THEN** the protocol schema rejects the message before peers can process ambiguous revocation intent

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
