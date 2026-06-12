## ADDED Requirements

### Requirement: Testable forwarded audit-event audit safety
The relay runtime SHALL expose integration-test coverage proving accepted `audit-event` forwarding audit records include safe message and recipient routing metadata and omit raw audit-event detail metadata.

#### Scenario: Forwarded audit-event reaches recipient with redacted detail
- **WHEN** integration tests register a host and viewer, then the host sends a schema-valid `audit-event` message with sensitive detail metadata
- **THEN** the viewer receives the forwarded `audit-event`
- **AND** sensitive `detail` values are redacted before the recipient observes the message

#### Scenario: Forwarded audit-event audit includes routing metadata
- **WHEN** the relay audits an accepted forwarded `audit-event` message
- **THEN** the accepted forward audit record detail includes `messageType`, `messageId`, `recipientPeerId`, and `recipientRole`
- **AND** the accepted forward audit record detail MUST NOT include raw audit-event detail fields

#### Scenario: Forwarded audit-event audit omits sensitive detail
- **WHEN** the relay audits an accepted forwarded `audit-event` message with private reason, display name, token, screen content, or payload marker metadata
- **THEN** the audit record MUST NOT include raw private reasons, display names, tokens, screen contents, protocol payloads, pairing codes, credentials, keystrokes, screenshots, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets
