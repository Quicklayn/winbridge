## ADDED Requirements

### Requirement: Grant-scope mismatch diagnostic logger failures are best-effort
The agent shell SHALL treat configured grant-scope mismatch diagnostic logger output as best-effort after determining that the configured grant permissions include permissions the viewer did not request. Diagnostic logger failure while reporting that configured grant scope is not requested MUST NOT emit a runtime error event, expose raw logger error text, send `session-authorization-decision`, send `session-authorization-state`, emit active host indicator state, send workflow `audit-event`, authorize host-originated or viewer-originated `signal`, grant permissions, start capture, send input, reconnect peers, hide the session from the host, install services, configure startup persistence, elevate privileges, or bypass consent workflows.

#### Scenario: Grant-scope mismatch logger failure is contained
- **WHEN** a host runtime is configured to approve with a grant permission that was not requested by the viewer
- **AND** the diagnostic logger fails while reporting that configured grant scope is not requested
- **THEN** the logger failure MUST NOT emit a runtime error event
- **AND** the host and viewer MUST NOT send or receive authorization decisions, active authorization state, lifecycle controls, permission revocations, signals, peer-originated disconnects, or workflow audit messages because of that failed approval path
- **AND** the host runtime MUST NOT emit an active host indicator
- **AND** local runtime error events and diagnostic logs MUST NOT expose raw logger error text, raw configured grant permission text, raw protocol payloads, tokens, pairing codes, credentials, private reasons, signal payloads, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets

#### Scenario: Grant-scope mismatch logger failure does not authorize signaling
- **WHEN** configured grant-scope mismatch diagnostic logger failure is contained
- **THEN** host-originated and viewer-originated `signal` sends MUST remain blocked unless a later unchanged workflow grants active visible `screen:view` authorization
