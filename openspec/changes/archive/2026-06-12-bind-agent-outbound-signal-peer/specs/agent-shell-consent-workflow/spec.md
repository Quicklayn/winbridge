## ADDED Requirements

### Requirement: Outbound signal peer binding
The agent shell SHALL reject public managed runtime `send()` calls for `signal` messages before socket write and before local `sent` event emission when the signal sender does not identify the local runtime peer or when an explicit signal target does not identify the authorized remote peer for the active authorization.

#### Scenario: Spoofed signal sender is blocked
- **WHEN** caller code invokes public runtime `send()` with a `signal` whose `fromPeerId` differs from the local runtime peer id
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked signal

#### Scenario: Self-targeted signal is blocked
- **WHEN** caller code invokes public runtime `send()` with a `signal` whose explicit `toPeerId` equals the local runtime peer id
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked signal

#### Scenario: Third-peer signal target is blocked
- **WHEN** caller code invokes public runtime `send()` with a `signal` whose explicit `toPeerId` identifies a peer other than the authorized remote peer
- **AND** the runtime has active visible `screen:view` authorization
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked signal

#### Scenario: Authorized signal routing remains available
- **WHEN** caller code invokes public runtime `send()` with a `signal` whose `fromPeerId` equals the local runtime peer id and whose explicit `toPeerId`, when present, equals the authorized remote peer
- **AND** the runtime has active visible `screen:view` authorization
- **THEN** the signal MAY be written to the socket
- **AND** the local `sent` event MUST continue to redact the signal payload contents

#### Scenario: Blocked outbound signal routing diagnostics are secret-safe
- **WHEN** the runtime blocks a public `signal` send because the sender is spoofed, the explicit target is the local runtime peer, or the explicit target is not the authorized remote peer
- **THEN** thrown errors, runtime events, and logs MUST NOT expose raw signal payloads, signal payload keys, tokens, pairing codes, authorization reasons, peer ids, keystrokes, screenshots, screen contents, or input contents
