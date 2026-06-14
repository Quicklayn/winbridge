## MODIFIED Requirements

### Requirement: Runtime error diagnostics are secret-safe
The agent shell SHALL surface runtime, startup, and socket failures without exposing raw exception messages, raw diagnostic logger error text, tokens, pairing codes, credentials, protocol payload fragments, private reason text, file paths, keystrokes, screenshots, screen contents, or input contents in local runtime events or logs. Runtime, startup, and socket diagnostic logger failures MUST be best-effort observability failures only and MUST NOT grant permissions, activate host visibility, start capture, send input, reconnect peers, send protocol messages other than the normal startup join message that would have been sent without the logger failure, hide the session from the host, or bypass consent workflows.

#### Scenario: Audit sink failure event is redacted
- **WHEN** the configured host workflow audit sink throws an error while writing a record
- **THEN** the host shell MUST emit a local runtime `error` event with a generic error message and secret-safe metadata, and MUST NOT expose the raw exception message

#### Scenario: Runtime error log is redacted
- **WHEN** the agent shell logs a runtime callback failure
- **THEN** the log MUST include only summary metadata such as raw message byte length and MUST NOT include the raw exception message

#### Scenario: Socket error log is redacted
- **WHEN** the agent shell logs a WebSocket error
- **THEN** the log MUST include only summary metadata such as raw message byte length and MUST NOT include the raw socket error message

#### Scenario: Socket error logger failure is contained
- **WHEN** the agent shell observes a WebSocket socket error
- **AND** the diagnostic logger fails while reporting the sanitized socket error log line
- **THEN** the logger failure MUST NOT escape the socket error callback
- **AND** local runtime events and logs MUST NOT expose raw socket error text, raw logger error text, tokens, pairing codes, protocol payloads, credentials, file paths, private reasons, keystrokes, screenshots, screen contents, or input contents
- **AND** the logger failure MUST NOT grant permissions, activate host visibility, start capture, send input, reconnect peers, send protocol messages, hide the session from the host, or bypass consent workflows

#### Scenario: Startup logger failure is contained
- **WHEN** the agent shell WebSocket opens during runtime startup
- **AND** the diagnostic logger fails while reporting startup informational log lines
- **THEN** the logger failure MUST NOT escape the WebSocket open callback or prevent the normal startup `join-session` message from being sent
- **AND** local runtime events and logs MUST NOT expose raw logger error text, tokens, pairing codes, protocol payloads, credentials, file paths, private reasons, keystrokes, screenshots, screen contents, or input contents
- **AND** the logger failure MUST NOT grant permissions, activate host visibility, start capture, send input, reconnect peers, send consent decisions, send lifecycle messages, send control messages, send signal messages, hide the session from the host, or bypass consent workflows
