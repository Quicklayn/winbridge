## ADDED Requirements

### Requirement: Immutable agent status snapshots
The managed agent shell runtime SHALL return immutable host and viewer status snapshot objects from status APIs. Immutability MUST prevent callers from changing local state, host visibility, permission count, authorization metadata, inactive cause metadata, disconnect reason metadata, or signal acknowledgement metadata in place after the snapshot is returned. Immutable status snapshots MUST NOT send protocol messages, emit workflow audit events, grant permissions, change authorization lifecycle state, start signaling, reconnect peers, invoke host controls, start capture, send input, or bypass consent workflows.

#### Scenario: Host status snapshot cannot be mutated
- **WHEN** caller code reads a host runtime status snapshot
- **THEN** the returned snapshot object is immutable
- **AND** attempts to change `state`, `visibleToHost`, `permissionCount`, authorization metadata, inactive cause metadata, or remote disconnect reason metadata MUST NOT mutate the returned snapshot or trusted runtime state

#### Scenario: Viewer status snapshot cannot be mutated
- **WHEN** caller code reads a viewer runtime status snapshot
- **THEN** the returned snapshot object is immutable
- **AND** attempts to change `state`, `visibleToHost`, `permissionCount`, authorization metadata, remote disconnect reason metadata, local inactive cause metadata, or signal acknowledgement metadata MUST NOT mutate the returned snapshot or trusted runtime state
