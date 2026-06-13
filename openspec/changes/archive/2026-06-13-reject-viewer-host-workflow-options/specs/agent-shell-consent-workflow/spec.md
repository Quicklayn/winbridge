## ADDED Requirements

### Requirement: Viewer runtimes reject host workflow configuration

The agent shell SHALL reject host-only consent, visibility, status, control, acknowledgement, and lifecycle workflow configuration on viewer runtimes before starting the runtime, opening a relay connection, sending protocol messages, scheduling host workflow timers, activating host visibility, invoking host controls, or emitting workflow audit events. Host-only CLI configuration MUST include explicit `--host-decision`, `--host-consent-prompt`, `--host-consent-timeout-ms`, `--host-control-prompt`, `--host-status-after-ms`, `--host-signal-probe-ack`, `--visible-session`, `--authorization-ttl-ms`, `--grant`, `--revoke-after-ms`, `--revoke-permission`, `--revoke-reason`, `--pause-after-ms`, `--pause-reason`, `--resume-after-ms`, `--resume-reason`, `--terminate-after-ms`, `--terminate-reason`, `--disconnect-after-ms`, and `--disconnect-reason` options. Direct viewer runtime construction MUST reject host workflow state that attempts to configure static host approval or denial, host-visible active state, authorization TTL, host lifecycle timers, host revocation, or host workflow reasons. Rejection diagnostics MUST remain bounded and MUST NOT expose raw user-provided option values, protocol payloads, tokens, pairing codes, credentials, private reasons, screen contents, input contents, clipboard contents, file-transfer contents, diagnostics dumps, or full secrets.

#### Scenario: Viewer CLI rejects explicit host workflow option

- **WHEN** the agent shell is started as a viewer with an explicit host workflow option such as `--pause-after-ms`, `--terminate-reason`, `--host-decision`, `--visible-session`, or `--host-consent-prompt`
- **THEN** it exits through bounded usage handling before creating the managed runtime, connecting to the relay, sending join, hello, authorization, lifecycle, signal, control, or audit messages, scheduling workflow timers, activating host visibility, or invoking host controls

#### Scenario: Viewer CLI rejects explicit host no-op option

- **WHEN** the agent shell is started as a viewer with an explicit host-scoped no-op value such as `--host-decision none`, `--host-consent-prompt false`, `--host-control-prompt false`, `--host-signal-probe-ack false`, or `--visible-session false`
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Direct viewer runtime rejects host workflow state

- **WHEN** caller code creates a viewer runtime with static host approval or denial, `visibleToHost: true`, authorization TTL, a host lifecycle timer, a host revoke permission, or a host workflow reason
- **THEN** runtime creation fails before opening a relay connection, sending protocol messages, scheduling workflow timers, activating host visibility, invoking host controls, or emitting workflow audit events

#### Scenario: Valid viewer workflow options remain available

- **WHEN** the agent shell is started as a viewer with valid viewer requested permissions, one-shot viewer status, viewer local disconnect, viewer control prompt, or viewer signal probe configuration
- **THEN** validation MAY succeed when each viewer option is otherwise valid
- **AND** the host-only workflow rejection MUST NOT grant permissions, start capture, send input, reconnect peers, suppress host visibility, invoke host controls, sync clipboard, transfer files, expose diagnostics, install services, configure startup persistence, collect credentials, hide the session from the host, or bypass consent workflows
