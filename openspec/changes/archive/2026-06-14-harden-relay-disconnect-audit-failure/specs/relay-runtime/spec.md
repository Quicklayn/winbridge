## ADDED Requirements

### Requirement: Disconnect audit failure does not weaken cleanup
The relay runtime SHALL treat `relay.peer.disconnect` audit persistence as post-cleanup observability after a registered peer transport closes. If writing the disconnect audit record fails after disconnect cleanup has begun, the relay MUST NOT undo room cleanup, retain stale pairing membership, withhold already-applicable `peer-disconnected` notices, skip orphaned peer closure, emit peer-facing raw diagnostics, or throw raw audit sink errors from the close path. Diagnostics for the failed disconnect audit MUST remain bounded and MUST NOT expose raw audit sink error text, raw logger error text, raw close reasons, pairing codes, tokens, protocol payloads, display names, private reasons, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets.

#### Scenario: Host disconnect cleanup survives disconnect audit failure
- **WHEN** a registered host disconnects from a paired relay session
- **AND** the relay sends the bounded `peer-disconnected` notice, removes the stale viewer from room membership, and closes the orphaned viewer
- **AND** writing the post-cleanup `relay.peer.disconnect` audit record fails
- **THEN** the viewer still receives the bounded host disconnect notice and is closed as an orphaned peer
- **AND** a replacement host can join the session without reusing stale viewer membership
- **AND** diagnostics about the audit failure remain bounded and secret-safe

#### Scenario: Viewer disconnect cleanup survives disconnect audit failure
- **WHEN** a registered viewer disconnects from a paired relay session
- **AND** the relay sends the bounded `peer-disconnected` notice to the host
- **AND** writing the post-cleanup `relay.peer.disconnect` audit record fails
- **THEN** the host still receives the bounded viewer disconnect notice
- **AND** diagnostics about the audit failure remain bounded and secret-safe

#### Scenario: Disconnect audit warning failure is contained
- **WHEN** writing the post-cleanup `relay.peer.disconnect` audit record fails
- **AND** the diagnostic logger also fails while reporting the bounded warning
- **THEN** the relay MUST NOT let the logger failure escape the close path
- **AND** the cleanup result MUST NOT expose raw audit sink error text, raw logger error text, pairing codes, tokens, protocol payloads, close reasons, credentials, remote content, or full secrets
- **AND** the logger failure MUST NOT grant permissions, start capture, send input, reconnect peers, suppress host visibility, hide the session from the host, or bypass consent workflows
