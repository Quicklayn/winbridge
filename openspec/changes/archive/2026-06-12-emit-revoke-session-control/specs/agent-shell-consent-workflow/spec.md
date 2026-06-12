## MODIFIED Requirements

### Requirement: Host permission revoke simulation
The host shell SHALL send permission revocation messages only when revocation is explicitly configured, the host has already emitted an active visible session state for the same authorization, and the authorization is still unexpired when the revoke delay fires. Host-generated revocation simulation MUST emit a bound `session-control` with action `revoke-permission` before the `permission-revoked` notification and follow-up authorization state.

#### Scenario: Host revokes granted permission after visible activation
- **WHEN** the host shell is explicitly configured to approve, visible session state is true, and a revoke delay and permission are configured
- **THEN** it sends an approved decision, sends active visible state, sends `session-control` with action `revoke-permission`, the active authorization id, and the configured permission after the delay, sends `permission-revoked` for the configured permission, and sends an updated authorization state without that permission

#### Scenario: Host revokes final granted permission
- **WHEN** the configured revoked permission is the only granted permission
- **THEN** the updated authorization state has status `revoked` and an empty permission list

#### Scenario: Revoke configured without visible activation
- **WHEN** the host shell is configured to approve but visible session state is false
- **THEN** it does not send revoke `session-control`, `permission-revoked`, active, or revoked state updates

#### Scenario: Expiration suppresses delayed revoke
- **WHEN** a revoke delay is configured but the authorization reaches its expiration time before the revoke timer can send
- **THEN** the host shell sends the expired state and expiration audit, and does not send revoke `session-control`, `permission-revoked`, revoked state, or revocation audit for that expired authorization

#### Scenario: Revoke simulation safety boundary
- **WHEN** the host shell sends revoke simulation messages
- **THEN** it MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, or hide the session from the host

#### Scenario: Revoke simulation logging safety boundary
- **WHEN** the agent shell logs received protocol or non-protocol messages during revoke simulation
- **THEN** it MUST log only message summaries and MUST NOT log raw protocol payloads, raw non-protocol text, raw tokens, raw pairing codes, credentials, keystrokes, screenshots, or screen contents

### Requirement: Viewer signal authorization gate
The agent shell SHALL block viewer-originated `signal` sends before socket write and before local `sent` event emission unless the viewer has observed a host-originated active, visible, unexpired authorization state that grants `screen:view`.

#### Scenario: Viewer signal is blocked before authorization
- **WHEN** a viewer runtime is connected and attempts to send a `signal` message before receiving an active visible authorization state with `screen:view`
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked signal

#### Scenario: Viewer signal is allowed after active visible grant
- **WHEN** a viewer runtime receives an active `session-authorization-state` with `visibleToHost: true`, unexpired `expiresAt`, and `screen:view`
- **THEN** a viewer-originated `signal` message MAY be sent through the runtime send path
- **AND** the local `sent` event MUST continue to redact the signal payload contents

#### Scenario: Viewer signal fails closed after revoke control, revocation, pause, termination, or expiration
- **WHEN** a viewer runtime has previously observed an active visible `screen:view` state
- **AND** it then observes a bound revoke-permission `session-control` for `screen:view`, a permission revocation that removes `screen:view`, a pause control, a state whose status is not `active`, or the authorization expires
- **THEN** later viewer-originated `signal` sends MUST be rejected before socket write and local `sent` event emission

#### Scenario: Blocked viewer signal diagnostics are secret-safe
- **WHEN** the runtime blocks a viewer-originated `signal` send because active visible `screen:view` authorization is missing
- **THEN** thrown errors, runtime events, and logs MUST NOT expose raw signal payloads, signal payload keys, tokens, pairing codes, authorization reasons, keystrokes, screenshots, screen contents, or input contents

## ADDED Requirements

### Requirement: Revoke control confirmation handling
The viewer runtime SHALL accept same-authority `permission-revoked` confirmation messages for the same authorization after a bound revoke-permission `session-control` has already removed the permission locally. This confirmation MUST NOT restore permissions or authorize sensitive actions.

#### Scenario: Viewer accepts revoke notification after revoke control
- **WHEN** a viewer runtime has active visible authorization for `screen:view`
- **AND** it receives a bound revoke-permission `session-control` for `screen:view`
- **AND** it later receives `permission-revoked` from the same host authority for the same authorization id and permission
- **THEN** the viewer runtime MAY emit the received `permission-revoked` event as a confirmation
- **AND** viewer-originated `signal` sends MUST remain rejected before socket write and local `sent` event emission

#### Scenario: Revoke confirmation remains secret-safe
- **WHEN** the viewer runtime receives the follow-up `permission-revoked` confirmation after a revoke control
- **THEN** local events MAY preserve the message type and consent workflow metadata needed to correlate the confirmation
- **AND** local events and logs MUST NOT expose raw protocol payloads, tokens, pairing codes, private reasons, keystrokes, screenshots, screen contents, or input contents
