## ADDED Requirements

### Requirement: Host local disconnect diagnostics are best-effort
The agent shell SHALL treat diagnostics emitted after local host disconnect audit persistence failure as best-effort cleanup observability. If local disconnect audit persistence fails, failures from diagnostic event callbacks or diagnostic loggers MUST NOT prevent local peer disconnected state, inactive host indicator emission, or local WebSocket close. Diagnostic callback or logger failure MUST NOT send peer-originated `peer-disconnected`, lifecycle, signal, control, or workflow audit messages; grant permissions; start capture; send input; reconnect peers; suppress host visibility; hide the session from the host; or bypass consent workflows. Diagnostics for this path MUST remain bounded and MUST NOT expose raw audit sink error text, raw diagnostic callback error text, raw logger error text, raw close reasons, pairing codes, tokens, protocol payloads, display names, private reasons, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets.

#### Scenario: Scheduled local host disconnect survives diagnostic callback failure
- **WHEN** a host shell with visible active authorization runs scheduled local disconnect
- **AND** writing `agent-shell.session.disconnected` audit persistence fails
- **AND** the local runtime diagnostic event callback or diagnostic logger fails while reporting the sanitized audit failure
- **THEN** the host shell still records local peer disconnected state
- **AND** the host shell still emits an inactive local host indicator
- **AND** the host shell still closes the local WebSocket
- **AND** the cleanup result remains secret-safe

#### Scenario: Direct local host disconnect survives diagnostic callback failure
- **WHEN** caller code invokes direct local host disconnect after visible active or paused authorization
- **AND** writing `agent-shell.session.disconnected` audit persistence fails
- **AND** the local runtime diagnostic event callback or diagnostic logger fails while reporting the sanitized audit failure
- **THEN** the direct disconnect call MUST NOT throw raw audit, callback, logger, close reason, pairing, token, payload, credential, or remote-content text
- **AND** the host shell still emits an inactive local host indicator and closes the local WebSocket

#### Scenario: Local host disconnect diagnostic failure remains non-authorizing
- **WHEN** local host disconnect cleanup contains an audit persistence failure, diagnostic callback failure, or diagnostic logger failure
- **THEN** that failure MUST NOT send lifecycle, signal, control, workflow audit, or peer-originated disconnect protocol messages
- **AND** it MUST NOT grant permissions, start capture, send input, reconnect peers, suppress host visibility, expose clipboard, transfer files, expose diagnostics, install services, configure startup persistence, collect credentials, hide the session from the host, or bypass consent workflows
