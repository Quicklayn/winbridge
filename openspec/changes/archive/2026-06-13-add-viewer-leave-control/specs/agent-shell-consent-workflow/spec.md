## ADDED Requirements

### Requirement: Managed viewer local leave control
The managed agent shell runtime SHALL expose an explicit viewer-only local leave operation. The leave operation MUST close only the local viewer relay connection, clear connection-scoped local viewer authorization state, and MUST NOT require requested permissions or active authorization. It MUST NOT invoke host lifecycle controls, construct or send `peer-disconnected`, emit workflow audit events, grant permissions, start signaling, change host authorization lifecycle state, reconnect peers, or expose screen, input, clipboard, file-transfer, diagnostics, token, pairing, credential, private-reason, display-name, signal-payload, or raw protocol data.

#### Scenario: Viewer leave closes local transport
- **WHEN** a viewer runtime invokes local leave while connected
- **THEN** the viewer runtime closes its local relay connection
- **AND** it MUST NOT emit authorization, lifecycle, signal, control, `peer-disconnected`, or workflow audit messages because of the local leave

#### Scenario: Viewer status after local leave is inactive
- **WHEN** a viewer runtime has active visible authorization
- **AND** local leave closes the viewer connection
- **THEN** the viewer status snapshot reports inactive local state, `visibleToHost: false`, and permission count `0`
- **AND** reading status after leave MUST NOT send protocol messages, emit workflow audit events, grant permissions, start signaling, invoke host controls, reconnect peers, or change authorization lifecycle state

#### Scenario: Viewer leave is viewer-only
- **WHEN** a host runtime invokes local leave
- **THEN** the runtime rejects the request without closing the host transport, sending protocol messages, changing host authorization state, deactivating the host indicator, or writing audit records

#### Scenario: Viewer CLI helpers use local leave
- **WHEN** scheduled viewer local disconnect or viewer control prompt `disconnect` fires
- **THEN** it invokes the managed viewer local leave operation
- **AND** the same viewer-only and no-forged-message safety boundary applies
