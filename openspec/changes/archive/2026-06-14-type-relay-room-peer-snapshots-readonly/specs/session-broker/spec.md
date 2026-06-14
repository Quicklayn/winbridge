## ADDED Requirements

### Requirement: Relay room peer snapshot types are read-only
The relay room registry SHALL expose registered peer records and returned room membership collections as read-only TypeScript snapshots. Compile-time read-only peer fields and peer collections MUST match the runtime immutable relay room snapshot contract and MUST NOT change the serialized shape, room membership behavior, pairing behavior, routing behavior, send callback behavior, close callback behavior, disconnect behavior, authorization behavior, audit behavior, or protocol forwarding behavior.

#### Scenario: Relay peer type prevents direct mutation
- **WHEN** TypeScript code receives a registered relay peer record from join, leave, or lookup APIs
- **THEN** the peer record type marks routing identity fields and callback references as read-only
- **AND** the type-level read-only contract MUST NOT send protocol messages, replace callback references, register peers, remove peers, grant permissions, start capture, send input, reconnect peers, or bypass consent workflows

#### Scenario: Relay peer collection types prevent direct mutation
- **WHEN** TypeScript code receives join, leave, or lookup peer collections from the room registry
- **THEN** the peer collection types are read-only arrays
- **AND** the type-level read-only contract MUST NOT add peers, remove peers, reorder trusted routing snapshots, close sockets, send protocol messages, grant permissions, start capture, send input, reconnect peers, or bypass consent workflows

#### Scenario: Relay room snapshot shape remains compatible
- **WHEN** relay room snapshots are returned, compared in tests, or consumed by server routing code
- **THEN** the peer field names, callback references, collection contents, and result object field names remain unchanged
- **AND** readonly typing MUST NOT add wrapper metadata, expose pairing codes, expose raw protocol payloads, or change relay forwarding semantics
