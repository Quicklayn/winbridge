# safety-boundaries Specification

## Purpose
TBD - created by archiving change bootstrap-remote-assistance-platform. Update Purpose after archive.
## Requirements
### Requirement: Visible consent session
The system SHALL only permit remote assistance inside an authenticated session that is explicitly approved by the host user and visibly indicated on the host machine for the entire session.

#### Scenario: Host approves a viewer
- **WHEN** a viewer requests access to a host session
- **THEN** the host user is shown the viewer identity, requested permissions, and session controls before access is granted

#### Scenario: Host denies a viewer
- **WHEN** the host user denies a viewer request
- **THEN** the system refuses the session and does not expose screen, input, clipboard, file, or diagnostic data to the viewer

#### Scenario: Active session remains visible
- **WHEN** a remote assistance session is active
- **THEN** the host machine displays a visible session indicator and an immediate disconnect control

### Requirement: Prohibited covert capabilities
The system MUST NOT include hidden sessions, stealth installation, unauthorized persistence, credential theft, keylogging, AV/EDR evasion, Windows prompt bypass, or hidden screen/input capture.

#### Scenario: Feature requests covert access
- **WHEN** a requested feature requires hidden operation, evasion, credential collection, or bypassing user consent
- **THEN** the feature is rejected as out of scope before implementation

### Requirement: Permission-scoped remote actions
The system SHALL model every sensitive remote action as an explicit permission that is requested, granted, logged, and revocable by the host.

#### Scenario: Viewer requests keyboard input
- **WHEN** a viewer requests keyboard input control
- **THEN** the host user must approve the keyboard permission before any keyboard input message can be accepted by the host client

#### Scenario: Host revokes access
- **WHEN** the host revokes a granted permission or terminates the session
- **THEN** the system stops processing the revoked remote actions immediately

### Requirement: Auditability
The system SHALL record security-relevant session events in an audit stream that can be inspected during development and later persisted for production.

#### Scenario: Session lifecycle audit
- **WHEN** a session is requested, approved, denied, revoked, paused, resumed, or terminated
- **THEN** the system emits an audit event with timestamp, actor, session id, action, and outcome

