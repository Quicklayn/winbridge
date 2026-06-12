## MODIFIED Requirements

### Requirement: Audit redaction
The system MUST NOT store raw credentials, raw tokens, raw pairing codes, keystroke contents, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets in audit details.

#### Scenario: Audit details contain sensitive field
- **WHEN** a component writes audit details with a sensitive field name such as token, credential, password, pairingCode, keystroke, screenshot, screenData, clipboardText, fileContent, fileBytes, or diagnosticDump
- **THEN** the audit layer redacts the sensitive value before storage or console output

#### Scenario: Remote content metadata identifiers remain inspectable
- **WHEN** audit details include non-content metadata fields such as `fileTransferId`, `diagnosticId`, `diagnosticStatus`, `fileName`, or `profileName`
- **THEN** the audit layer preserves those metadata values unless another sensitive key rule applies

### Requirement: Protocol audit-event detail redaction
The system SHALL redact sensitive fields in protocol `audit-event` message details during schema parsing and encoding before the message is emitted, forwarded, or stored by development components. Protocol `audit-event` messages MUST reject blank or whitespace-only action metadata before parsing, forwarding, encoding, or persistence.

#### Scenario: Audit-event detail includes sensitive fields
- **WHEN** an `audit-event` protocol message detail includes fields named token, credential, password, pairingCode, keystroke, screenshot, screenData, screenContent, clipboardText, clipboardContents, fileContent, fileData, fileBytes, fileTransfer, diagnosticDump, diagnostics, secret, apiKey, authorization, authHeader, cookie, setCookie, sessionCookie, or privateKey
- **THEN** the protocol schema replaces those values with a redaction marker before returning or encoding the message

#### Scenario: Audit-event detail has nested sensitive fields
- **WHEN** an `audit-event` protocol message detail contains nested objects or arrays with sensitive field names
- **THEN** the protocol schema recursively redacts those sensitive values while preserving non-sensitive metadata

#### Scenario: Audit-event detail preserves non-secret authorization identifiers
- **WHEN** an `audit-event` protocol message detail includes a non-secret lifecycle identifier such as `authorizationId`
- **THEN** the protocol schema preserves that identifier value unless another sensitive key rule applies

#### Scenario: Audit-event detail is omitted
- **WHEN** an `audit-event` protocol message omits detail metadata
- **THEN** the protocol schema accepts the message and uses an empty detail object

#### Scenario: Audit-event action is blank
- **WHEN** an `audit-event` protocol message includes an empty or whitespace-only action
- **THEN** the protocol schema rejects the message before it can be forwarded, encoded, emitted, or persisted with meaningless action metadata
