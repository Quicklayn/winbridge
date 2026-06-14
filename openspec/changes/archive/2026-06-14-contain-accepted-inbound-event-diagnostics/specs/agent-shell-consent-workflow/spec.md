## ADDED Requirements

### Requirement: Accepted inbound runtime event diagnostics are best-effort
The agent shell SHALL treat diagnostic `received` runtime event callback output emitted for accepted inbound protocol messages as best-effort observability after protocol validation and before workflow handling. Diagnostic `received` event callback failure in this path MUST NOT emit a runtime error event, suppress consent workflow handling, suppress host visibility after explicit approval, skip required workflow audit persistence, skip signal authorization checks, send messages that would otherwise be blocked, grant permissions without explicit host approval, start capture, send input, reconnect peers, hide the session from the host, install services, configure startup persistence, elevate privileges, or bypass consent workflows. Diagnostic `received` event callback failure MUST NOT expose raw callback error text, raw request reason text, raw protocol payloads, tokens, pairing codes, credentials, private reasons, signal payloads, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets.

#### Scenario: Authorization request event callback failure is contained
- **WHEN** a host runtime receives a valid same-session `session-authorization-request`
- **AND** the diagnostic `received` event callback fails while observing the redacted inbound protocol event
- **THEN** the callback failure MUST NOT emit a runtime error event
- **AND** the host runtime MUST still process the request only through the normal explicit approval, visible-session, authorization, and workflow audit gates
- **AND** the viewer MAY receive the normal approved decision, active visible authorization state, approval workflow audit event, and active workflow audit event if those existing gates pass
- **AND** local runtime events and logs MUST NOT expose raw callback error text, raw request reason text, raw protocol payloads, tokens, pairing codes, credentials, private reasons, signal payloads, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets
