## ADDED Requirements

### Requirement: Shared immutable helper handles repeated and cyclic references
The protocol package SHALL make the shared immutable snapshot helper safe for repeated object references and local cyclic object graphs. The helper MUST freeze each reachable object at most once during a traversal, preserve existing object identity and output shape, and MUST NOT change validation, redaction, authorization, pairing, relay routing, protocol encoding, audit behavior, or sensitive action authorization behavior.

#### Scenario: Repeated references freeze once and remain shared
- **WHEN** local code passes an object graph with repeated nested object references to the shared immutable snapshot helper
- **THEN** the helper freezes the repeated object without changing reference identity
- **AND** the helper MUST NOT clone, drop, authorize, redact, route, emit, or otherwise transform protocol data

#### Scenario: Cyclic references do not recurse indefinitely
- **WHEN** local code passes a cyclic object graph to the shared immutable snapshot helper
- **THEN** the helper returns the original graph with reachable objects frozen
- **AND** cycle handling MUST NOT approve a session, activate host visibility, grant permissions, start capture, send input, reconnect peers, suppress audit evidence, or bypass consent workflows
