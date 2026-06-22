## ADDED Requirements

### Requirement: Agent shell applies inbound Windows input only after explicit host opt-in

The agent shell SHALL expose a host-only opt-in runtime configuration for
applying accepted inbound `input-event` messages through the Windows input
adapter. The runtime MUST keep native input application disabled by default. On
an opted-in host, native input MUST be invoked only after the inbound
`input-event` passes existing sender role, sender peer id, session id, target
peer id, authorization id, visible active unexpired authorization state, and
required `input:pointer` or `input:keyboard` permission checks. The runtime MUST
write metadata-only local audit before invoking the Windows input adapter, and
audit failure MUST block native input.

#### Scenario: Host applies authorized pointer input
- **WHEN** an opted-in host runtime with local audit configuration receives a pointer `input-event` from the observed viewer for the active visible unexpired authorization that grants `input:pointer`
- **THEN** the runtime writes metadata-only local input-application audit before invoking the Windows input adapter
- **AND** the adapter receives a grant snapshot bound to the current authorization, visibility, permissions, expiry, and connected viewer state
- **AND** local events, logs, audit records, thrown errors, and status output MUST NOT expose pointer coordinates, button values, raw input payloads, credentials, tokens, pairing codes, private reasons, command output, or full secrets

#### Scenario: Host applies authorized keyboard input
- **WHEN** an opted-in host runtime with local audit configuration receives a keyboard `input-event` from the observed viewer for the active visible unexpired authorization that grants `input:keyboard`
- **THEN** the runtime writes metadata-only local input-application audit before invoking the Windows input adapter
- **AND** local events, logs, audit records, thrown errors, and status output MUST NOT expose key values, code values, modifier values, raw input payloads, keylogging buffers, credentials, tokens, pairing codes, private reasons, command output, or full secrets

#### Scenario: Host input application is not opted in
- **WHEN** a host runtime receives an otherwise authorized `input-event` while native input application is disabled
- **THEN** the runtime keeps existing metadata-only inbound observation behavior and MUST NOT write input-application audit, invoke the Windows input adapter, inject OS input, reconnect peers, hide the session, or bypass consent

#### Scenario: Host input application lacks local audit
- **WHEN** a host runtime is configured to apply inbound input without a local audit sink
- **THEN** runtime creation or startup fails closed before opening a relay connection, receiving input, invoking the Windows input adapter, injecting OS input, reconnecting peers, hiding the session, or bypassing consent

#### Scenario: Input application audit fails
- **WHEN** an opted-in host is otherwise authorized to apply an inbound `input-event` but metadata-only local audit persistence fails
- **THEN** the runtime rejects before invoking the Windows input adapter, injecting OS input, writing trusted success metadata, reconnecting peers, hiding the session, or bypassing consent
- **AND** diagnostics MUST NOT expose pointer coordinates, button values, key values, modifier values, raw input payloads, keylogging buffers, credentials, tokens, pairing codes, private reasons, command output, or full secrets

#### Scenario: Authorization is lost before input application
- **WHEN** a host receives an `input-event` after authorization is paused, revoked, terminated, expired, invisible, disconnected, missing, mismatched, or missing the required input permission
- **THEN** the runtime rejects or ignores the event before input-application audit, Windows input adapter invocation, trusted received event emission, injected OS input, reconnection, hidden session behavior, or consent bypass

#### Scenario: Windows input adapter fails
- **WHEN** an opted-in host passes an authorized inbound input event to the Windows input adapter and the adapter rejects or fails
- **THEN** the runtime reports only bounded generic failure metadata
- **AND** it MUST NOT expose pointer coordinates, button values, key values, modifier values, raw input payloads, keylogging buffers, credentials, tokens, pairing codes, private reasons, command output, or full secrets

#### Scenario: Host input application remains scoped
- **WHEN** a host enables inbound Windows input application
- **THEN** the process MUST NOT capture input, keylog, read clipboard data, sync clipboard, transfer files, collect diagnostics, install services, configure startup persistence, elevate privileges, run unattended, collect credentials, evade AV/EDR, bypass Windows prompts, hide the active host session indicator, or suppress host pause, revoke, terminate, or disconnect controls
