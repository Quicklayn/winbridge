## ADDED Requirements

### Requirement: Host status CLI validation

The agent shell SHALL reject malformed, viewer-mode, or host-control-prompt-conflicting host status CLI configuration before starting the runtime. Host status validation SHALL allow exact integer millisecond delay values from `0` through `2147483647` only for host runtimes. Host status configuration MUST NOT require requested permissions because the scheduled status read only reads local host status metadata. Host status one-shot mode MUST be rejected when interactive host control prompt mode is enabled. Host status one-shot mode MAY be combined with ordinary host runtime startup, consent, and lifecycle simulation options; those options retain their existing protocol, audit, and lifecycle behavior and MUST NOT be widened by the status print.

#### Scenario: Host status delay is exact
- **WHEN** the agent shell is started with `--host-status-after-ms`
- **THEN** the value MUST be an exact integer millisecond delay from `0` through `2147483647`

#### Scenario: Host status is host-only
- **WHEN** a viewer shell is started with `--host-status-after-ms 0`
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Host status does not require requested permissions
- **WHEN** a host shell is started with `--host-status-after-ms 0` without `--request`
- **THEN** CLI validation succeeds and the runtime MAY start normally

#### Scenario: Host status is mutually exclusive with host control prompt
- **WHEN** a host shell is started with both `--host-status-after-ms 0` and `--host-control-prompt true`
- **THEN** it exits through bounded usage handling before connecting to the relay, opening an interactive control prompt, invoking host controls, or sending any protocol message

#### Scenario: Host status may accompany ordinary host workflow options
- **WHEN** a host shell is started with `--host-status-after-ms 0` plus existing host consent, visible-session, or lifecycle simulation options
- **THEN** CLI validation MAY succeed when each option is otherwise valid
- **AND** those existing options retain their existing protocol, audit, and lifecycle behavior without being expanded by the host status print

### Requirement: Host status CLI output

The host agent shell SHALL support an opt-in development status print that calls the managed runtime `getHostStatus()` snapshot after the configured delay. The scheduled status read MUST expose only bounded local lifecycle metadata: local indicator state, visible host-session flag, action-capable permission count, optional authorization id/status, and optional local inactive indicator cause. The scheduled status read MUST NOT send protocol messages, emit workflow audit events, grant permissions, change authorization lifecycle state, start signaling, reconnect peers, invoke host controls, or expose screen, input, clipboard, file-transfer, diagnostics, token, pairing, credential, private-reason, display-name, peer-id, signal-payload, raw protocol data, or raw WebSocket close reason text. Ordinary host runtime startup and other explicit host workflow options remain governed by their existing requirements and are not introduced by the scheduled status read.

#### Scenario: Host status prints inactive status
- **WHEN** host status print mode fires before the host has emitted active visible authorization
- **THEN** it prints a bounded local host status line with inactive state, `visibleToHost=false`, and permission count `0`
- **AND** it MUST NOT invoke pause, resume, revoke, terminate, disconnect, viewer leave, public send, or any direct protocol-construction path

#### Scenario: Host status prints active status
- **WHEN** host status print mode fires after active visible authorization
- **THEN** it prints bounded active host status metadata with visible flag, permission count, optional authorization id, and optional authorization status
- **AND** it MUST NOT print raw permission names, peer ids, display names, private reasons, tokens, pairing codes, signal payloads, raw protocol data, screen contents, input contents, clipboard contents, file-transfer contents, diagnostics dumps, or raw WebSocket close reason text

#### Scenario: Host status print failures are secret-safe
- **WHEN** host status print mode catches a runtime status failure
- **THEN** CLI diagnostics MUST include bounded metadata only
- **AND** diagnostics MUST NOT expose raw exception text, local file paths, tokens, pairing codes, credentials, private reasons, protocol payloads, screen contents, input contents, clipboard contents, file-transfer contents, diagnostics dumps, or full secrets

#### Scenario: Host status print safety boundary
- **WHEN** host status print mode is scheduled, fires, succeeds, fails, or is stopped
- **THEN** the scheduled status read MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, hide the session from the host, reconnect peers, suppress host visibility, or bypass consent workflows
