## ADDED Requirements

### Requirement: Relay join-denial audit attribution
The relay runtime SHALL include secret-safe attempted session and peer attribution in `relay.peer.join.denied` audit records when a decoded `join-session` attempt is rejected before registration. Direct attempted `sessionId` or peer-attributed actor id values MUST NOT be recorded when the attempted identifier contains the submitted pairing code; such identifiers MUST be omitted from direct top-level attribution and represented only by bounded redaction metadata. Join-denial audit attribution MUST NOT include raw pairing codes, shared tokens, credentials, protocol payloads, display names, private reasons, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets. Malformed or non-join messages without validated join identity MAY remain attributed only to the relay actor.

#### Scenario: Viewer join is denied before host pairing ticket exists
- **WHEN** a viewer sends a decoded `join-session` before a host has created the relay pairing ticket
- **THEN** the relay rejects the join before registration or forwarding
- **AND** the `relay.peer.join.denied` audit record MUST include the attempted session id and a peer-attributed relay actor for the attempted viewer peer id
- **AND** the audit record MUST include safe pairing denial metadata without raw pairing material

#### Scenario: Duplicate peer join is denied before replacement
- **WHEN** a decoded `join-session` attempts to reuse an already connected peer id
- **THEN** the relay rejects the duplicate join before replacing the registered peer or mutating pairing-ticket state
- **AND** the `relay.peer.join.denied` audit record MUST include the attempted session id and a peer-attributed relay actor for the attempted peer id
- **AND** the audit record MUST include bounded duplicate-peer metadata without raw pairing material

#### Scenario: Join-denial attribution remains secret-safe
- **WHEN** the relay writes a join-denial audit record for a decoded `join-session`
- **THEN** audit actor, session, reason, and pairing classification MAY be recorded as bounded metadata
- **AND** audit records MUST NOT expose raw pairing codes, shared tokens, credentials, raw protocol payloads, display names, private reasons, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets

#### Scenario: Pairing-code-bearing attempted identifiers are redacted
- **WHEN** a decoded denied `join-session` attempt uses the submitted pairing code inside the attempted session id or peer id
- **THEN** the `relay.peer.join.denied` audit record MUST NOT include that raw attempted identifier in top-level `sessionId`, actor id, or detail metadata
- **AND** the audit record MAY include bounded redaction metadata without identifier content
- **AND** the raw submitted pairing code MUST NOT appear anywhere in the audit record
