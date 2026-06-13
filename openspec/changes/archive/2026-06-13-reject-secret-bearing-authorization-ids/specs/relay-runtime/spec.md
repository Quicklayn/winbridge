## ADDED Requirements

### Requirement: Runtime rejects secret-bearing authorization identifiers
The relay runtime SHALL expose integration-test coverage proving registered peer messages with secret-bearing authorization identifiers are rejected before forwarding. Peer-facing relay errors and relay audit records MUST remain bounded and MUST NOT include raw authorization identifiers, token markers, credential markers, cookie markers, API keys, access keys, private keys, SSH keys, authorization headers, auth headers, protocol payloads, private reasons, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets.

#### Scenario: Runtime rejects secret-bearing signal authorization id
- **WHEN** integration tests register a host and viewer, then one peer sends a `signal` message with a secret-bearing `payload.authorizationId`
- **THEN** the sender receives a bounded relay error and the remaining peer receives no forwarded signal
- **AND** relay audit records and peer-facing diagnostics MUST NOT expose the raw authorization id or secret marker value

#### Scenario: Runtime rejects secret-bearing lifecycle authorization id
- **WHEN** integration tests register a host and viewer, then one peer sends an authorization lifecycle or control message with a secret-bearing `authorizationId`
- **THEN** the sender receives a bounded relay error and the remaining peer receives no forwarded authorization lifecycle or control message
- **AND** relay audit records and peer-facing diagnostics MUST NOT expose the raw authorization id or secret marker value
