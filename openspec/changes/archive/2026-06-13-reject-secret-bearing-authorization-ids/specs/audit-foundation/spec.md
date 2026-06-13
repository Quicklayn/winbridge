## ADDED Requirements

### Requirement: Secret-bearing authorization identifiers are redacted in audit detail
The audit layer SHALL redact audit detail values whose key is `authorizationId` when the value is not a string or when the value contains secret-bearing metadata such as token, credential, cookie, API key, access key, private key, SSH key, authorization header, or auth header markers. Redaction MUST occur before local storage, local emission, console output, file persistence, protocol `audit-event` parsing, protocol `audit-event` encoding, or relay forwarding. Non-secret string authorization identifiers MUST remain inspectable.

#### Scenario: Secret-bearing audit detail authorization id is redacted
- **WHEN** a component writes audit detail metadata with `authorizationId` containing token, credential, cookie, API-key, access-key, private-key, SSH-key, authorization-header, or auth-header markers
- **THEN** the audit layer replaces that value with `[REDACTED]` before storage, emission, encoding, persistence, or forwarding
- **AND** raw secret marker values MUST NOT appear in the resulting audit record or protocol `audit-event`

#### Scenario: Non-secret audit detail authorization id remains inspectable
- **WHEN** a component writes audit detail metadata with a schema-valid non-secret `authorizationId`
- **THEN** the audit layer preserves that identifier value unless another sensitive key rule applies

#### Scenario: Non-string audit detail authorization id is redacted
- **WHEN** a component writes audit detail metadata with `authorizationId` as an object, array, number, boolean, or null
- **THEN** the audit layer replaces that value with `[REDACTED]` before storage, emission, encoding, persistence, or forwarding
