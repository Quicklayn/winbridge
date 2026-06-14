## MODIFIED Requirements

### Requirement: Host status snapshot
The managed host agent shell runtime SHALL expose a read-only local host status snapshot derived from the current host authorization, indicator state, and authorization-bound trusted viewer device metadata when available. The snapshot MUST NOT send protocol messages, emit workflow audit events, grant permissions, change authorization lifecycle state, start signaling, reconnect peers, or invoke host controls. Status snapshots MUST be host-only and MUST expose only bounded lifecycle metadata: local indicator state, visible host-session flag, action-capable permission count, optional authorization id/status, optional authorization expiration timestamp while the authorization is active or paused, optional viewer device id/platform bound at approval time for the current viewer authorization scope, optional local inactive indicator cause when the host indicator has been deactivated, and optional relay-defined remote disconnect reason code when the host indicator has been deactivated by a trusted remote viewer disconnect. Host status snapshots MUST NOT expose viewer display names, viewer peer ids, remote self-asserted trust-level metadata, raw protocol payloads, private reasons, signal payloads, tokens, pairing codes, credentials, screen contents, input contents, clipboard contents, file-transfer contents, diagnostics dumps, or full secrets.

#### Scenario: No host authorization is inactive
- **WHEN** caller code asks a host runtime for host status before authorization
- **THEN** the host status snapshot reports inactive local state, `visibleToHost: false`, and permission count `0`
- **AND** it omits viewer device id/platform metadata

#### Scenario: Active visible authorization includes authorization-bound viewer device context
- **WHEN** caller code asks a host runtime for host status after active visible authorization
- **AND** the host observed a trusted viewer `hello` with schema-valid device identity for that authorization requester before approving the current authorization
- **THEN** the host status snapshot reports active local state, authorization status `active`, `visibleToHost: true`, the effective granted permission count, the authorization `expiresAt` timestamp, and the authorization-bound viewer device id/platform
- **AND** it MUST NOT include viewer display name, viewer peer id, or remote self-asserted trust-level metadata

#### Scenario: Active visible authorization keeps device context bound
- **WHEN** caller code asks a host runtime for host status after active visible authorization
- **AND** the same viewer peer has sent a later valid `hello` with different schema-valid device identity metadata
- **THEN** the host status snapshot keeps the viewer device id/platform that was bound when the current authorization was approved
- **AND** it MUST NOT rewrite active status device metadata from the later `hello`

#### Scenario: Active visible authorization omits unavailable viewer device context
- **WHEN** caller code asks a host runtime for host status after active visible authorization
- **AND** the current authorization has no authorization-bound viewer device identity for that authorization requester
- **THEN** the host status snapshot reports the existing active lifecycle metadata
- **AND** it omits viewer device id/platform metadata without inventing device context

#### Scenario: Paused authorization retains authorization-bound viewer device context
- **WHEN** caller code asks a host runtime for host status after the current authorization has been paused
- **AND** the current authorization has authorization-bound viewer device identity for that authorization requester
- **THEN** the host status snapshot reports paused local state, authorization status `paused`, `visibleToHost: true`, the retained granted permission count, the authorization `expiresAt` timestamp, and the authorization-bound viewer device id/platform

#### Scenario: Inactive host indicator omits stale viewer device context
- **WHEN** caller code asks a host runtime for host status after the host indicator has been deactivated by revocation, termination, expiration, local disconnect, or trusted remote disconnect
- **THEN** the host status snapshot reports inactive local state, `visibleToHost: false`, permission count `0`, and a bounded local inactive cause
- **AND** it omits viewer device id/platform metadata from the inactive status

#### Scenario: Host status snapshot is read-only
- **WHEN** caller code receives a host status snapshot
- **THEN** attempts to mutate it MUST NOT change the runtime's internal host authorization, indicator, or viewer device metadata

#### Scenario: Viewer runtime cannot read host status
- **WHEN** caller code asks a viewer runtime for host status
- **THEN** the runtime rejects the operation before sending protocol messages, emitting workflow audit events, granting permissions, reconnecting peers, invoking host controls, starting capture, sending input, or bypassing consent workflows

### Requirement: Host status CLI output
The host agent shell SHALL support an opt-in development status print that calls the managed runtime `getHostStatus()` snapshot after the configured delay. The scheduled status read MUST expose only bounded local lifecycle metadata: local indicator state, visible host-session flag, action-capable permission count, optional authorization id/status, optional authorization expiration timestamp for active or paused authorization, optional viewer device id/platform bound at approval time for the current viewer authorization scope, optional local inactive indicator cause, and optional relay-defined remote disconnect reason code after trusted remote viewer disconnect. The scheduled status read MUST NOT send protocol messages, emit workflow audit events, grant permissions, change authorization lifecycle state, start signaling, reconnect peers, invoke host controls, or expose viewer display names, viewer peer ids, remote self-asserted trust-level metadata, screen contents, input contents, clipboard contents, file-transfer contents, diagnostics content, tokens, pairing codes, credentials, private reasons, signal payloads, raw protocol data, or raw WebSocket close reason text. Ordinary host runtime startup and other explicit host workflow options remain governed by their existing requirements and are not introduced by the scheduled status read.

#### Scenario: Host status print before active authorization
- **WHEN** host status print mode fires before the host has emitted active visible authorization
- **THEN** it prints a bounded local host status line with inactive state, `visibleToHost=false`, and permission count `0`
- **AND** it omits viewer device id/platform metadata

#### Scenario: Host status print after active authorization includes device context
- **WHEN** host status print mode fires after active visible authorization
- **AND** the host status snapshot contains authorization-bound viewer device id/platform metadata
- **THEN** it prints bounded active host status metadata with visible flag, permission count, optional authorization id, optional authorization status, optional authorization expiration timestamp, and the viewer device id/platform
- **AND** it MUST NOT print viewer display name, viewer peer id, remote self-asserted trust-level metadata, screen contents, input contents, tokens, pairing codes, credentials, raw protocol data, or private reasons

#### Scenario: Host status print after disconnect omits stale device context
- **WHEN** host status print mode fires after the host has recorded trusted remote viewer disconnect state
- **THEN** it prints bounded inactive host status metadata with `visibleToHost=false`, permission count `0`, local inactive cause `peer-disconnected`, and the relay-defined remote disconnect reason code
- **AND** it omits viewer device id/platform metadata

#### Scenario: Host status print catches runtime status failure
- **WHEN** host status print mode catches a runtime status failure
- **THEN** it prints only a bounded sanitized CLI error
- **AND** the output MUST NOT expose raw exception text, tokens, pairing codes, credentials, private reasons, screen contents, input contents, clipboard contents, file-transfer contents, diagnostics dumps, raw protocol payloads, or full secrets

#### Scenario: Host status print remains read-only
- **WHEN** host status print mode is scheduled, fires, succeeds, fails, or is stopped
- **THEN** it MUST NOT invoke host controls, send public runtime messages, send protocol messages, emit workflow audit events, grant permissions, start signaling, reconnect peers, start capture, send input, or bypass consent workflows
