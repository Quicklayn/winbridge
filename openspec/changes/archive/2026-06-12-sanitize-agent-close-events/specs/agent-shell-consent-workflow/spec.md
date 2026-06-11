## ADDED Requirements

### Requirement: Closed runtime events are secret-safe
The agent shell SHALL emit local `closed` runtime events without exposing raw WebSocket close reasons, tokens, pairing codes, credentials, parser details, protocol payload fragments, keystrokes, screenshots, screen contents, or input contents.

#### Scenario: WebSocket close reason is redacted
- **WHEN** the managed runtime receives a WebSocket close frame with a reason
- **THEN** the local `closed` runtime event MUST expose only secret-safe metadata such as close code and reason byte length and MUST NOT expose the raw reason text

#### Scenario: Disconnect log remains summary-only
- **WHEN** the managed runtime logs a WebSocket disconnect
- **THEN** the log MUST include only summary metadata and MUST NOT include the raw close reason text
