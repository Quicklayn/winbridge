## MODIFIED Requirements

### Requirement: Host visible-session indicator events
The host agent shell SHALL emit local secret-safe indicator events for visible host session state changes. Indicator events for active or paused visible authorizations SHALL include the current authorization expiration timestamp as bounded lifecycle metadata. Indicator events are local UI metadata only and MUST NOT authorize screen capture, input, clipboard access, file transfer, diagnostics, reconnect, hidden sessions, or consent bypass.

#### Scenario: Indicator activates after visible approval
- **WHEN** a host shell explicitly approves an authorization request and emits an active visible session state
- **THEN** it MUST emit a local indicator event with state `active`, the authorization id, authorization status `active`, `visibleToHost: true`, the granted permission count, and the authorization `expiresAt` timestamp
- **AND** the indicator event MUST NOT be emitted before explicit approval and visible activation

#### Scenario: Indicator is withheld without visible activation
- **WHEN** a host shell approves an authorization request but visible session state is false
- **THEN** it MUST NOT emit an active or paused indicator event

#### Scenario: Indicator follows pause, resume, and partial revocation
- **WHEN** a host shell has emitted an active indicator for a visible authorization
- **AND** the host workflow pauses, resumes, or revokes one permission while remaining non-terminal
- **THEN** it MUST emit a local indicator update that reflects the current active or paused state, current permission count, and same authorization expiration timestamp

#### Scenario: Indicator deactivates on terminal or disconnect lifecycle
- **WHEN** a host shell has emitted an active or paused indicator for a visible authorization
- **AND** the host workflow reaches final revocation, termination, expiration, local disconnect, runtime stop, local socket close, or trusted remote peer disconnect
- **THEN** it MUST emit a local indicator event with state `inactive`
- **AND** the inactive indicator event MUST NOT retain stale `expiresAt` metadata

#### Scenario: Indicator diagnostics are secret-safe
- **WHEN** the runtime emits or logs host indicator updates
- **THEN** indicator events and logs MAY include bounded lifecycle metadata such as authorization id, authorization status, expiration timestamp, indicator state, visible flag, permission count, and cause
- **AND** they MUST NOT expose raw protocol payloads, tokens, pairing codes, private reasons, display names, signal payloads, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, or input contents

### Requirement: Host status snapshot
The managed host agent shell runtime SHALL expose a read-only local host status snapshot derived from the current host authorization and indicator state. The snapshot MUST NOT send protocol messages, emit workflow audit events, grant permissions, change authorization lifecycle state, start signaling, reconnect peers, or invoke host controls. Status snapshots MUST be host-only and MUST expose only bounded lifecycle metadata: local indicator state, visible host-session flag, action-capable permission count, optional authorization id/status, optional authorization expiration timestamp while the authorization is active or paused, and optional local inactive indicator cause when the host indicator has been deactivated.

#### Scenario: Host status is inactive before visible authorization
- **WHEN** a host runtime has not emitted an active visible authorization state
- **THEN** the host status snapshot reports inactive local state, `visibleToHost: false`, and permission count `0`
- **AND** reading status does not send join, authorization, lifecycle, signal, or audit messages

#### Scenario: Host status reflects active visible authorization
- **WHEN** a host runtime has active visible authorization with a granted permission scope
- **THEN** the host status snapshot reports active local state, authorization status `active`, `visibleToHost: true`, the effective granted permission count, and the authorization `expiresAt` timestamp

#### Scenario: Host status reflects paused authorization
- **WHEN** a host runtime pauses an active visible authorization
- **THEN** the host status snapshot reports paused local state, authorization status `paused`, `visibleToHost: true`, the retained granted permission count, and the authorization `expiresAt` timestamp

#### Scenario: Host status reports terminal authorization as inactive
- **WHEN** a host runtime reaches a terminal authorization state such as revoked, terminated, or expired
- **THEN** the host status snapshot reports inactive local state, `visibleToHost: false`, permission count `0`, and a bounded local inactive cause
- **AND** it MUST NOT retain stale `expiresAt` metadata from the prior active or paused authorization

#### Scenario: Host status reflects inactive indicator after disconnect
- **WHEN** a host runtime deactivates its local indicator because of local disconnect, remote peer disconnect, socket close, or runtime stop
- **THEN** the host status snapshot reports inactive local state, `visibleToHost: false`, permission count `0`, and the bounded local inactive cause
- **AND** it MUST NOT expose peer ids, display names, private reasons, raw WebSocket close reason text, tokens, pairing codes, signal payloads, raw protocol data, screen contents, input contents, clipboard contents, file-transfer contents, diagnostics dumps, or stale `expiresAt` metadata
- **AND** reading status MUST NOT reconnect peers, grant permissions, start signaling, invoke host controls, emit workflow audit events, send protocol messages, or change authorization lifecycle state

#### Scenario: Host status is host-only
- **WHEN** caller code asks a viewer runtime for host status
- **THEN** the runtime rejects the request without sending protocol messages or changing local authorization state

### Requirement: Host control prompt status command
The interactive host control prompt SHALL support an exact read-only `status` command. The status command MUST call the managed runtime status snapshot and MUST NOT call pause, resume, revoke, terminate, disconnect, public send, or any direct protocol-construction path. Status output MUST remain secret-safe and MUST NOT echo raw command lines, permission names, peer ids, display names, private reasons, protocol payloads, tokens, pairing codes, signal payloads, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, input contents, or raw WebSocket close reason text.

#### Scenario: Host control prompt prints status
- **WHEN** host control prompt mode receives exact command `status`
- **THEN** it prints a bounded local host status line with indicator state, visible flag, permission count, optional authorization id/status, optional authorization expiration timestamp for active or paused authorization, and optional local inactive cause when the host indicator is inactive
- **AND** it does not invoke host lifecycle controls or public runtime sends

#### Scenario: Host control prompt rejects malformed status commands
- **WHEN** host control prompt mode receives whitespace-padded, case-varied, or suffixed status input
- **THEN** it rejects the command before reading runtime status or invoking any managed runtime control

#### Scenario: Host status command safety boundary
- **WHEN** host status command starts, succeeds, fails, or is rejected
- **THEN** it MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, hide the session from the host, reconnect peers, suppress host visibility, or bypass consent workflows

### Requirement: Viewer status snapshot
The managed viewer agent shell runtime SHALL expose a read-only local viewer status snapshot derived from the current viewer authorization state. The snapshot MUST NOT send protocol messages, emit workflow audit events, grant permissions, change authorization lifecycle state, start signaling, reconnect peers, or invoke host controls. Status snapshots MUST be viewer-only and MUST expose only bounded lifecycle metadata: local state, visible host-session flag, action-capable permission count, optional authorization id/status, optional authorization expiration timestamp while the authorization is active or paused, and optional relay-defined remote disconnect reason code after trusted remote host disconnect.

#### Scenario: Viewer status is inactive before authorization
- **WHEN** a viewer runtime has not received an authorization decision or visible active state
- **THEN** the viewer status snapshot reports inactive local state, `visibleToHost: false`, and permission count `0`
- **AND** reading status does not send join, authorization, lifecycle, signal, or audit messages

#### Scenario: Viewer status reflects active visible authorization
- **WHEN** a viewer runtime has active visible authorization with a granted permission scope
- **THEN** the viewer status snapshot reports active local state, authorization status `active`, `visibleToHost: true`, the effective granted permission count, and the authorization `expiresAt` timestamp

#### Scenario: Viewer status reflects paused authorization
- **WHEN** a viewer runtime receives a pause for an active visible authorization
- **THEN** the viewer status snapshot reports paused local state, authorization status `paused`, `visibleToHost: true`, the retained granted permission count, and the authorization `expiresAt` timestamp

#### Scenario: Viewer status reports invisible or terminal authorization as inactive
- **WHEN** a viewer runtime has only approved-but-invisible, denied, revoked, terminated, or expired authorization state
- **THEN** the viewer status snapshot reports inactive local state, `visibleToHost: false`, and permission count `0`
- **AND** it MUST NOT retain stale `expiresAt` metadata from any prior active or paused authorization

#### Scenario: Viewer status is viewer-only
- **WHEN** caller code asks a host runtime for viewer status
- **THEN** the runtime rejects the request without sending protocol messages or changing local authorization state

### Requirement: Host status CLI output
The host agent shell SHALL support an opt-in development status print that calls the managed runtime `getHostStatus()` snapshot after the configured delay. The scheduled status read MUST expose only bounded local lifecycle metadata: local indicator state, visible host-session flag, action-capable permission count, optional authorization id/status, optional authorization expiration timestamp for active or paused authorization, and optional local inactive indicator cause. The scheduled status read MUST NOT send protocol messages, emit workflow audit events, grant permissions, change authorization lifecycle state, start signaling, reconnect peers, invoke host controls, or expose screen, input, clipboard, file-transfer, diagnostics, token, pairing, credential, private-reason, display-name, peer-id, signal-payload, raw protocol data, or raw WebSocket close reason text. Ordinary host runtime startup and other explicit host workflow options remain governed by their existing requirements and are not introduced by the scheduled status read.

#### Scenario: Host status prints inactive status
- **WHEN** host status print mode fires before the host has emitted active visible authorization
- **THEN** it prints a bounded local host status line with inactive state, `visibleToHost=false`, and permission count `0`
- **AND** it MUST NOT invoke pause, resume, revoke, terminate, disconnect, viewer leave, public send, or any direct protocol-construction path

#### Scenario: Host status prints active status
- **WHEN** host status print mode fires after active visible authorization
- **THEN** it prints bounded active host status metadata with visible flag, permission count, optional authorization id, optional authorization status, and optional authorization expiration timestamp
- **AND** it MUST NOT print raw permission names, peer ids, display names, private reasons, tokens, pairing codes, signal payloads, raw protocol data, screen contents, input contents, clipboard contents, file-transfer contents, diagnostics dumps, or raw WebSocket close reason text

#### Scenario: Host status print failures are secret-safe
- **WHEN** host status print mode catches a runtime status failure
- **THEN** CLI diagnostics MUST include bounded metadata only
- **AND** diagnostics MUST NOT expose raw exception text, local file paths, tokens, pairing codes, credentials, private reasons, protocol payloads, screen contents, input contents, clipboard contents, file-transfer contents, diagnostics dumps, or full secrets

#### Scenario: Host status print safety boundary
- **WHEN** host status print mode is scheduled, fires, succeeds, fails, or is stopped
- **THEN** the scheduled status read MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, hide the session from the host, reconnect peers, suppress host visibility, or bypass consent workflows

### Requirement: Viewer status CLI output
The viewer agent shell SHALL support an opt-in development status print that calls the managed runtime `getViewerStatus()` snapshot after the configured delay. The status print MUST expose only bounded local lifecycle metadata: state, visible host-session flag, action-capable permission count, optional authorization id/status, optional authorization expiration timestamp for active or paused authorization, optional relay-defined remote disconnect reason code after trusted remote host disconnect, and optional local inactive cause after explicit viewer local leave or local viewer socket close. The status print MUST NOT send protocol messages, emit workflow audit events, grant permissions, change authorization lifecycle state, start signaling, reconnect peers, invoke host controls, or expose screen, input, clipboard, file-transfer, diagnostics, token, pairing, credential, private-reason, display-name, peer-id, signal-payload, raw protocol data, or raw WebSocket close reason text.

#### Scenario: Viewer status prints inactive status
- **WHEN** viewer status print mode fires before the viewer has observed active visible authorization
- **THEN** it prints inactive local status metadata with `visibleToHost: false` and permission count `0`
- **AND** it MUST NOT emit authorization, lifecycle, signal, control, or workflow audit messages because of the status read

#### Scenario: Viewer status prints active status
- **WHEN** viewer status print mode fires after the viewer has observed active visible authorization
- **THEN** it prints active local status metadata with `visibleToHost: true`, the action-capable permission count, optional authorization id/status, and optional authorization expiration timestamp

#### Scenario: Viewer status prints trusted disconnect reason code
- **WHEN** viewer status print mode fires after the viewer has recorded trusted remote host disconnect state
- **THEN** it prints inactive local status metadata with `visibleToHost: false`, permission count `0`, optional authorization id/status, and the bounded relay-defined remote disconnect reason code
- **AND** it MUST NOT print peer ids, display names, private reasons, signal payloads, tokens, pairing codes, raw protocol data, raw WebSocket close reason text, or stale `expiresAt` metadata

#### Scenario: Viewer status prints local inactive cause
- **WHEN** viewer status print mode fires after the viewer has explicitly left locally or after the local viewer socket has closed
- **THEN** it prints inactive local status metadata with `visibleToHost: false`, permission count `0`, and the bounded local inactive cause
- **AND** it MUST NOT print authorization id/status from the left or closed local connection scope, remote disconnect reason codes, peer ids, display names, private reasons, signal payloads, tokens, pairing codes, raw protocol data, raw WebSocket close reason text, or stale `expiresAt` metadata

#### Scenario: Viewer status print safety boundary
- **WHEN** viewer status print mode is configured, starts, fires, fails, or is skipped
- **THEN** it MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, hide the session from the host, reconnect peers, suppress host visibility, invoke host controls, or bypass consent workflows
