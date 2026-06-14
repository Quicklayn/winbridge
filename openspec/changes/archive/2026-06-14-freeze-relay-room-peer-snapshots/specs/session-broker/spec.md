## ADDED Requirements

### Requirement: Immutable relay room peer snapshots
The relay room registry SHALL treat registered peer records and returned room membership collections as immutable snapshots after a peer is accepted into a brokered session. Immutability MUST include peer id, role, session id, device id, and send/close callback references, and MUST prevent callers from changing trusted routing identity or replacing send paths in place after registration.

#### Scenario: Join result cannot mutate registered peer routing
- **WHEN** a host or viewer joins a relay room and receives a join result
- **THEN** the returned peer records and peer collection are immutable
- **AND** callers cannot change peer id, role, session id, device id, send callback, or close callback in place

#### Scenario: Peer lookup cannot mutate room membership
- **WHEN** caller code reads room membership through the registry lookup API
- **THEN** the returned peer collection is immutable
- **AND** attempts to mutate the returned collection or peer records MUST NOT change registered room membership, routing identity, or send-path behavior

#### Scenario: Leave result cannot mutate cleanup records
- **WHEN** a peer leaves a room and the registry returns remaining or removed peers
- **THEN** those returned peer collections and peer records are immutable
- **AND** attempts to mutate them MUST NOT re-register stale peers, replace callbacks, preserve stale authorization, grant permissions, start capture, send input, reconnect peers, or bypass consent workflows
