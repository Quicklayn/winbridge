## ADDED Requirements

### Requirement: Canonical raw inbound byte metadata
The agent shell SHALL calculate non-protocol and ignored unsafe inbound message `byteLength` metadata from the actual WebSocket payload bytes before text conversion, while continuing to redact raw payload contents from local events and logs.

#### Scenario: Binary non-protocol byte length is accurate
- **WHEN** the managed runtime receives a binary or invalid UTF-8 WebSocket message that cannot be decoded as a protocol envelope
- **THEN** the local `raw` event `byteLength` equals the original WebSocket payload byte length
- **AND** the local log includes that byte length only as summary metadata
- **AND** neither the event nor the log exposes the raw payload contents

#### Scenario: Ignored unsafe inbound byte metadata does not grant access
- **WHEN** the managed runtime emits byte metadata for an ignored unsafe inbound message
- **THEN** that metadata MUST NOT approve authorization, activate a visible session, grant permissions, start capture, send input, reconnect the peer, suppress host visibility, or bypass consent workflows
