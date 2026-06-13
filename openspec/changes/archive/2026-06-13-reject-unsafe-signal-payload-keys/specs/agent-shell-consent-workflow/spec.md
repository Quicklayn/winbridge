## MODIFIED Requirements

### Requirement: Signal messages stay authorization-bound
The agent shell SHALL reject outbound and inbound `signal` messages unless the relevant side has observed active, visible, unexpired `screen:view` authorization and the signal payload carries the matching top-level `authorizationId`. The signal payload MUST be a bounded JSON-compatible object whose property names do not contain ASCII control characters or Unicode bidirectional or zero-width formatting controls including `U+FEFF`. Rejected signal messages MUST NOT emit trusted local `sent` or `received` protocol events, write to the socket, start capture, send input, reconnect peers, suppress host visibility, or bypass consent workflows.

#### Scenario: Viewer signal send lacks active authorization
- **WHEN** the viewer attempts to send a `signal` without active visible authorization
- **THEN** the runtime rejects the send before socket write or trusted `sent` event emission

#### Scenario: Signal payload has unsafe property name
- **WHEN** inbound or public-send signal payload metadata contains a property name with an ASCII control character or Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** the runtime rejects the signal before trusted local event emission or socket write
- **AND** diagnostics MUST NOT expose the raw unsafe property name or payload value

#### Scenario: Signal payload authorization id mismatch
- **WHEN** a `signal` payload carries an `authorizationId` that does not match the observed active authorization
- **THEN** the runtime rejects or ignores the signal before trusted local event emission or socket write

#### Scenario: Signal payload is accepted after visible authorization
- **WHEN** active visible authorization exists and the `signal` payload carries the matching `authorizationId` with safe JSON-compatible metadata
- **THEN** the runtime may emit trusted signal events while still exposing only redacted payload summaries
