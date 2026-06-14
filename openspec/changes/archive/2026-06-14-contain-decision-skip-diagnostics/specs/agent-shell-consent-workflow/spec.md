## ADDED Requirements

### Requirement: Authorization decision skip diagnostics are best-effort
The agent shell SHALL treat diagnostic logger output emitted after declining to send a host authorization decision because the requesting viewer is no longer the connected observed viewer as best-effort observability. Diagnostic logger failure in this skip path MUST NOT emit runtime error events, send `session-authorization-decision`, send `session-authorization-state`, send `session-control`, send `permission-revoked`, send `signal`, send workflow `audit-event` messages, grant permissions, activate or suppress host visibility beyond the already-decided disconnected state, start capture, send input, reconnect peers, hide the session from the host, install services, configure startup persistence, elevate privileges, or bypass consent workflows. Diagnostic logger failure MUST NOT expose raw logger error text, tokens, pairing codes, protocol payloads, display names, private reasons, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets.

#### Scenario: Viewer-disconnected authorization decision skip logger failure is contained
- **WHEN** a host consent decision resolves after the requesting viewer has disconnected
- **AND** the host shell declines to send the delayed authorization decision because the viewer is no longer connected
- **AND** the diagnostic logger fails while reporting the bounded skip diagnostic
- **THEN** the host shell MUST NOT emit a runtime error because of the logger failure
- **AND** the runtime MUST NOT send authorization decision, authorization state, lifecycle control, permission revocation, signal, or workflow audit messages because of that logger failure
- **AND** the host runtime MUST NOT emit an active host indicator
- **AND** the logger failure MUST NOT expose raw logger error text or weaken consent, visibility, authorization, audit, signal, or disconnect boundaries
