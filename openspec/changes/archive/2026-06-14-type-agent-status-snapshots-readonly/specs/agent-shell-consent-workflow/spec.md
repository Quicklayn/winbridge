## ADDED Requirements

### Requirement: Agent status snapshot types are read-only
The managed agent shell runtime SHALL expose host and viewer status snapshot TypeScript types as read-only local metadata snapshots. Compile-time read-only status fields MUST match the runtime immutable snapshot contract and MUST NOT change the serialized status shape, protocol behavior, authorization lifecycle behavior, host visibility behavior, permission counts, disconnect metadata, or signal acknowledgement metadata.

#### Scenario: Host status type prevents direct mutation
- **WHEN** TypeScript code receives a host status snapshot from the managed runtime
- **THEN** the host status snapshot type marks snapshot fields as read-only
- **AND** the type-level read-only contract MUST NOT send protocol messages, emit workflow audit events, grant permissions, reconnect peers, invoke host controls, start capture, send input, or bypass consent workflows

#### Scenario: Viewer status type prevents direct mutation
- **WHEN** TypeScript code receives a viewer status snapshot from the managed runtime
- **THEN** the viewer status snapshot type marks snapshot fields as read-only
- **AND** the type-level read-only contract MUST NOT send protocol messages, emit workflow audit events, grant permissions, start signaling, reconnect peers, invoke host controls, start capture, send input, or bypass consent workflows

#### Scenario: Status type shape remains compatible
- **WHEN** status snapshots are returned, compared in tests, or serialized by existing callers
- **THEN** the status field names, optional fields, and values remain unchanged
- **AND** readonly typing MUST NOT add wrapper metadata, expose raw private data, or change CLI status output semantics
