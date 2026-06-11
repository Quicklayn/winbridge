## ADDED Requirements

### Requirement: Host session terminate simulation
The host shell SHALL send session termination simulation messages only when termination is explicitly configured and the host has already emitted an active visible session state for the same authorization.

#### Scenario: Host terminates after visible activation
- **WHEN** the host shell is explicitly configured to approve, visible session state is true, and a terminate delay is configured
- **THEN** it sends an approved decision, sends active visible state, sends `session-control` with action `terminate` after the delay, sends `session-authorization-state` with status `terminated`, and sends a secret-safe termination `audit-event`

#### Scenario: Terminate configured without visible activation
- **WHEN** the host shell is configured to approve but visible session state is false
- **THEN** it does not send terminate `session-control` and does not send active or terminated state updates

#### Scenario: Termination suppresses later revoke simulation
- **WHEN** termination and permission revocation are both configured and termination is sent first
- **THEN** the host shell does not send later revocation messages for the terminated authorization

#### Scenario: Terminate simulation safety boundary
- **WHEN** the host shell sends termination simulation messages
- **THEN** it MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, or hide the session from the host

#### Scenario: Terminate audit details are secret-safe
- **WHEN** the host shell sends a termination audit-event
- **THEN** audit details MUST NOT contain raw tokens, raw pairing codes, credentials, display names, signal payloads, keystrokes, screenshots, screen contents, or raw termination reason text
