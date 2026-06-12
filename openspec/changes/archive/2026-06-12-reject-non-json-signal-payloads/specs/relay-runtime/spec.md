## ADDED Requirements

### Requirement: Testable non-JSON signal payload rejection
The relay runtime SHALL expose integration-test coverage proving non-JSON `signal` payloads are rejected before forwarding and that rejection metadata remains secret-safe.

#### Scenario: Relay rejects non-JSON signal payload
- **WHEN** integration tests register a host and viewer, then one peer sends a `signal` message whose payload contains a non-JSON value or property shape
- **THEN** the relay returns a bounded relay error to the sender and the remaining peer receives no forwarded `signal` message

#### Scenario: Non-JSON signal rejection audit is secret-safe
- **WHEN** the relay audits a rejected non-JSON `signal` payload
- **THEN** the audit record identifies the rejection without raw signal payload contents, raw tokens, raw pairing codes, credentials, private reasons, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets
