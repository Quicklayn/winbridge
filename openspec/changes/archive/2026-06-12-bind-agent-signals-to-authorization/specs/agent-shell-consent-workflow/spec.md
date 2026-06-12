## ADDED Requirements

### Requirement: Signal authorization-id binding
The agent shell SHALL bind outbound and inbound `signal` messages to the current active visible authorization by requiring a payload authorization id that matches the runtime's active authorization snapshot. This binding is a consent-safety gate only and MUST NOT authorize screen capture, input, clipboard access, file transfer, diagnostics, reconnect, hidden sessions, or consent bypass.

#### Scenario: Outbound signal without authorization id is blocked
- **WHEN** a host or viewer runtime has active visible `screen:view` authorization and caller code invokes public `send()` with a `signal` whose payload omits `authorizationId`
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked signal

#### Scenario: Outbound signal with mismatched authorization id is blocked
- **WHEN** a host or viewer runtime has active visible `screen:view` authorization and caller code invokes public `send()` with a `signal` whose payload `authorizationId` does not match the active authorization id
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked signal

#### Scenario: Outbound signal with matching authorization id is allowed
- **WHEN** a host or viewer runtime has active visible `screen:view` authorization and caller code invokes public `send()` with a `signal` whose routing metadata and payload `authorizationId` match the active authorization
- **THEN** the signal MAY be written to the socket
- **AND** the local `sent` event MUST continue to redact raw signal payload contents

#### Scenario: Inbound signal without matching authorization id is ignored
- **WHEN** a host or viewer runtime receives a routed `signal` whose payload omits `authorizationId` or carries an authorization id that does not match the runtime's active authorization
- **THEN** the runtime MUST ignore the signal before local `received` event emission and before received signal summary logging

#### Scenario: Inbound signal with matching authorization id is received
- **WHEN** a host or viewer runtime has active visible `screen:view` authorization and receives a routed `signal` whose payload `authorizationId` matches the active authorization id
- **THEN** the runtime MAY emit a local `received` event for that signal
- **AND** the received event MUST continue to redact raw signal payload contents

#### Scenario: Signal authorization binding diagnostics are secret-safe
- **WHEN** the runtime blocks or ignores a `signal` because its payload authorization id is missing, malformed, or mismatched
- **THEN** thrown errors, runtime events, and logs MUST NOT expose raw signal payloads, signal payload keys, tokens, pairing codes, authorization reasons, display names, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, or input contents
