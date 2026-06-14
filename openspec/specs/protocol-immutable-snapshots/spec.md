# protocol-immutable-snapshots Specification

## Purpose
Defines shared immutable snapshot constraints for validated protocol objects that must resist caller mutation after parsing or factory creation.

## Requirements
### Requirement: Shared immutable protocol snapshot helper
The protocol package SHALL use a shared recursive immutable snapshot helper when returning validated trusted protocol objects that must resist caller mutation. Protected snapshots MUST include audit records, session authorization records, device identity records, pairing tickets, paired-device records, protocol envelopes, and consent-bound session grants. The shared helper MUST preserve existing output shapes and MUST NOT change validation, redaction, authorization, pairing, or protocol encoding behavior.

#### Scenario: Representative protocol snapshots are immutable
- **WHEN** a component creates or parses a protected protocol snapshot successfully
- **THEN** the returned top-level object and nested arrays or plain object metadata remain immutable according to existing field-specific requirements

#### Scenario: Output shape remains stable
- **WHEN** a protected immutable protocol snapshot is serialized or encoded through existing JSON-compatible helpers
- **THEN** the emitted data shape remains the same validated and redacted protocol data

#### Scenario: Shared immutability remains non-authorizing
- **WHEN** the shared immutable snapshot helper freezes validated protocol data
- **THEN** immutability MUST NOT approve a session, activate host visibility, grant permissions, start capture, send input, reconnect peers, suppress host visibility, sync clipboard, transfer files, expose diagnostics, install services, configure startup persistence, collect credentials, hide the session from the host, or bypass consent workflows

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
