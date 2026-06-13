## ADDED Requirements

### Requirement: Viewer permission revocation floor
The viewer runtime SHALL preserve permissions already removed by same-authorization host revocation lifecycle messages and MUST NOT restore those permissions from later same-authorization `session-authorization-decision` or `session-authorization-state` messages. This local revocation floor MUST be scoped to the current authorization id and observed host authority, and MUST NOT authorize screen capture, input, clipboard access, file transfer, diagnostics, reconnect, hidden sessions, or consent bypass.

#### Scenario: Stale active state cannot restore a partially revoked screen permission
- **WHEN** a viewer runtime has active visible authorization with `screen:view` and another granted permission
- **AND** it receives a same-authority revoke-permission `session-control` for `screen:view`
- **AND** it later receives a same-authority active `session-authorization-state` for the same authorization id whose permission list still includes `screen:view`
- **THEN** the viewer runtime MUST keep `screen:view` removed from its authorization snapshot
- **AND** viewer-originated `signal` sends MUST remain rejected before socket write and local `sent` event emission

#### Scenario: Permission-revoked confirmation also preserves the revocation floor
- **WHEN** a viewer runtime has active visible authorization with `screen:view` and another granted permission
- **AND** it receives a same-authority `permission-revoked` confirmation for `screen:view`
- **AND** it later receives a same-authority active `session-authorization-state` for the same authorization id whose permission list still includes `screen:view`
- **THEN** the viewer runtime MUST keep `screen:view` removed from its authorization snapshot
- **AND** viewer-originated `signal` sends MUST remain rejected before socket write and local `sent` event emission

#### Scenario: Repeated same-authorization decision cannot reset the revocation floor
- **WHEN** a viewer runtime has active visible authorization with `screen:view` and another granted permission
- **AND** it receives a same-authority revocation lifecycle message for `screen:view`
- **AND** it later receives a same-authority approved `session-authorization-decision` for the same authorization id whose granted permission list still includes `screen:view`
- **THEN** the viewer runtime MUST keep `screen:view` removed from its authorization snapshot
- **AND** the repeated same-authorization decision MUST NOT authorize viewer-originated `signal` sends

#### Scenario: New authorization id resets the revocation floor
- **WHEN** a viewer runtime has removed `screen:view` for one authorization id
- **AND** it later receives an approved decision and active visible state for a different authorization id from the observed host authority
- **THEN** permissions for the new authorization id are evaluated from that new decision and state
- **AND** the previous authorization id's revocation floor MUST NOT restore, remove, or otherwise modify permissions for the new authorization

#### Scenario: Revocation floor diagnostics remain secret-safe
- **WHEN** a stale same-authorization state includes a permission already removed by host revocation
- **THEN** local events and logs MUST NOT expose raw protocol payloads, tokens, pairing codes, private reasons, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, or input contents
