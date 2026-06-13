## ADDED Requirements

### Requirement: Host disconnect reason validation
The agent shell SHALL support an optional host-local disconnect reason for host disconnect simulation and managed direct host disconnect control. The reason MUST use the same canonical workflow reason validation as other lifecycle reasons and MUST additionally fit the WebSocket close reason frame budget: non-blank, already trimmed, at most 240 characters, at most 123 UTF-8 bytes, no ASCII control characters, and no Unicode bidirectional or zero-width formatting controls including `U+FEFF`. The reason MUST be host-only and MUST NOT make disconnect valid before visible active or paused host authorization.

#### Scenario: Host disconnect reason is accepted for host disconnect simulation
- **WHEN** a host shell is started with a valid `--disconnect-after-ms` value and a valid `--disconnect-reason` value
- **THEN** argument parsing constructs bounded runtime disconnect delay and reason options
- **AND** the existing visible authorization gate remains required before the host WebSocket is closed

#### Scenario: Host disconnect reason is rejected for viewer runtimes
- **WHEN** a viewer shell is started with `--disconnect-reason`
- **THEN** argument parsing MUST fail before the runtime starts or connects to a relay

#### Scenario: Host disconnect reason rejects unsafe text
- **WHEN** CLI or direct runtime options include a disconnect reason that is blank, untrimmed, over the character or UTF-8 byte bound, contains an ASCII control character, or contains a Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** the shell MUST reject it before opening a relay connection, closing a WebSocket, sending a protocol message, emitting a trusted sent event, or writing a disconnect audit record

### Requirement: Host disconnect reason remains local metadata
The host disconnect reason SHALL be used only as the local host WebSocket close reason for host-local disconnect. It MUST NOT be sent as a protocol message, persisted in host workflow audit records, logged as raw text, exposed in local runtime event payloads, grant permissions, start capture, send input, reconnect peers, suppress host visibility, or bypass consent workflows.

#### Scenario: Disconnect close diagnostics redact reason text
- **WHEN** host disconnect simulation or direct host disconnect control closes the local host WebSocket with a configured disconnect reason
- **THEN** local closed events expose redacted close reason text and safe byte length only
- **AND** logs and local runtime events MUST NOT contain the raw configured disconnect reason

#### Scenario: Disconnect audit remains reason-free
- **WHEN** the host shell persists an `agent-shell.session.disconnected` audit record after local host disconnect with a configured disconnect reason
- **THEN** the audit record contains bounded lifecycle metadata such as authorization id/status, cause, visible flag, and permission count
- **AND** it MUST NOT contain the raw configured disconnect reason
