## ADDED Requirements

### Requirement: Testable registered recipient targeting
The relay runtime SHALL expose integration-test coverage proving registered-peer messages require a remaining recipient and explicit targets must match that recipient.

#### Scenario: Runtime rejects registered message without recipient
- **WHEN** integration tests register a host only, then the host sends an ordinary peer message
- **THEN** the sender receives a bounded relay error and no accepted forward audit record is emitted for that message

#### Scenario: Runtime rejects misaddressed signal target
- **WHEN** integration tests register a host and viewer, then one peer sends `signal` with `toPeerId` set to itself or an unknown peer
- **THEN** the sender receives a bounded relay error and the remaining peer receives no forwarded `signal` message

#### Scenario: Runtime rejects misaddressed authorization decision
- **WHEN** integration tests register a host and viewer, then the host sends an authorization decision addressed to a different viewer peer id
- **THEN** the sender receives a bounded relay error and the viewer receives no forwarded authorization decision

#### Scenario: Runtime recipient rejection audit remains secret-safe
- **WHEN** the runtime audits a missing-recipient or target-mismatch rejection
- **THEN** the audit record identifies the rejection without raw pairing codes, tokens, credentials, protocol payloads, private reasons, keystrokes, screenshots, screen contents, or full secrets
