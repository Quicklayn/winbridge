## MODIFIED Requirements

### Requirement: Runtime error diagnostics are secret-safe

The agent shell SHALL surface runtime, startup, and socket failures without exposing raw exception messages, raw diagnostic logger error text, tokens, pairing codes, credentials, protocol payload fragments, private reason text, file paths, keystrokes, screenshots, screen contents, or input contents in local runtime events or logs. Runtime, startup, and socket diagnostic logger failures MUST be best-effort observability failures only and MUST NOT grant permissions, activate host visibility, start capture, send input, reconnect peers, send protocol messages other than the normal startup join message that would have been sent without the logger failure, hide the session from the host, or bypass consent workflows. Startup informational capability logs SHALL use static metadata-only wording that does not claim the development MVP viewer surface or explicit host input path are unavailable after those features are configured elsewhere in the runtime.

#### Scenario: Startup capability log describes the development MVP path

- **WHEN** the agent shell WebSocket opens during runtime startup
- **THEN** the startup informational logs include static bounded wording for the development MVP viewer surface and explicit host input path
- **AND** those logs MUST NOT include relay tokens, pairing codes, credentials, protocol payload fragments, local file paths, screen contents, input contents, or full secrets
