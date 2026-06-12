## ADDED Requirements

### Requirement: Max-length peer audit reliability
The relay runtime SHALL write schema-valid audit records for accepted joins and peer events even when the registered peer id is at the maximum valid protocol identifier length.

#### Scenario: Max-length peer join audit is accepted
- **WHEN** a peer joins the relay with a valid max-length peer id
- **THEN** the relay emits `relay.peer.join.accepted` without audit schema failure

#### Scenario: Max-length peer audit omits pairing material
- **WHEN** the relay records audit metadata for a max-length peer id join
- **THEN** the audit record MUST NOT include raw pairing codes, tokens, credentials, protocol payloads, keystrokes, screenshots, screen contents, or full secrets
