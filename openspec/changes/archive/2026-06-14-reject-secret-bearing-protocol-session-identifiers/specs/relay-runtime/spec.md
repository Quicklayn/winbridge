## MODIFIED Requirements

### Requirement: Secret-bearing relay audit identifier redaction
The relay runtime SHALL redact schema-valid protocol identifiers from relay audit output when those identifiers contain secret-bearing metadata such as token, credential, cookie, API key, access key, private key, SSH key, authorization header, or auth header markers and the identifier is still safe to accept as non-session operational metadata. Redaction MUST apply before writing relay actor ids and forwarded recipient peer metadata. Secret-bearing protocol `sessionId` values and secret-bearing join identifiers that are used as pairing or room metadata MUST be rejected before relay registration, room lookup, pairing ticket creation or consumption, paired-device recording, accepted join audit, denied join audit, forwarding, or accepted-forward audit. The relay MAY include bounded redaction metadata such as a redaction boolean and original length for accepted non-session identifiers. Identifier redaction MUST NOT grant consent, authorization, capture, input, reconnect, clipboard, file-transfer, diagnostics, service, startup, persistence, privilege elevation, hidden-session, or Windows prompt-bypass behavior.

#### Scenario: Join rejects secret-bearing session identifier
- **WHEN** an unregistered peer joins with a schema-valid `sessionId` containing secret-bearing metadata
- **THEN** the relay rejects the join before registration, room lookup, host pairing ticket creation, viewer pairing ticket consumption, paired-device recording, accepted join audit, or denied join audit
- **AND** peer-facing relay errors and invalid-message audit records MUST NOT expose the raw `sessionId`

#### Scenario: Accepted join redacts secret-bearing peer identifier
- **WHEN** a peer joins with a schema-valid `peerId` containing secret-bearing metadata while providing non-secret identity and pairing metadata that remain valid for the join
- **THEN** the accepted join audit record MUST NOT include the raw peer identifier in relay actor id or detail metadata
- **AND** the join outcome and room membership semantics remain unchanged

#### Scenario: Join device identity rejects secret-bearing device id
- **WHEN** an accepted or denied join would include a schema-valid `deviceIdentity.deviceId` that contains secret-bearing metadata, or a missing device identity would derive a secret-bearing fallback device id from `peerId`
- **THEN** the relay rejects the join before registration, pairing side effects, accepted join audit, or denied join audit
- **AND** peer-facing relay errors and invalid-message audit records MUST NOT expose the raw device id, raw peer id, raw derived device id, or raw pairing code

#### Scenario: Forwarded recipient audit redacts secret-bearing recipient peer id
- **WHEN** the relay forwards a schema-valid peer message to a registered recipient whose peer id contains secret-bearing metadata
- **THEN** the accepted forward audit detail MUST NOT include the raw recipient peer id
- **AND** the peer message is still forwarded according to the existing room and targeting rules

#### Scenario: Safe identifiers remain inspectable
- **WHEN** relay audit identifiers are schema-valid, bounded, and contain no secret-bearing metadata
- **THEN** existing readable audit identifier fields remain available for operational correlation

### Requirement: Relay audit redacts separator-form secret identifiers
The relay runtime SHALL treat schema-valid protocol identifiers as secret-bearing audit identifiers when token, credential, cookie, API key, access key, private key, SSH key, authorization header, or auth header marker families appear across identifier punctuation separators such as `.`, `_`, `-`, or `:` and the identifier is still safe to accept as non-session operational metadata. Redaction MUST apply before writing relay actor ids and forwarded recipient peer metadata. Separator-form secret-bearing protocol `sessionId` values and separator-form secret-bearing join identifiers that are used as pairing or room metadata MUST be rejected before relay registration, room lookup, pairing ticket creation or consumption, paired-device recording, accepted join audit, denied join audit, forwarding, or accepted-forward audit. This redaction MUST NOT grant consent, authorization, capture, input, reconnect, clipboard, file-transfer, diagnostics, service, startup, persistence, privilege elevation, hidden-session, or Windows prompt-bypass behavior.

#### Scenario: Join rejects separator-form secret session identifier
- **WHEN** a peer joins with a schema-valid `sessionId` containing secret marker families separated by allowed identifier punctuation
- **THEN** the relay rejects the join before registration, room lookup, pairing side effects, accepted join audit, or denied join audit
- **AND** peer-facing relay errors and invalid-message audit records MUST NOT expose the raw `sessionId`

#### Scenario: Accepted join redacts separator-form peer identifier
- **WHEN** a peer joins with a schema-valid `peerId` containing secret marker families separated by allowed identifier punctuation while providing non-secret identity and pairing metadata that remain valid for the join
- **THEN** the accepted join audit record MUST NOT include the raw peer identifier in relay actor id or detail metadata
- **AND** the join outcome and room membership semantics remain unchanged

#### Scenario: Join device identity rejects separator-form secret device id
- **WHEN** an accepted or denied join would include a schema-valid `deviceIdentity.deviceId` with secret marker families separated by allowed identifier punctuation, or a missing device identity would derive a separator-form secret-bearing fallback device id from `peerId`
- **THEN** the relay rejects the join before registration, pairing side effects, accepted join audit, or denied join audit
- **AND** peer-facing relay errors and invalid-message audit records MUST NOT expose the raw device id, raw peer id, raw derived device id, or raw pairing code

#### Scenario: Forwarded recipient audit redacts separator-form recipient peer id
- **WHEN** the relay forwards a schema-valid peer message to a registered recipient whose peer id contains secret marker families separated by allowed identifier punctuation
- **THEN** the accepted forward audit detail MUST NOT include the raw recipient peer id
- **AND** the peer message is still forwarded according to the existing room and targeting rules
