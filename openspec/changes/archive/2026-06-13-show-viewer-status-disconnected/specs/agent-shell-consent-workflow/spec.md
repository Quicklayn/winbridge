## ADDED Requirements

### Requirement: Viewer status reflects trusted remote disconnect
The managed viewer agent shell runtime SHALL report inactive local viewer status after it records trusted remote host disconnect state. The status snapshot MUST keep optional bounded authorization id/status metadata when available, but MUST report `visibleToHost: false` and permission count `0`. Reading status after disconnect MUST NOT send protocol messages, emit workflow audit events, grant permissions, start signaling, invoke host controls, reconnect peers, or change authorization lifecycle state.

#### Scenario: Viewer status is inactive after host disconnect
- **WHEN** a viewer runtime has active visible authorization
- **AND** it records a trusted relay-originated `peer-disconnected` notice for the observed host
- **THEN** the viewer status snapshot reports inactive local state, `visibleToHost: false`, and permission count `0`
- **AND** it preserves optional authorization id/status metadata from the last local viewer authorization

#### Scenario: Viewer status read after disconnect remains local
- **WHEN** a viewer runtime reads status after recording trusted host disconnect state
- **THEN** it MUST NOT emit authorization, lifecycle, signal, control, `peer-disconnected`, or workflow audit messages because of the status read
