## ADDED Requirements

### Requirement: Secret-bearing relay audit identifier redaction
The relay runtime SHALL redact schema-valid protocol identifiers from relay audit output when those identifiers contain secret-bearing metadata such as token, credential, cookie, API key, access key, private key, SSH key, authorization header, or auth header markers. Redaction MUST apply before writing top-level audit `sessionId`, relay actor ids, join device identity metadata, and forwarded recipient peer metadata. The relay MAY include bounded redaction metadata such as a redaction boolean and original length. Identifier redaction MUST remain audit-only and MUST NOT change peer registration, room lookup, pairing ticket creation or consumption, forwarding, consent, authorization, capture, input, reconnect, or disconnect behavior.

#### Scenario: Accepted join redacts secret-bearing session and peer identifiers
- **WHEN** a peer joins with schema-valid `sessionId` or `peerId` values that contain secret-bearing metadata
- **THEN** the accepted join audit record MUST NOT include those raw identifiers in top-level `sessionId`, relay actor id, or detail metadata
- **AND** the join outcome and room membership semantics remain unchanged

#### Scenario: Join device identity redacts secret-bearing device id
- **WHEN** an accepted or denied join includes schema-valid `deviceIdentity.deviceId` that contains secret-bearing metadata
- **THEN** the join audit detail MUST NOT include the raw `deviceId`
- **AND** the join audit detail includes bounded redaction metadata for that device id

#### Scenario: Forwarded recipient audit redacts secret-bearing recipient peer id
- **WHEN** the relay forwards a schema-valid peer message to a registered recipient whose peer id contains secret-bearing metadata
- **THEN** the accepted forward audit detail MUST NOT include the raw recipient peer id
- **AND** the peer message is still forwarded according to the existing room and targeting rules

#### Scenario: Safe identifiers remain inspectable
- **WHEN** relay audit identifiers are schema-valid, bounded, and contain no secret-bearing metadata
- **THEN** existing readable audit identifier fields remain available for operational correlation
