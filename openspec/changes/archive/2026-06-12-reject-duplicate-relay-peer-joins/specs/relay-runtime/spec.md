## ADDED Requirements

### Requirement: Testable duplicate peer join rejection
The relay runtime SHALL expose integration-test coverage proving duplicate live peer-id joins are rejected before registration or pairing mutation, while the original peer remains active.

#### Scenario: Runtime rejects duplicate host peer join
- **WHEN** integration tests register a host and a second socket attempts to join the same session with the same host peer id
- **THEN** the duplicate socket receives a bounded relay error
- **AND** the original host remains registered without having its pairing ticket refreshed

#### Scenario: Runtime rejects duplicate viewer peer join
- **WHEN** integration tests register a host and viewer and a second socket attempts to join the same session with the same viewer peer id
- **THEN** the duplicate socket receives a bounded relay error
- **AND** the original viewer remains registered

#### Scenario: Runtime duplicate peer rejection audit remains secret-safe
- **WHEN** the runtime audits a duplicate live peer-id join rejection
- **THEN** the audit record identifies the rejection without raw pairing codes, tokens, credentials, protocol payloads, private reasons, keystrokes, screenshots, screen contents, or full secrets
