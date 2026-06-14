## ADDED Requirements

### Requirement: Runtime error event diagnostics are best-effort
The agent shell SHALL treat diagnostic event callback output emitted while reporting a sanitized runtime error as best-effort observability after the sanitized runtime error has been prepared. Diagnostic event callback failure in this path MUST NOT replace the sanitized runtime error thrown by direct host controls, prevent bounded runtime error logging, send `session-authorization-decision`, send `session-authorization-state`, send `session-control`, send `permission-revoked`, send `signal`, send workflow `audit-event` messages, grant permissions, activate or suppress host visibility beyond the already-decided failure state, start capture, send input, reconnect peers, hide the session from the host, install services, configure startup persistence, elevate privileges, or bypass consent workflows. Diagnostic event callback failure MUST NOT expose raw callback error text, raw runtime failure text, tokens, pairing codes, protocol payloads, display names, private reasons, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets.

#### Scenario: Direct host control runtime error event callback failure is contained
- **WHEN** a direct host lifecycle control fails before sending protocol messages because required audit persistence fails
- **AND** the host shell prepares a sanitized runtime error event for that audit failure
- **AND** the diagnostic event callback fails while observing the bounded runtime error diagnostic
- **THEN** the direct host control MUST still throw only the sanitized runtime error
- **AND** the host shell MUST still attempt bounded runtime error logging
- **AND** the host shell MUST NOT send the failed lifecycle control, authorization state, permission revocation, signal, or workflow audit messages because of the event callback failure
- **AND** the event callback failure MUST NOT expose raw callback error text, raw audit failure text, or weaken consent, visibility, authorization, audit, signal, or disconnect boundaries
