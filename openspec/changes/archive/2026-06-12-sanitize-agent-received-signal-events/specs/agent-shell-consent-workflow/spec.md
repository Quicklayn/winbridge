## ADDED Requirements

### Requirement: Received signal runtime events are secret-safe
The agent shell SHALL emit local `received` runtime events for `signal` messages without exposing raw signal payload contents, tokens, pairing codes, credentials, parser details, protocol payload fragments, keystrokes, screenshots, screen contents, or input contents.

#### Scenario: Received signal payload is redacted
- **WHEN** the managed runtime receives a valid `signal` protocol message
- **THEN** the local `received` runtime event MUST identify the signal message and peer routing metadata but MUST NOT expose the raw signal payload contents

#### Scenario: Received signal event keeps safe diagnostics
- **WHEN** the managed runtime emits a local `received` event for a `signal` message
- **THEN** the event MAY expose secret-safe metadata such as original payload byte length
