## ADDED Requirements

### Requirement: Audit detail redaction covers common authentication keys
The system SHALL redact audit detail fields whose key names indicate common authentication or session secret material, including API keys, authorization headers, auth headers, cookies, set-cookie values, session cookies, and private keys.

#### Scenario: Expanded secret keys are redacted
- **WHEN** a component writes audit details with fields named `apiKey`, `authorization`, `authHeader`, `cookie`, `setCookie`, `sessionCookie`, or `privateKey`
- **THEN** the audit record detail MUST replace those values with `[REDACTED]`

#### Scenario: Expanded secret keys are redacted recursively
- **WHEN** expanded secret-bearing field names appear inside nested objects or arrays in audit details
- **THEN** the audit record detail MUST redact those values recursively

#### Scenario: Non-secret authorization identifiers remain inspectable
- **WHEN** audit details include a non-secret lifecycle identifier such as `authorizationId`
- **THEN** the audit record detail MUST preserve that identifier value unless another sensitive key rule applies
