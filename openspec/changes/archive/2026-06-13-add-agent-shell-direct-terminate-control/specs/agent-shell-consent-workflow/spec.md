## MODIFIED Requirements

### Requirement: Host workflow audit-event simulation
The host shell SHALL emit secret-safe development `audit-event` protocol messages for explicit host authorization decisions, visible activation, delayed or direct permission revocation, and delayed or direct session termination.

#### Scenario: Host approval audit event
- **WHEN** the host shell approves an authorization request
- **THEN** it sends an `audit-event` with accepted outcome and secret-safe granted permission count metadata

#### Scenario: Host denial audit event
- **WHEN** the host shell denies an authorization request
- **THEN** it sends an `audit-event` with denied outcome and secret-safe requested permission count metadata

#### Scenario: Visible activation audit event
- **WHEN** the host shell emits active visible session state
- **THEN** it sends an `audit-event` with accepted outcome and visible host metadata

#### Scenario: Permission revoke audit event
- **WHEN** the host shell sends a delayed or direct permission revocation
- **THEN** it sends an `audit-event` with accepted outcome, revoked permission identifier, and remaining permission count

#### Scenario: Session termination audit event
- **WHEN** the host shell sends delayed or direct session termination
- **THEN** it sends an `audit-event` with accepted outcome, visible host metadata, and previously granted permission count

#### Scenario: Agent shell audit-event details are secret-safe
- **WHEN** the host shell sends development audit-event messages
- **THEN** audit details MUST NOT contain raw tokens, raw pairing codes, credentials, display names, signal payloads, keystrokes, screenshots, screen contents, or raw denial/revocation/termination reason text

### Requirement: Host session terminate simulation
The host shell SHALL send session termination messages only when delayed termination is explicitly configured or direct local host termination control is invoked. Host termination control MUST be available only to host runtimes with visible active or paused unexpired authorization. Host-generated terminate `session-control` messages MUST include the authorization id of the visible active or paused session being controlled.

#### Scenario: Host terminates after visible activation
- **WHEN** the host shell is explicitly configured to approve, visible session state is true, and a terminate delay is configured
- **THEN** it sends an approved decision, sends active visible state, sends `session-control` with action `terminate` and the active authorization id after the delay, sends `session-authorization-state` with status `terminated`, and sends a secret-safe termination `audit-event`

#### Scenario: Direct host termination terminates a visible active session
- **WHEN** host runtime code invokes local termination control after visible active authorization
- **THEN** it sends `session-control` with action `terminate`, sends `session-authorization-state` with status `terminated`, emits an inactive local host indicator, and sends a secret-safe termination `audit-event`

#### Scenario: Direct host termination works while paused
- **WHEN** host runtime code invokes local termination control after visible paused authorization
- **THEN** it sends the same termination protocol and audit sequence
- **AND** the terminal authorization state has status `terminated` and no permissions

#### Scenario: Direct host termination requires active or paused visible authorization
- **WHEN** runtime code invokes local termination control before visible active or paused host authorization
- **THEN** the runtime MUST reject the control before sending session-control, authorization-state, or audit-event messages

#### Scenario: Direct host termination is host-only
- **WHEN** viewer runtime code invokes local termination control
- **THEN** the runtime MUST reject the control before sending session-control, authorization-state, or audit-event messages

#### Scenario: Terminate configured without visible activation
- **WHEN** the host shell is configured to approve but visible session state is false
- **THEN** it does not send terminate `session-control` and does not send active or terminated state updates

#### Scenario: Termination suppresses later revoke simulation
- **WHEN** delayed or direct termination is sent before a configured permission revocation
- **THEN** the host shell does not send later revocation messages for the terminated authorization

#### Scenario: Expiration suppresses delayed or direct termination
- **WHEN** termination is scheduled or invoked and the authorization reaches expiration first
- **THEN** the host shell sends the expired state and expiration audit, and does not send terminate `session-control`, terminated state, or termination audit for that expired authorization

#### Scenario: Terminate simulation safety boundary
- **WHEN** the host shell sends delayed or direct termination messages
- **THEN** it MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, or hide the session from the host

#### Scenario: Terminate audit details are secret-safe
- **WHEN** the host shell sends a termination audit-event
- **THEN** audit details MUST NOT contain raw tokens, raw pairing codes, credentials, display names, signal payloads, keystrokes, screenshots, screen contents, or raw termination reason text
