## ADDED Requirements

### Requirement: Host authorization expiration simulation
The host shell SHALL simulate authorization expiration only after an explicitly approved authorization has emitted active visible session state.

#### Scenario: Host authorization expires after visible activation
- **WHEN** the host shell is explicitly configured to approve, visible session state is true, and the configured authorization TTL elapses
- **THEN** it sends `session-authorization-state` with status `expired`, empty permissions, and a secret-safe expiration `audit-event`

#### Scenario: Expiration configured without visible activation
- **WHEN** the host shell is configured to approve but visible session state is false
- **THEN** it does not send active or expired state updates

#### Scenario: Terminal state suppresses expiration
- **WHEN** authorization expiration is scheduled and the authorization is revoked or terminated before the TTL elapses
- **THEN** the host shell does not send a later expired state update for the same authorization

#### Scenario: Expiration audit details are secret-safe
- **WHEN** the host shell sends an expiration audit-event
- **THEN** audit details MUST NOT contain raw tokens, raw pairing codes, credentials, display names, signal payloads, keystrokes, screenshots, screen contents, or raw protocol payloads

#### Scenario: Expiration simulation safety boundary
- **WHEN** the host shell sends expiration simulation messages
- **THEN** it MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, or hide the session from the host
