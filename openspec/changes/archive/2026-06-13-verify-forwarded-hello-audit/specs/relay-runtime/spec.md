## ADDED Requirements

### Requirement: Testable forwarded hello audit metadata
The relay runtime SHALL expose integration-test coverage proving accepted `hello` forwarding audit records include safe message and recipient routing metadata and omit raw user display metadata.

#### Scenario: Forwarded hello audit includes routing metadata
- **WHEN** integration tests register a host and viewer, then one peer sends a schema-valid `hello` message
- **THEN** the remaining peer receives the forwarded `hello`
- **AND** the accepted forward audit record detail includes `messageType`, `messageId`, `recipientPeerId`, and `recipientRole`

#### Scenario: Forwarded hello audit omits presence metadata
- **WHEN** the relay audits an accepted forwarded `hello` message with display name and capability metadata
- **THEN** the audit record MUST NOT include raw display names, raw capability values, protocol payloads, tokens, pairing codes, credentials, keystrokes, screenshots, screen contents, or full secrets
