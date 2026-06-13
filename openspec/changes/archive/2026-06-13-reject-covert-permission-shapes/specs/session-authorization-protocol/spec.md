## ADDED Requirements

### Requirement: Protocol rejects covert and high-risk administrative permission shapes
Authorization protocol envelopes SHALL reject permission strings outside the current permission vocabulary, including representative shapes `remote-shell`, `admin:run`, `unattended:access`, `persistence:install`, `service:install`, `startup:persist`, `privilege:elevate`, `credential:read`, `keylog:capture`, `stealth:session`, and `windows-prompt:bypass`. Rejection MUST happen before parsing, encoding, forwarding, emitting, persistence, or workflow processing can treat the string as requested, granted, active, revoked, or action-authorized permission scope.

#### Scenario: Request or decision message uses a rejected permission shape
- **WHEN** a host consent or session authorization request or decision message includes a covert or high-risk administrative permission-shaped string in requested or granted permissions
- **THEN** protocol parsing rejects the message before forwarding or workflow processing

#### Scenario: State or control message uses a rejected permission shape
- **WHEN** a session authorization state, permission revocation, or session control message includes a covert or high-risk administrative permission-shaped string
- **THEN** protocol parsing rejects the message before forwarding, persistence, or workflow processing
