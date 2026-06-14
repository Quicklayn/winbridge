## ADDED Requirements

### Requirement: Viewer request reasons are explicit and host-visible
The viewer agent shell SHALL accept an optional viewer-only request reason only with a non-empty viewer permission request, and the reason MUST be bounded, already trimmed, free of ASCII control characters, free of Unicode bidirectional or zero-width formatting controls including `U+FEFF`, and free of secret-bearing metadata before relay connection or protocol sends. When provided, the viewer SHALL include the reason in the `session-authorization-request.reason` field. Interactive host consent prompts SHALL show the validated request reason, or `unavailable` when omitted, before accepting `approve` or `deny`. Request reason handling MUST NOT approve a session, activate host visibility, grant permissions, start capture, send input, reconnect peers, suppress host visibility, expose clipboard, transfer files, expose diagnostics, install services, configure startup persistence, collect credentials, hide the session from the host, or bypass consent workflows.

#### Scenario: Viewer request includes reason
- **WHEN** the viewer shell is started with requested permissions and a valid request reason
- **AND** the relay indicates a two-peer room
- **THEN** it sends a `session-authorization-request` containing that exact validated reason
- **AND** the request remains subject to host approval, visible-session activation, authorization, and fail-closed gates

#### Scenario: Host mode rejects request reason
- **WHEN** the host shell is started with a request reason option
- **THEN** argument parsing rejects it before the runtime starts, opens a relay connection, sends protocol messages, or emits workflow audit events

#### Scenario: Request reason without requested permissions is rejected
- **WHEN** CLI or direct runtime options include a request reason without requested permissions
- **THEN** validation rejects the input before relay connection, socket write, local trusted `sent` event emission, or host consent prompt display
- **AND** diagnostics, runtime events, logs, and usage output MUST NOT expose the raw rejected reason text

#### Scenario: Request reason validation rejects unsafe text
- **WHEN** CLI or direct runtime options include a request reason that is blank, untrimmed, oversized, contains ASCII control characters, contains Unicode bidirectional or zero-width formatting controls, or contains secret-bearing metadata
- **THEN** validation rejects the input before relay connection, socket write, local trusted `sent` event emission, or host consent prompt display
- **AND** diagnostics, runtime events, logs, and usage output MUST NOT expose the raw rejected reason text

#### Scenario: Host prompt displays request reason
- **WHEN** a host shell is configured for interactive consent and receives a same-session authorization request from the observed viewer with a validated reason
- **THEN** the host-facing prompt text includes the request reason before asking for `approve` or `deny`
- **AND** prompt handling still fails closed for timeout, invalid input, hidden visibility, denied consent, revoked permissions, terminated sessions, and missing authorization

#### Scenario: Host prompt marks omitted request reason unavailable
- **WHEN** a host shell is configured for interactive consent and receives a same-session authorization request from the observed viewer without a reason
- **THEN** the host-facing prompt text marks the request reason as `unavailable`
- **AND** the prompt MUST NOT invent consent context, approve authorization, activate visibility, grant permissions, start capture, or send input
