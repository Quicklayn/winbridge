## ADDED Requirements

### Requirement: Viewer local leave close diagnostics are best-effort
The managed viewer agent shell runtime SHALL treat diagnostics emitted from the local WebSocket close event during viewer local leave as best-effort cleanup observability. If the close event callback or disconnected logger fails, the viewer local leave operation MUST still close only the local viewer relay connection, clear connection-scoped local viewer authorization state, and record bounded inactive viewer status. Diagnostic callback or logger failure MUST NOT send authorization, lifecycle, signal, control, `peer-disconnected`, or workflow `audit-event` messages; grant permissions; start signaling; invoke host controls; reconnect peers; suppress host visibility; expose screen, input, clipboard, file-transfer, diagnostics, token, pairing, credential, private-reason, display-name, signal-payload, raw protocol data, or raw WebSocket close reason text.

#### Scenario: Viewer leave survives close diagnostic callback failure
- **WHEN** a viewer runtime invokes local leave while connected
- **AND** the local WebSocket close event callback fails while reporting bounded close metadata
- **THEN** the leave operation still resolves after closing the local viewer relay connection
- **AND** the viewer status snapshot reports inactive local state, `visibleToHost: false`, permission count `0`, and bounded local inactive cause `local-leave`
- **AND** the viewer runtime MUST NOT send authorization, lifecycle, signal, control, `peer-disconnected`, or workflow audit messages because of the diagnostic failure

#### Scenario: Viewer leave survives close diagnostic logger failure
- **WHEN** a viewer runtime invokes local leave while connected
- **AND** the disconnected logger fails while logging bounded close metadata
- **THEN** the leave operation still resolves after closing the local viewer relay connection
- **AND** the viewer status snapshot reports inactive local state, `visibleToHost: false`, permission count `0`, and bounded local inactive cause `local-leave`
- **AND** the viewer runtime MUST NOT grant permissions, start signaling, invoke host controls, reconnect peers, hide the session from the host, or bypass consent workflows
