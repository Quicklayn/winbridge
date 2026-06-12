## ADDED Requirements

### Requirement: Agent shell rejects unknown fixed protocol fields
The agent shell SHALL treat inbound and public-send protocol messages with unknown fixed-shape fields as invalid protocol input before trusted runtime events, workflow handling, socket writes, or local sent-event emission.

#### Scenario: Inbound message has unknown fixed field
- **WHEN** the agent shell receives a protocol message with an unknown top-level field outside allowed metadata containers
- **THEN** the runtime MUST reject it before local `received` protocol event emission or workflow handling

#### Scenario: Public send message has unknown fixed field
- **WHEN** caller code invokes public runtime `send()` with a protocol envelope that includes an unknown top-level field outside allowed metadata containers
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked envelope

#### Scenario: Agent shell strict-field diagnostics are secret-safe
- **WHEN** the runtime rejects or ignores a message because of an unknown fixed field
- **THEN** thrown errors, runtime events, and logs MUST NOT expose raw protocol payloads, unknown field values, tokens, pairing codes, private reasons, keystrokes, screenshots, screen contents, or input contents
