## ADDED Requirements

### Requirement: Sent signal runtime events are secret-safe
The agent shell SHALL emit local `sent` runtime events for `signal` messages without exposing raw signal payload contents, tokens, pairing codes, credentials, parser details, protocol payload fragments, keystrokes, screenshots, screen contents, or input contents.

#### Scenario: Sent signal payload is redacted
- **WHEN** the managed runtime sends a valid `signal` protocol message
- **THEN** the local `sent` runtime event MUST identify the signal message and peer routing metadata but MUST NOT expose the raw signal payload contents

#### Scenario: Sent signal event keeps safe diagnostics
- **WHEN** the managed runtime emits a local `sent` event for a `signal` message
- **THEN** the event MAY expose secret-safe metadata such as original payload byte length
