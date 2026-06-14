## ADDED Requirements

### Requirement: Hello may carry bounded device identity
The protocol SHALL allow a `hello` message to include optional schema-validated local `deviceIdentity` metadata for the sending peer. When present, `hello.deviceIdentity` MUST use the shared device identity validation boundary, and `hello.deviceIdentity.displayName` MUST match the top-level `hello.displayName`. This metadata MUST remain non-authorizing and MUST NOT grant permissions, approve authorization, activate host visibility, start signaling, start capture, send input, reconnect peers, invoke controls, or bypass consent workflows.

#### Scenario: Hello includes matching device identity
- **WHEN** a peer sends a `hello` message with schema-valid `deviceIdentity` whose `displayName` matches the top-level `displayName`
- **THEN** protocol parsing accepts the message as peer metadata

#### Scenario: Hello omits device identity
- **WHEN** a peer sends a schema-valid `hello` message without `deviceIdentity`
- **THEN** protocol parsing accepts the message for backward-compatible peer metadata

#### Scenario: Hello device identity display name conflicts
- **WHEN** a peer sends a `hello` message whose top-level `displayName` differs from `deviceIdentity.displayName`
- **THEN** protocol parsing rejects the message before forwarding, trusted local protocol events, host consent prompt rendering, authorization decisions, workflow audit records, signaling, capture, input, reconnect, or host control invocation

#### Scenario: Hello device identity is unsafe
- **WHEN** a peer sends a `hello` message with malformed, unknown-field, untrimmed, control-character, Unicode formatting-control, or secret-bearing `deviceIdentity` metadata
- **THEN** protocol parsing rejects the message before treating it as trusted peer metadata
- **AND** rejection diagnostics MUST NOT expose raw unsafe display names, raw unsafe device ids, pairing codes, tokens, credentials, protocol payloads, screen contents, input contents, clipboard contents, file-transfer contents, diagnostics dumps, or full secrets
