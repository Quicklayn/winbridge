## ADDED Requirements

### Requirement: Host status snapshot
The managed host agent shell runtime SHALL expose a read-only local host status snapshot derived from the current host authorization and indicator state. The snapshot MUST NOT send protocol messages, emit workflow audit events, grant permissions, change authorization lifecycle state, start signaling, or invoke host controls. Status snapshots MUST be host-only and MUST expose only bounded lifecycle metadata: local indicator state, visible host-session flag, action-capable permission count, and optional authorization id/status.

#### Scenario: Host status is inactive before visible authorization
- **WHEN** a host runtime has not emitted an active visible authorization state
- **THEN** the host status snapshot reports inactive local state, `visibleToHost: false`, and permission count `0`
- **AND** reading status does not send join, authorization, lifecycle, signal, or audit messages

#### Scenario: Host status reflects active visible authorization
- **WHEN** a host runtime has active visible authorization with a granted permission scope
- **THEN** the host status snapshot reports active local state, authorization status `active`, `visibleToHost: true`, and the effective granted permission count

#### Scenario: Host status reflects paused authorization
- **WHEN** a host runtime pauses an active visible authorization
- **THEN** the host status snapshot reports paused local state, authorization status `paused`, `visibleToHost: true`, and the retained granted permission count

#### Scenario: Host status reports terminal authorization as inactive
- **WHEN** a host runtime reaches a terminal authorization state such as revoked, terminated, or expired
- **THEN** the host status snapshot reports inactive local state, `visibleToHost: false`, and permission count `0`

#### Scenario: Host status is host-only
- **WHEN** caller code asks a viewer runtime for host status
- **THEN** the runtime rejects the request without sending protocol messages or changing local authorization state

### Requirement: Host control prompt status command
The interactive host control prompt SHALL support an exact read-only `status` command. The status command MUST call the managed runtime status snapshot and MUST NOT call pause, resume, revoke, terminate, disconnect, public send, or any direct protocol-construction path. Status output MUST remain secret-safe and MUST NOT echo raw command lines, permission names, peer ids, display names, private reasons, protocol payloads, tokens, pairing codes, signal payloads, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, or input contents.

#### Scenario: Host control prompt prints status
- **WHEN** host control prompt mode receives exact command `status`
- **THEN** it prints a bounded local host status line with indicator state, visible flag, permission count, and optional authorization id/status
- **AND** it does not invoke host lifecycle controls or public runtime sends

#### Scenario: Host control prompt rejects malformed status commands
- **WHEN** host control prompt mode receives whitespace-padded, case-varied, or suffixed status input
- **THEN** it rejects the command before reading runtime status or invoking any managed runtime control

#### Scenario: Host status command safety boundary
- **WHEN** host status command starts, succeeds, fails, or is rejected
- **THEN** it MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, hide the session from the host, reconnect peers, suppress host visibility, or bypass consent workflows
