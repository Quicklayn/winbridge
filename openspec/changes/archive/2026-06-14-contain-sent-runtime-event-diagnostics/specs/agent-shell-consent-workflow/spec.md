## ADDED Requirements

### Requirement: Sent runtime event diagnostics are best-effort
The agent shell SHALL treat local `sent` runtime event callback output as best-effort diagnostics after an outbound protocol envelope has passed validation and has been written to the WebSocket. Diagnostic `sent` event callback failure in this path MUST NOT emit a runtime error event, expose raw callback error text, undo or reclassify the already-written send, block workflow continuation, suppress host visibility after explicit approval, skip required workflow audit sends that have already passed their audit persistence gate, grant permissions without explicit host approval, authorize signals without active visible permission, start capture, send input, reconnect peers, hide the session from the host, install services, configure startup persistence, elevate privileges, or bypass consent workflows. Diagnostic `sent` event callback failure MUST NOT expose raw protocol payloads, raw signal payloads, raw callback error text, tokens, pairing codes, credentials, private reasons, signal payload keys, audit details, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets.

#### Scenario: Workflow sent event callback failure is contained
- **WHEN** a host runtime explicitly approves a visible authorization request and sends workflow messages through the managed runtime
- **AND** a local `sent` runtime event callback fails while observing a redacted workflow `sent` event
- **THEN** the callback failure MUST NOT emit a runtime error event
- **AND** the viewer MAY still receive workflow messages that passed the existing consent, visibility, authorization, audit, and socket gates
- **AND** the host runtime MUST NOT grant permissions without explicit host approval, authorize signals without active visible permission, start capture, send input, reconnect peers, hide the session from the host, or bypass consent workflows
- **AND** local runtime events and logs MUST NOT expose raw callback error text, raw protocol payloads, raw request reason text, tokens, pairing codes, credentials, private reasons, signal payloads, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets

#### Scenario: Public signal sent event callback failure is contained
- **WHEN** caller code invokes public runtime `send()` with an authorized same-session `signal` after active visible `screen:view` authorization
- **AND** a local `sent` runtime event callback fails while observing the redacted signal `sent` event
- **THEN** the public send MUST NOT throw because of the callback failure
- **AND** the runtime MUST preserve the already-written signal send and redacted `sent` event view
- **AND** the callback failure MUST NOT authorize later signals, change authorization state, grant permissions, start capture, send input, reconnect peers, hide the session from the host, or bypass consent workflows
- **AND** local runtime events and logs MUST NOT expose raw callback error text, raw signal payloads, signal payload keys, tokens, pairing codes, credentials, private reasons, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets

#### Scenario: Blocked sends remain blocked before sent event diagnostics
- **WHEN** caller code invokes public runtime `send()` with malformed, cross-session, unauthorized, disconnected, unsafe, workflow-authority, or signal-gated protocol input
- **THEN** the runtime MUST still reject the send before socket write and before local `sent` event emission
- **AND** no diagnostic `sent` event callback failure can convert the blocked send into a socket write, permission grant, host visibility activation, signal authorization, capture, input, reconnect, hidden session, or consent bypass
