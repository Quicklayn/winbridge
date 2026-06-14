## ADDED Requirements

### Requirement: Forward delivery outcome is audited after send attempt
The relay runtime SHALL write bounded `relay.message.delivery` audit metadata after attempting to deliver a validated registered peer message whose accepted `relay.message.forwarded` audit record was written successfully. Delivery outcome audit metadata MUST remain post-send observability only and MUST NOT replace or weaken the accepted-forward pre-delivery audit gate.

#### Scenario: Successful forwarded message delivery is audited
- **WHEN** a registered peer sends a schema-valid message that passes relay role, session, target, and recipient checks
- **AND** the accepted `relay.message.forwarded` audit record is written successfully
- **AND** the relay sends the message to the selected recipient
- **THEN** the relay writes `relay.message.delivery` audit metadata with the validated message type, validated `messageId`, safe recipient role and peer metadata, delivery target count, delivery sent count, and delivery failed count
- **AND** the successful recipient-visible protocol envelope remains unchanged

#### Scenario: Recipient send failure is a delivery outcome
- **WHEN** the accepted `relay.message.forwarded` audit record is written successfully
- **AND** the recipient send attempt throws or reports failure
- **THEN** the relay writes `relay.message.delivery` audit metadata with `deliveryFailedCount` greater than zero
- **AND** the relay MUST NOT treat the already accepted peer message as a malformed or invalid sender message solely because the recipient send failed

#### Scenario: Delivery outcome audit remains secret-safe
- **WHEN** the relay writes `relay.message.delivery` audit metadata for a forwarded peer message
- **THEN** the audit record MUST NOT expose raw protocol payloads, display names, private reasons, SDP, ICE candidates, payload markers, tokens, pairing codes, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, raw transport error text, or full secrets
- **AND** the delivery outcome metadata MUST NOT approve authorization, activate host visibility, grant permissions, start capture, send input, reconnect peers, suppress host visibility, expose clipboard, transfer files, expose diagnostics, install services, configure startup persistence, collect credentials, hide the session from the host, or bypass consent workflows

#### Scenario: Delivery audit failure is non-retroactive
- **WHEN** the relay has attempted recipient delivery after accepted-forward audit
- **AND** writing `relay.message.delivery` audit metadata fails
- **THEN** the relay MUST NOT emit `relay.message.rejected` for that message solely because the post-send delivery audit failed
- **AND** the relay MUST NOT send a peer-facing `relay-error` for that message solely because the post-send delivery audit failed
- **AND** diagnostics about the delivery audit failure MUST remain bounded and MUST NOT expose raw audit sink error text, protocol payloads, display names, private reasons, tokens, pairing codes, credentials, remote content, or full secrets
