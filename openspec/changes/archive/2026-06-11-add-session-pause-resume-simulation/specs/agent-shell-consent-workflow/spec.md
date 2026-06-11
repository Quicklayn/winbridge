## ADDED Requirements

### Requirement: Host pause and resume simulation
The host shell SHALL send pause and resume simulation messages only when they are explicitly configured and the host has already emitted an active visible session state for the same authorization.

#### Scenario: Host pauses after visible activation
- **WHEN** the host shell is explicitly configured to approve, visible session state is true, and a pause delay is configured
- **THEN** it sends an approved decision, sends active visible state, sends `session-control` with action `pause` after the delay, sends `session-authorization-state` with status `paused`, and sends a secret-safe pause `audit-event`

#### Scenario: Host resumes after pause
- **WHEN** the host shell has paused an authorization and a resume delay is configured
- **THEN** it sends `session-control` with action `resume`, sends `session-authorization-state` with status `active`, and sends a secret-safe resume `audit-event`

#### Scenario: Pause configured without visible activation
- **WHEN** the host shell is configured to approve but visible session state is false
- **THEN** it does not send pause or resume `session-control` messages and does not send paused state updates

#### Scenario: Terminal state suppresses pause and resume
- **WHEN** pause or resume is scheduled and the authorization is revoked, terminated, or expired first
- **THEN** the host shell does not send later pause or resume messages for the same authorization

#### Scenario: Pause and resume audit details are secret-safe
- **WHEN** the host shell sends pause or resume audit-events
- **THEN** audit details MUST NOT contain raw tokens, raw pairing codes, credentials, display names, signal payloads, keystrokes, screenshots, screen contents, or raw pause/resume reason text

#### Scenario: Pause and resume simulation safety boundary
- **WHEN** the host shell sends pause or resume simulation messages
- **THEN** it MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, or hide the session from the host
