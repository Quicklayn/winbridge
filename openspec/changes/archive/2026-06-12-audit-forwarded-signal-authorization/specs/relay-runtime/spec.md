## ADDED Requirements

### Requirement: Forwarded signal authorization audit metadata
The relay runtime SHALL include the non-secret top-level signal `authorizationId` in accepted `relay.message.forwarded` audit detail when forwarding a schema-valid `signal` message, and MUST NOT include raw signal payload contents in that accepted forward audit record.

#### Scenario: Forwarded signal audit includes authorization identifier
- **WHEN** the relay forwards a schema-valid `signal` message with a valid top-level payload `authorizationId`
- **THEN** the accepted forward audit record detail includes `messageType` set to `signal` and `authorizationId` set to that identifier

#### Scenario: Forwarded signal audit omits raw payload contents
- **WHEN** the relay audits an accepted forwarded `signal` message
- **THEN** the audit record detail MUST NOT include raw SDP, ICE candidates, payload markers, tokens, pairing codes, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets
