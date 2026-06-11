## ADDED Requirements

### Requirement: Sent runtime events are secret-safe
The agent shell SHALL emit local `sent` runtime events using a validated and redacted protocol event view that does not expose raw secrets.

#### Scenario: Sent join-session pairing code is redacted
- **WHEN** the managed runtime sends a `join-session` protocol message
- **THEN** the local `sent` runtime event MUST NOT expose the raw pairing code

#### Scenario: Sent audit event detail is redacted
- **WHEN** the managed runtime sends an `audit-event` whose detail contains sensitive keys such as tokens or credentials
- **THEN** the local `sent` runtime event exposes the redacted detail and MUST NOT expose the raw sensitive values

#### Scenario: Invalid outbound message emits no sent event
- **WHEN** the managed runtime is asked to send a malformed protocol message
- **THEN** it rejects the send before emitting a local `sent` runtime event
