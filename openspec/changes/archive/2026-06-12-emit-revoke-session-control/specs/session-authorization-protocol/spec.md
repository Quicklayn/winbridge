## MODIFIED Requirements

### Requirement: Permission revoke message
The protocol SHALL provide a permission revoke message that names the revoked permission, actor, and reason. Permission revocation workflow control SHALL be represented by an authorization-bound `session-control` with action `revoke-permission` and the same permission before peers treat the resulting state as a remote-action grant change.

#### Scenario: Host revokes keyboard input
- **WHEN** the host revokes keyboard input permission
- **THEN** the revoke control identifies the affected authorization id, `input:keyboard`, actor peer id, and reason
- **AND** the revoke message identifies `input:keyboard`, actor peer id, and reason

#### Scenario: Revoke control is not a grant
- **WHEN** a `session-control` message has action `revoke-permission`
- **THEN** it does not authorize screen capture, input, clipboard, file transfer, diagnostics, or any other sensitive action unless the resulting authorization state is active, visible, unexpired, and scoped to the requested permission
