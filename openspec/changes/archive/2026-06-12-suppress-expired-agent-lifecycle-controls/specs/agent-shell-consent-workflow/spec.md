## MODIFIED Requirements

### Requirement: Host permission revoke simulation
The host shell SHALL send permission revocation messages only when revocation is explicitly configured, the host has already emitted an active visible session state for the same authorization, and the authorization is still unexpired when the revoke delay fires.

#### Scenario: Host revokes granted permission after visible activation
- **WHEN** the host shell is explicitly configured to approve, visible session state is true, and a revoke delay and permission are configured
- **THEN** it sends an approved decision, sends active visible state, sends `permission-revoked` for the configured permission after the delay, and sends an updated authorization state without that permission

#### Scenario: Host revokes final granted permission
- **WHEN** the configured revoked permission is the only granted permission
- **THEN** the updated authorization state has status `revoked` and an empty permission list

#### Scenario: Revoke configured without visible activation
- **WHEN** the host shell is configured to approve but visible session state is false
- **THEN** it does not send `permission-revoked` and does not send an active or revoked state update

#### Scenario: Expiration suppresses delayed revoke
- **WHEN** a revoke delay is configured but the authorization reaches its expiration time before the revoke timer can send
- **THEN** the host shell sends the expired state and expiration audit, and does not send `permission-revoked`, revoked state, or revocation audit for that expired authorization

#### Scenario: Revoke simulation safety boundary
- **WHEN** the host shell sends revoke simulation messages
- **THEN** it MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, or hide the session from the host

#### Scenario: Revoke simulation logging safety boundary
- **WHEN** the agent shell logs received protocol or non-protocol messages during revoke simulation
- **THEN** it MUST log only message summaries and MUST NOT log raw protocol payloads, raw non-protocol text, raw tokens, raw pairing codes, credentials, keystrokes, screenshots, or screen contents

### Requirement: Host session terminate simulation
The host shell SHALL send session termination simulation messages only when termination is explicitly configured, the host has already emitted an active visible session state for the same authorization, and the authorization is still unexpired when the terminate delay fires.

#### Scenario: Host terminates after visible activation
- **WHEN** the host shell is explicitly configured to approve, visible session state is true, and a terminate delay is configured
- **THEN** it sends an approved decision, sends active visible state, sends `session-control` with action `terminate` after the delay, sends `session-authorization-state` with status `terminated`, and sends a secret-safe termination `audit-event`

#### Scenario: Terminate configured without visible activation
- **WHEN** the host shell is configured to approve but visible session state is false
- **THEN** it does not send terminate `session-control` and does not send active or terminated state updates

#### Scenario: Termination suppresses later revoke simulation
- **WHEN** termination and permission revocation are both configured and termination is sent first
- **THEN** the host shell does not send later revocation messages for the terminated authorization

#### Scenario: Expiration suppresses delayed termination
- **WHEN** a terminate delay is configured but the authorization reaches its expiration time before the terminate timer can send
- **THEN** the host shell sends the expired state and expiration audit, and does not send terminate `session-control`, terminated state, or termination audit for that expired authorization

#### Scenario: Terminate simulation safety boundary
- **WHEN** the host shell sends termination simulation messages
- **THEN** it MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, or hide the session from the host

#### Scenario: Terminate audit details are secret-safe
- **WHEN** the host shell sends a termination audit-event
- **THEN** audit details MUST NOT contain raw tokens, raw pairing codes, credentials, display names, signal payloads, keystrokes, screenshots, screen contents, or raw termination reason text
