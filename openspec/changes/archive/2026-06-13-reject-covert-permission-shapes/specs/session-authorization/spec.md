## ADDED Requirements

### Requirement: Authorization rejects covert and high-risk administrative permission shapes
The shared session authorization state machine and consent-bound grant validation SHALL reject permission strings outside the current permission vocabulary, including representative shapes `remote-shell`, `admin:run`, `unattended:access`, `persistence:install`, `service:install`, `startup:persist`, `privilege:elevate`, `credential:read`, `keylog:capture`, `stealth:session`, and `windows-prompt:bypass`. These strings MUST be rejected in pending request creation, approval grants, parsed authorization records, consent-bound grants, permission revocation, and direct action authorization checks before any access is created, restored, revoked, or authorized.

#### Scenario: Viewer request uses a rejected permission shape
- **WHEN** pending session authorization is created with a covert or high-risk administrative permission-shaped string
- **THEN** authorization creation fails before a pending request exists

#### Scenario: Host approval or grant uses a rejected permission shape
- **WHEN** host approval or consent-bound grant validation includes a covert or high-risk administrative permission-shaped string
- **THEN** the grant is rejected before it can authorize remote access

#### Scenario: Revocation or action check uses a rejected permission shape
- **WHEN** a revocation request or direct action authorization check names a covert or high-risk administrative permission-shaped string
- **THEN** the authorization layer rejects the permission before changing state or authorizing the action
