## ADDED Requirements

### Requirement: Host inbound signal authorization gate
The agent shell SHALL ignore inbound `signal` messages at the host before local `received` event emission or received signal summary logging unless the host runtime has locally emitted an active, visible, unexpired authorization state that grants `screen:view`.

#### Scenario: Host ignores inbound signal before active visible authorization
- **WHEN** a host runtime receives a decoded inbound `signal` before it has emitted active visible `screen:view` authorization
- **THEN** the runtime MUST NOT emit a local `received` protocol event for that signal
- **AND** the runtime MUST NOT log a received signal summary for that signal

#### Scenario: Host accepts inbound signal after active visible grant
- **WHEN** a host runtime has emitted an active `session-authorization-state` with `visibleToHost: true`, unexpired `expiresAt`, and `screen:view`
- **THEN** a correctly addressed inbound `signal` from the remote viewer MAY emit a local `received` event
- **AND** that received event MUST continue to redact the signal payload contents

#### Scenario: Host inbound signal fails closed after pause, revocation, termination, or expiration
- **WHEN** a host runtime has previously emitted an active visible `screen:view` state
- **AND** the local workflow then pauses, removes `screen:view`, terminates, or expires that authorization
- **THEN** later inbound `signal` messages MUST be ignored before local `received` event emission and received signal summary logging

#### Scenario: Host restart clears inbound signal authorization
- **WHEN** a host runtime object is stopped and started again after previously emitting active visible `screen:view` authorization
- **THEN** the restarted runtime MUST NOT treat the prior connection's authorization as active for inbound `signal` messages
- **AND** inbound `signal` messages MUST be ignored until the restarted runtime emits a new active visible `screen:view` state

#### Scenario: Ignored host inbound signal diagnostics are secret-safe
- **WHEN** the host runtime ignores an inbound `signal` because authorization is missing, inactive, invisible, expired, or no longer grants `screen:view`
- **THEN** local events and logs expose only redacted summary metadata such as byte length
- **AND** they MUST NOT expose raw protocol payloads, session ids, peer ids, signal payloads, signal payload keys, tokens, pairing codes, private reasons, keystrokes, screenshots, screen contents, or input contents
