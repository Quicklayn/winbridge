## ADDED Requirements

### Requirement: Agent signal payload JSON compatibility
The agent shell SHALL inherit shared protocol `signal.payload` JSON-compatible object validation for public runtime sends and inbound messages. This validation MUST NOT weaken existing signal authorization, routing, redaction, or consent gates.

#### Scenario: Public send rejects non-JSON signal payload
- **WHEN** caller code invokes public runtime `send()` with a `signal` payload containing a non-JSON value or property shape
- **THEN** the runtime rejects the send before socket write and before local `sent` event emission

#### Scenario: Inbound non-JSON signal payload is not trusted
- **WHEN** the agent shell receives a decoded `signal` message whose payload contains a non-JSON value or property shape
- **THEN** shared protocol validation rejects the message before local `received` protocol event emission or received signal summary logging

#### Scenario: Signal JSON validation does not grant access
- **WHEN** a `signal` payload is JSON-compatible
- **THEN** JSON compatibility alone MUST NOT authorize screen capture, input, clipboard access, file transfer, diagnostics, reconnect, hidden sessions, or consent bypass
