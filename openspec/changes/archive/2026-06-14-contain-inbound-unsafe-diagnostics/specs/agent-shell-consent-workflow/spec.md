## ADDED Requirements

### Requirement: Inbound unsafe diagnostic logger failures are best-effort
The agent shell SHALL treat inbound non-protocol and ignored unsafe inbound protocol logger output as best-effort diagnostics after emitting the redacted local `raw` event. Diagnostic logger failure while reporting an ignored inbound unsafe message MUST NOT emit a runtime error event, expose raw logger error text, expose raw protocol payloads, send `session-authorization-decision`, `session-authorization-state`, `session-control`, `permission-revoked`, `signal`, `peer-disconnected`, or workflow `audit-event` messages, grant permissions, change authorization lifecycle state, activate host visibility, start capture, send input, reconnect peers, suppress host visibility, hide the session from the host, install services, configure startup persistence, elevate privileges, or bypass consent workflows.

#### Scenario: Non-protocol logger failure is contained
- **WHEN** the managed runtime receives inbound data that cannot be decoded as a protocol envelope
- **AND** the diagnostic logger fails while reporting the bounded non-protocol byte summary
- **THEN** the logger failure MUST NOT emit a runtime error event
- **AND** the runtime MUST still expose only a redacted local `raw` event with bounded byte metadata
- **AND** the logger failure MUST NOT send protocol messages, grant permissions, activate host visibility, start capture, send input, reconnect peers, or bypass consent workflows
- **AND** local runtime events and logs MUST NOT expose raw inbound text, raw logger error text, tokens, pairing codes, credentials, private reasons, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets

#### Scenario: Decoded unsafe protocol logger failure is contained
- **WHEN** the managed runtime decodes an inbound protocol envelope but rejects it as unsafe for the current runtime before local `received` protocol event emission
- **AND** the diagnostic logger fails while reporting the bounded ignored unsafe inbound byte summary
- **THEN** the logger failure MUST NOT emit a runtime error event
- **AND** the runtime MUST still expose only a redacted local `raw` event with bounded byte metadata
- **AND** the runtime MUST NOT treat the ignored message as a valid received protocol event
- **AND** the logger failure MUST NOT send authorization, lifecycle, control, permission, signal, disconnect, or workflow audit messages
- **AND** local runtime events and logs MUST NOT expose raw protocol payloads, session ids, peer ids, signal payloads, private reasons, raw logger error text, tokens, pairing codes, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets
