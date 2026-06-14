## ADDED Requirements

### Requirement: Interactive host consent failure diagnostics are best-effort
The agent shell SHALL treat diagnostics emitted after interactive host consent provider failure as best-effort failure observability. If the host decision provider fails, failures from diagnostic event callbacks or diagnostic loggers MUST NOT prevent the runtime from failing closed without approval. Diagnostic callback or logger failure MUST NOT send `session-authorization-decision`, `session-authorization-state`, `session-control`, `permission-revoked`, `signal`, or workflow `audit-event` messages; grant permissions; activate the host indicator; start capture; send input; reconnect peers; suppress host visibility; hide the session from the host; or bypass consent workflows. Diagnostics for this path MUST remain bounded and MUST NOT expose raw provider error text, raw diagnostic callback error text, raw logger error text, raw viewer display names, raw close reasons, pairing codes, tokens, protocol payloads, private reasons, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets.

#### Scenario: Provider failure remains fail-closed when diagnostic callback fails
- **WHEN** a host shell receives a viewer authorization request and the interactive host decision provider fails
- **AND** the runtime diagnostic event callback fails while reporting the sanitized provider failure
- **THEN** the host shell MUST NOT send an approval, denial, active state, control, signal, permission, or workflow audit message
- **AND** the host shell MUST NOT activate the host indicator
- **AND** the failure result remains secret-safe

#### Scenario: Provider failure remains fail-closed when diagnostic logger fails
- **WHEN** a host shell receives a viewer authorization request and the interactive host decision provider fails
- **AND** the diagnostic logger fails while reporting the sanitized provider failure or the static fail-closed log
- **THEN** the host shell MUST NOT send an approval, denial, active state, control, signal, permission, or workflow audit message
- **AND** the host shell MUST NOT grant permissions, start capture, send input, reconnect peers, hide the session from the host, or bypass consent workflows
