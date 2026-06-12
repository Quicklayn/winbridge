## ADDED Requirements

### Requirement: Canonical close reason byte metadata
The agent shell SHALL calculate redacted WebSocket close event and disconnect log `reasonBytes` metadata as the actual UTF-8 byte length of the close reason, while continuing to redact the raw close reason text.

#### Scenario: Multi-byte close reason metadata is accurate
- **WHEN** the managed runtime receives a WebSocket close reason containing multi-byte text
- **THEN** the local `closed` event `reasonBytes` equals the UTF-8 byte length of the close reason
- **AND** the local disconnect log includes that byte length only as summary metadata
- **AND** neither the event nor the log exposes the raw close reason text

#### Scenario: Close reason metadata does not grant access
- **WHEN** the managed runtime emits close reason byte metadata
- **THEN** that metadata MUST NOT approve authorization, activate a visible session, grant permissions, start capture, send input, reconnect the peer, suppress host visibility, or bypass consent workflows
