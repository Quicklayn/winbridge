## MODIFIED Requirements

### Requirement: Signal messages are authorization-bound
The relay and agents SHALL treat `signal` messages as candidate remote-action signaling and SHALL require a valid top-level `authorizationId` in every `signal.payload` before forwarding, sending, emitting trusted signal events, or accepting it as signaling metadata. The `signal.payload` MUST be a bounded JSON-compatible object whose property names do not contain ASCII control characters or Unicode bidirectional or zero-width formatting controls including `U+FEFF`.

#### Scenario: Signal payload includes authorization id
- **WHEN** a peer sends a `signal` message with a JSON-compatible payload containing a valid top-level `authorizationId`
- **THEN** the receiver can validate the message before applying local authorization checks

#### Scenario: Signal payload lacks authorization id
- **WHEN** a peer sends a `signal` message without a top-level `authorizationId`
- **THEN** the receiver rejects the message before forwarding or treating it as authorized signaling metadata

#### Scenario: Signal payload has unsafe property name
- **WHEN** a peer sends a `signal` message whose payload contains a property name with an ASCII control character or Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** the receiver rejects the message before forwarding or treating it as authorized signaling metadata
- **AND** diagnostics MUST NOT expose the raw unsafe property name or payload value

#### Scenario: Signal payload sensitive keys are rejected
- **WHEN** a `signal` payload contains obvious token, credential, pairing-code, API-key, authorization-header, auth-header, cookie, private-key, keystroke, screenshot, screen-data, screen-content, clipboard-content, file-transfer content/data/bytes, diagnostics content/dump, or secret keys
- **THEN** the payload is rejected before forwarding or trusted event emission
- **AND** non-secret lifecycle identifiers such as `authorizationId` remain permitted

#### Scenario: Signal payload is non-JSON
- **WHEN** a `signal` payload contains values that cannot be represented faithfully in JSON
- **THEN** the receiver rejects the message before forwarding or trusted event emission

#### Scenario: Signal payload is oversized
- **WHEN** a `signal` payload exceeds the bounded encoded payload size
- **THEN** the receiver rejects the message before forwarding or trusted event emission
