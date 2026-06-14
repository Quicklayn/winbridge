## MODIFIED Requirements

### Requirement: Host status snapshot
The managed host agent shell runtime SHALL expose a read-only local host status snapshot derived from the current host authorization and indicator state. The snapshot MUST NOT send protocol messages, emit workflow audit events, grant permissions, change authorization lifecycle state, start signaling, reconnect peers, or invoke host controls. Status snapshots MUST be host-only and MUST expose only bounded lifecycle metadata: local indicator state, visible host-session flag, action-capable permission count, optional authorization id/status, optional authorization expiration timestamp while the authorization is active or paused, optional local inactive indicator cause when the host indicator has been deactivated, and optional relay-defined remote disconnect reason code when the host indicator has been deactivated by a trusted remote viewer disconnect.

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
- **AND** it MUST NOT retain stale `expiresAt` or remote disconnect reason metadata from the prior active or paused authorization

#### Scenario: Host status reflects inactive indicator after disconnect
- **WHEN** a host runtime deactivates its local indicator because of local disconnect, remote peer disconnect, socket close, or runtime stop
- **THEN** the host status snapshot reports inactive local state, `visibleToHost: false`, permission count `0`, and the bounded local inactive cause
- **AND** when the cause is a trusted remote peer disconnect, it MAY include the bounded relay-defined remote disconnect reason code
- **AND** when the cause is not a trusted remote peer disconnect, it MUST NOT retain stale remote disconnect reason metadata
- **AND** it MUST NOT expose peer ids, display names, private reasons, raw WebSocket close reason text, tokens, pairing codes, signal payloads, raw protocol data, screen contents, input contents, clipboard contents, file-transfer contents, diagnostics dumps, or stale `expiresAt` metadata
- **AND** reading status MUST NOT reconnect peers, grant permissions, start signaling, invoke host controls, emit workflow audit events, send protocol messages, or change authorization lifecycle state

#### Scenario: Host status is host-only
- **WHEN** caller code asks a viewer runtime for host status
- **THEN** the runtime rejects the request without sending protocol messages or changing local authorization state

### Requirement: Host control prompt status command
The interactive host control prompt SHALL support an exact read-only `status` command. The status command MUST call the managed runtime status snapshot and MUST NOT call pause, resume, revoke, terminate, disconnect, public send, or any direct protocol-construction path. Status output MUST remain secret-safe and MUST NOT echo raw command lines, permission names, peer ids, display names, private reasons, protocol payloads, tokens, pairing codes, signal payloads, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, input contents, or raw WebSocket close reason text.

#### Scenario: Host control prompt prints status
- **WHEN** host control prompt mode receives exact command `status`
- **THEN** it prints a bounded local host status line with indicator state, visible flag, permission count, optional authorization id/status, optional authorization expiration timestamp for active or paused authorization, optional local inactive cause when the host indicator is inactive, and optional relay-defined remote disconnect reason code after trusted remote viewer disconnect
- **AND** it does not invoke host lifecycle controls or public runtime sends

#### Scenario: Host control prompt rejects malformed status commands
- **WHEN** host control prompt mode receives whitespace-padded, case-varied, or suffixed status input
- **THEN** it rejects the command before reading runtime status or invoking any managed runtime control

#### Scenario: Host status command safety boundary
- **WHEN** host status command starts, succeeds, fails, or is rejected
- **THEN** it MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, hide the session from the host, reconnect peers, suppress host visibility, or bypass consent workflows

### Requirement: Host status CLI output
The host agent shell SHALL support an opt-in development status print that calls the managed runtime `getHostStatus()` snapshot after the configured delay. The scheduled status read MUST expose only bounded local lifecycle metadata: local indicator state, visible host-session flag, action-capable permission count, optional authorization id/status, optional authorization expiration timestamp for active or paused authorization, optional local inactive indicator cause, and optional relay-defined remote disconnect reason code after trusted remote viewer disconnect. The scheduled status read MUST NOT send protocol messages, emit workflow audit events, grant permissions, change authorization lifecycle state, start signaling, reconnect peers, invoke host controls, or expose screen, input, clipboard, file-transfer, diagnostics, token, pairing, credential, private-reason, display-name, peer-id, signal-payload, raw protocol data, or raw WebSocket close reason text. Ordinary host runtime startup and other explicit host workflow options remain governed by their existing requirements and are not introduced by the scheduled status read.

#### Scenario: Host status prints inactive status
- **WHEN** host status print mode fires before the host has emitted active visible authorization
- **THEN** it prints a bounded local host status line with inactive state, `visibleToHost=false`, and permission count `0`
- **AND** it MUST NOT invoke pause, resume, revoke, terminate, disconnect, viewer leave, public send, or any direct protocol-construction path

#### Scenario: Host status prints active status
- **WHEN** host status print mode fires after active visible authorization
- **THEN** it prints bounded active host status metadata with visible flag, permission count, optional authorization id, optional authorization status, and optional authorization expiration timestamp
- **AND** it MUST NOT print raw permission names, peer ids, display names, private reasons, tokens, pairing codes, signal payloads, raw protocol data, screen contents, input contents, clipboard contents, file-transfer contents, diagnostics dumps, or raw WebSocket close reason text

#### Scenario: Host status prints remote disconnect reason code
- **WHEN** host status print mode fires after the host has recorded trusted remote viewer disconnect state
- **THEN** it prints bounded inactive host status metadata with `visibleToHost=false`, permission count `0`, local inactive cause `peer-disconnected`, and the relay-defined remote disconnect reason code
- **AND** it MUST NOT print peer ids, display names, private reasons, raw WebSocket close reason text, tokens, pairing codes, protocol payloads, screen contents, input contents, clipboard contents, file-transfer contents, diagnostics dumps, or stale `expiresAt` metadata

#### Scenario: Host status print failures are secret-safe
- **WHEN** host status print mode catches a runtime status failure
- **THEN** CLI diagnostics MUST include bounded metadata only
- **AND** diagnostics MUST NOT expose raw exception text, local file paths, tokens, pairing codes, credentials, private reasons, protocol payloads, screen contents, input contents, clipboard contents, file-transfer contents, diagnostics dumps, or full secrets

#### Scenario: Host status print safety boundary
- **WHEN** host status print mode is scheduled, fires, succeeds, fails, or is stopped
- **THEN** the scheduled status read MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, hide the session from the host, reconnect peers, suppress host visibility, or bypass consent workflows
