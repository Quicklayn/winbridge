## ADDED Requirements

### Requirement: Short-TTL authorization lifecycle coherence
The host shell SHALL generate authorization approval and active-state protocol messages with `expiresAt` later than their message `createdAt` for every valid positive authorization TTL. Expiration simulation MUST be scheduled from the authorization `expiresAt` boundary so an already-reached expiration suppresses delayed revoke, terminate, pause, and resume simulation before those controls or state updates can be sent.

#### Scenario: Short TTL approval remains protocol-valid
- **WHEN** the host shell explicitly approves a visible authorization with a very short positive TTL
- **THEN** the generated approval decision and active visible state messages remain valid grant-bearing protocol messages with `expiresAt` after `createdAt`

#### Scenario: Expiration boundary suppresses delayed revoke
- **WHEN** a positive authorization TTL reaches `expiresAt` before a configured permission revoke delay can send
- **THEN** the host shell sends the expired state and expiration audit, and does not send revoke `session-control`, `permission-revoked`, revoked state, or revocation audit for that expired authorization

#### Scenario: Expiration boundary suppresses delayed termination
- **WHEN** a positive authorization TTL reaches `expiresAt` before a configured terminate delay can send
- **THEN** the host shell sends the expired state and expiration audit, and does not send terminate `session-control`, terminated state, or termination audit for that expired authorization

#### Scenario: Expiration boundary suppresses delayed pause and resume
- **WHEN** a positive authorization TTL reaches `expiresAt` before configured pause or resume delays can send
- **THEN** the host shell sends the expired state and expiration audit, and does not send pause, resume, paused state, resumed active state, or their workflow audit events for that expired authorization
