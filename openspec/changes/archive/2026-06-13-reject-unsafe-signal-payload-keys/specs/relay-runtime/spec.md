## MODIFIED Requirements

### Requirement: Testable bounded relay rejection reasons
The relay runtime SHALL expose integration-test coverage proving malformed peer messages receive bounded secret-safe relay error and audit reasons, including authorization-related protocol messages whose `reason` fields, protocol `audit-event` action metadata, protocol `audit-event.detail` property names, protocol `hello` capability metadata, or protocol `signal.payload` property names contain ASCII control characters or Unicode bidirectional or zero-width formatting controls including `U+FEFF`.

#### Scenario: Runtime rejects malformed protocol with bounded reason
- **WHEN** integration tests send malformed protocol input to a registered peer connection
- **THEN** the sender receives a bounded relay error reason and the remaining peer receives no forwarded protocol message

#### Scenario: Runtime audit omits malformed payload details
- **WHEN** the relay audits the malformed protocol rejection
- **THEN** the audit reason and detail do not contain the raw malformed message contents

#### Scenario: Runtime rejects malformed signal payload key before forwarding
- **WHEN** integration tests send a registered protocol `signal` message with a malformed payload property name
- **THEN** the sender receives a bounded relay error reason and the remaining peer receives no forwarded signal message
- **AND** relay audit records and peer-facing diagnostics MUST NOT expose the raw malformed signal payload property name or value
