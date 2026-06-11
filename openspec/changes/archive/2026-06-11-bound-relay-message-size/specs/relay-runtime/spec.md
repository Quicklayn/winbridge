## ADDED Requirements

### Requirement: Testable relay message size limit
The relay runtime SHALL expose integration-test coverage proving oversized inbound messages are rejected before forwarding.

#### Scenario: Runtime rejects oversized registered peer message
- **WHEN** integration tests register a host and viewer, then one peer sends a WebSocket message larger than the relay message size bound
- **THEN** the sender receives a relay error or the sender connection closes, and the remaining peer does not receive the oversized message as a protocol envelope
