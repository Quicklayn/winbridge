## ADDED Requirements

### Requirement: Runtime error diagnostics are secret-safe
The agent shell SHALL surface runtime and socket failures without exposing raw exception messages, tokens, pairing codes, credentials, protocol payload fragments, private reason text, file paths, keystrokes, screenshots, screen contents, or input contents in local runtime events or logs.

#### Scenario: Audit sink failure event is redacted
- **WHEN** the configured host workflow audit sink throws an error while writing a record
- **THEN** the host shell MUST emit a local runtime `error` event with a generic error message and secret-safe metadata, and MUST NOT expose the raw exception message

#### Scenario: Runtime error log is redacted
- **WHEN** the agent shell logs a runtime callback failure
- **THEN** the log MUST include only summary metadata such as raw message byte length and MUST NOT include the raw exception message

#### Scenario: Socket error log is redacted
- **WHEN** the agent shell logs a WebSocket error
- **THEN** the log MUST include only summary metadata such as raw message byte length and MUST NOT include the raw socket error message
