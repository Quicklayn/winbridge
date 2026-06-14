## ADDED Requirements

### Requirement: Unsafe inbound raw event diagnostics are best-effort
The agent shell SHALL treat diagnostic `raw` runtime event callback output emitted for non-protocol inbound data and ignored unsafe inbound protocol messages as best-effort observability after the inbound input has been classified as rejected. Diagnostic `raw` event callback failure in this path MUST NOT emit a runtime error event, expose raw callback error text, expose raw inbound text or protocol payloads, send `session-authorization-decision`, send `session-authorization-state`, send `session-control`, send `permission-revoked`, send `signal`, send `peer-disconnected`, send workflow `audit-event` messages, grant permissions, change authorization lifecycle state, activate host visibility, start capture, send input, reconnect peers, suppress host visibility, hide the session from the host, install services, configure startup persistence, elevate privileges, or bypass consent workflows.

#### Scenario: Non-protocol raw event callback failure is contained
- **WHEN** the managed runtime receives inbound data that cannot be decoded as a protocol envelope
- **AND** the diagnostic `raw` event callback fails while observing the bounded non-protocol byte metadata
- **THEN** the callback failure MUST NOT emit a runtime error event
- **AND** the runtime MUST still attempt bounded non-protocol summary logging
- **AND** the callback failure MUST NOT send protocol messages, grant permissions, activate host visibility, start capture, send input, reconnect peers, or bypass consent workflows
- **AND** local runtime events and logs MUST NOT expose raw inbound text, raw callback error text, tokens, pairing codes, credentials, private reasons, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets

#### Scenario: Decoded unsafe protocol raw event callback failure is contained
- **WHEN** the managed runtime decodes an inbound protocol envelope but rejects it as unsafe for the current runtime before local `received` protocol event emission
- **AND** the diagnostic `raw` event callback fails while observing the bounded ignored unsafe inbound byte metadata
- **THEN** the callback failure MUST NOT emit a runtime error event
- **AND** the runtime MUST still attempt bounded ignored unsafe inbound summary logging
- **AND** the runtime MUST NOT treat the ignored message as a valid received protocol event
- **AND** the callback failure MUST NOT send authorization, lifecycle, control, permission, signal, disconnect, or workflow audit messages
- **AND** local runtime events and logs MUST NOT expose raw protocol payloads, session ids, peer ids, signal payloads, private reasons, raw callback error text, tokens, pairing codes, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets
