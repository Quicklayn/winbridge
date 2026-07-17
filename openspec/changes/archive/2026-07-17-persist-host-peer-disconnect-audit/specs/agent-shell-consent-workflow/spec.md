## ADDED Requirements

### Requirement: Trusted viewer disconnect host audit persistence

The host agent shell SHALL persist one local accepted
`agent-shell.session.disconnected` audit record when a decoded
`peer-disconnected` notice has passed the existing current-session, observed
opposite-role viewer trust gate and a host authorization snapshot is available.
The record MUST use the local host actor and current session id, bind to the
current authorization id, and include only the authorization status, fixed cause
`peer-disconnected`, pre-disconnect `visibleToHost` value, bounded permission
count, and relay-defined bounded disconnect reason code.

The record MUST be local only. The runtime MUST NOT construct or send a protocol
`audit-event` or `peer-disconnected` message because of the received notice. It
MUST NOT persist accepted session-disconnect evidence for self, unbound,
same-role, mismatched, duplicate, or pre-authorization notices. After recording
remote peer disconnected state, the runtime MUST reject later peer `hello` and
disconnect notices as terminal-state input before they can restore recipient or
observed-peer binding or create duplicate evidence. The audit detail and any
audit-persistence failure diagnostics MUST NOT include peer ids, display names,
raw close reasons, private reasons, protocol payloads, tokens, pairing codes,
credentials, screen contents, input contents, clipboard contents, file-transfer
contents, diagnostic contents, or full secrets. This restriction does not alter
the existing bounded accepted-disconnect summary logging contract.

Audit persistence SHALL be post-decision observability. The runtime MUST capture
only the fixed bounded audit input, then complete host input/capture blocking,
remote peer disconnected state, recipient and observed-identity clearing,
signaling invalidation, and visible host indicator deactivation before invoking
the audit sink once without retry. A slow synchronous sink MUST NOT delay those
state transitions. If the audit sink or diagnostic callback fails, the completed
disconnect cleanup MUST remain authoritative. Audit or diagnostic failure MUST
NOT reconnect peers, approve or change authorization, grant permissions, start
capture, apply input, suppress host visibility, install services, configure
startup persistence, elevate privileges, run unattended, or bypass consent
workflows.

#### Scenario: Trusted authorized viewer disconnect is persisted once

- **WHEN** a host has an authorization snapshot for its observed viewer and
  receives a trusted relay-originated `peer-disconnected` notice for that viewer
- **THEN** the host writes exactly one accepted local
  `agent-shell.session.disconnected` record bound to the current session and
  authorization with the fixed bounded disconnect detail
- **AND** it sends no protocol `audit-event` or `peer-disconnected` message
  because of the received notice

#### Scenario: Untrusted and pre-authorization notices create no evidence

- **WHEN** the host receives a self, unbound, same-role, mismatched, duplicate,
  or otherwise untrusted disconnect notice, receives a same-id `hello` and
  repeated notice after terminal remote disconnect, or no host authorization
  snapshot exists for an otherwise trusted observed viewer disconnect
- **THEN** it does not write an accepted authorization-bound
  `agent-shell.session.disconnected` audit record for that notice
- **AND** post-terminal input cannot restore recipient or observed-peer binding
- **AND** ignored notices do not change authorization, indicator, capture,
  input, or signaling state

#### Scenario: Slow or failed audit does not weaken disconnect cleanup

- **WHEN** the host accepts a trusted viewer disconnect notice and local audit
  persistence is slow, fails, or triggers failing diagnostics
- **THEN** the host still blocks capture and input, records remote disconnect
  state, clears recipient and observed viewer state, invalidates signaling, and
  emits the inactive visible-host indicator transition before invoking the sink
- **AND** bounded audit-persistence failure diagnostics do not expose raw sink
  or callback errors, peer ids, display names, raw close reasons, private
  reasons, protocol payloads, tokens, pairing codes, credentials, screen
  contents, input contents, clipboard contents, file-transfer contents,
  diagnostic contents, or full secrets

#### Scenario: Trusted disconnect is not authorization

- **WHEN** the host persists trusted viewer disconnect evidence
- **THEN** that evidence does not approve authorization, grant permissions,
  activate host visibility, start capture, apply input, reconnect the viewer,
  install services, configure startup persistence, elevate privileges, run
  unattended, or bypass consent workflows
