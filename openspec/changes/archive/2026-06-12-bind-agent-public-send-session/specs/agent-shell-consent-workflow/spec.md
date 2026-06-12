## ADDED Requirements

### Requirement: Public send session binding
The agent shell SHALL reject public managed runtime `send()` calls before socket write and before local `sent` event emission when the outbound protocol envelope `sessionId` does not match the local runtime session.

#### Scenario: Cross-session public request send is blocked
- **WHEN** caller code invokes public runtime `send()` with a protocol request envelope whose `sessionId` differs from the local runtime session
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked envelope

#### Scenario: Cross-session authorized signal send is blocked
- **WHEN** caller code invokes public runtime `send()` with a `signal` envelope whose `sessionId` differs from the local runtime session
- **AND** the runtime has active visible `screen:view` authorization
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked signal

#### Scenario: Same-session public send gates remain available
- **WHEN** caller code invokes public runtime `send()` with an envelope whose `sessionId` matches the local runtime session
- **THEN** the runtime MAY continue to apply later workflow-authority, signal routing, signal authorization, socket, and protocol validation gates

#### Scenario: Blocked cross-session send diagnostics are secret-safe
- **WHEN** the runtime blocks a public send because its `sessionId` differs from the local runtime session
- **THEN** thrown errors, runtime events, and logs MUST NOT expose raw protocol payloads, message types, session ids, peer ids, signal payloads, signal payload keys, tokens, pairing codes, private reasons, keystrokes, screenshots, screen contents, or input contents
