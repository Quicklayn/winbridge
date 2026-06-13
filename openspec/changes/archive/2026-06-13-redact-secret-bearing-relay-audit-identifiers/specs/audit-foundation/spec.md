## MODIFIED Requirements

### Requirement: Bounded relay audit actor identifiers
The relay audit layer SHALL emit schema-valid audit actor identifiers for relay events associated with any valid protocol peer id. Relay peer ids that contain secret-bearing audit metadata MUST NOT appear raw in readable actor ids or actor-related detail metadata.

#### Scenario: Short safe relay peer id remains readable
- **WHEN** the relay writes an audit record for a peer id whose prefixed relay actor id fits the protocol identifier limit and whose peer id contains no secret-bearing metadata
- **THEN** the audit actor id MAY include the readable peer id in the existing `development-relay:<peerId>` form

#### Scenario: Max-length relay peer id is bounded
- **WHEN** the relay writes an audit record for a valid peer id that would exceed the audit actor id limit after prefixing
- **THEN** the audit actor id MUST use a deterministic bounded identifier that passes audit schema validation

#### Scenario: Secret-bearing relay peer id is redacted
- **WHEN** the relay writes an audit record for a peer id that contains secret-bearing metadata such as a token, credential, cookie, API key, access key, private key, SSH key, authorization header, or auth header marker
- **THEN** the audit actor id MUST NOT include the raw peer id
- **AND** actor-related audit detail MUST include only bounded redaction metadata for that peer id

#### Scenario: Bounded relay actor metadata is secret-safe
- **WHEN** the relay uses a bounded actor id for an overlong or secret-bearing peer id
- **THEN** any additional audit detail metadata MUST be bounded, deterministic where it does not derive from a secret, and MUST NOT include raw tokens, raw pairing codes, credentials, protocol payloads, keystrokes, screenshots, screen contents, or full secrets
