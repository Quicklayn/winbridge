## ADDED Requirements

### Requirement: Terminal authorization state reasons
The protocol SHALL require a non-blank validated reason on `session-authorization-state` messages with status `denied`, `revoked`, `terminated`, or `expired`. The protocol MUST reject those terminal state updates when the reason is omitted before forwarding, trusted runtime event emission, or workflow processing.

#### Scenario: Denied state includes reason
- **WHEN** a `session-authorization-state` update has status `denied`, no permissions, `visibleToHost` set to false, and a valid reason
- **THEN** the protocol schema accepts the state update as an explicit fail-closed denial notification

#### Scenario: Revoked state includes reason
- **WHEN** a `session-authorization-state` update has status `revoked`, no permissions, and a valid reason
- **THEN** the protocol schema accepts the state update as an explicit fail-closed revocation notification

#### Scenario: Terminated state includes reason
- **WHEN** a `session-authorization-state` update has status `terminated`, no permissions, and a valid reason
- **THEN** the protocol schema accepts the state update as an explicit fail-closed termination notification

#### Scenario: Expired state includes reason
- **WHEN** a `session-authorization-state` update has status `expired`, no permissions, and a valid reason
- **THEN** the protocol schema accepts the state update as an explicit fail-closed expiration notification

#### Scenario: Terminal state omits reason
- **WHEN** a `session-authorization-state` update has status `denied`, `revoked`, `terminated`, or `expired` and omits reason
- **THEN** the protocol schema rejects the state update before peers can process unauditable lifecycle metadata
