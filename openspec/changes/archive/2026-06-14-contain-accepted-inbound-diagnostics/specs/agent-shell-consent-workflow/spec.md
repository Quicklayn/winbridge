## ADDED Requirements

### Requirement: Accepted inbound protocol summary logger failures are best-effort
The agent shell SHALL treat accepted inbound protocol summary logger output as best-effort diagnostics after emitting the redacted local `received` event. Diagnostic logger failure while reporting an accepted inbound protocol summary MUST NOT emit a runtime error event, expose raw logger error text, expose raw protocol payloads, suppress consent workflow handling, suppress host visibility after explicit approval, skip required workflow audit persistence, skip signal authorization checks, send messages that would otherwise be blocked, grant permissions without explicit host approval, start capture, send input, reconnect peers, hide the session from the host, install services, configure startup persistence, elevate privileges, or bypass consent workflows.

#### Scenario: Authorization request summary logger failure is contained
- **WHEN** a host runtime receives a valid same-session `session-authorization-request`
- **AND** the diagnostic logger fails while reporting the bounded accepted inbound protocol summary
- **THEN** the logger failure MUST NOT emit a runtime error event
- **AND** the host runtime MUST still process the request only through the normal explicit approval, visible-session, authorization, and workflow audit gates
- **AND** local runtime events and logs MUST NOT expose raw logger error text, raw request reason text, raw protocol payloads, tokens, pairing codes, credentials, private reasons, signal payloads, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets

#### Scenario: Accepted summary logger failure does not weaken blocked sends
- **WHEN** an accepted inbound protocol summary logger failure occurs
- **THEN** the logger failure MUST NOT authorize any host-originated or viewer-originated `signal` send that lacks active visible `screen:view` authorization
- **AND** the logger failure MUST NOT send authorization, lifecycle, control, permission, signal, disconnect, or workflow audit messages except messages that the unchanged consent workflow would send after existing gates pass
