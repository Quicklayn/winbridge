## MODIFIED Requirements

### Requirement: Testable audit behavior
The relay runtime SHALL allow tests to inject audit sinks and inspect security-relevant runtime events.

#### Scenario: Runtime rejects invalid token
- **WHEN** a peer connects with a missing, invalid, or duplicated shared token
- **THEN** the injected audit sink receives a secret-safe denied token event
- **AND** the peer-facing close reason MUST be bounded and MUST NOT include the raw presented token, configured shared token, credentials, pairing codes, protocol payloads, private reasons, keystrokes, screenshots, or screen contents
