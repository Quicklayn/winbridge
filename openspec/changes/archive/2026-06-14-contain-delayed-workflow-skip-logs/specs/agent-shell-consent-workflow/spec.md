## ADDED Requirements

### Requirement: Delayed host workflow skip diagnostics are best-effort
The agent shell SHALL treat delayed host workflow skip logger output as best-effort diagnostics after the runtime has already decided not to send a delayed host workflow action because the local peer is disconnected, the remote peer is disconnected, or the socket is closed. Diagnostic logger failure while reporting a skipped delayed workflow action MUST NOT emit a runtime error event, expose raw logger error text, send `session-control`, `permission-revoked`, `session-authorization-state`, `signal`, `peer-disconnected`, or workflow `audit-event` messages, grant permissions, change authorization lifecycle state, start capture, send input, reconnect peers, suppress host visibility, hide the session from the host, install services, configure startup persistence, elevate privileges, or bypass consent workflows.

#### Scenario: Remote disconnect skip logger failure is contained
- **WHEN** a host shell has delayed revoke, pause, resume, terminate, expiration, or disconnect workflow simulation scheduled
- **AND** the trusted viewer peer disconnects before those delayed workflow timers fire
- **AND** the diagnostic logger fails while reporting a bounded skipped delayed workflow action
- **THEN** the logger failure MUST NOT emit a runtime error event
- **AND** the host shell MUST NOT send delayed lifecycle, control, permission, signal, disconnect, or workflow audit messages after the trusted peer disconnect
- **AND** local runtime events and logs MUST NOT expose raw logger error text, tokens, pairing codes, protocol payloads, credentials, private reasons, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets

#### Scenario: Local disconnect skip logger failure is contained
- **WHEN** a host shell closes its local relay connection before delayed revoke, pause, resume, terminate, expiration, or disconnect workflow timers fire
- **AND** the diagnostic logger fails while reporting a bounded skipped delayed workflow action
- **THEN** the logger failure MUST NOT emit a runtime error event
- **AND** the host shell MUST NOT send delayed lifecycle, control, permission, signal, peer-originated disconnect, or workflow audit messages because of that logger failure
- **AND** the logger failure MUST NOT grant permissions, start capture, send input, reconnect peers, hide the session from the host, or bypass consent workflows
