## ADDED Requirements

### Requirement: MVP smoke check verifies bounded local status readiness

The root MVP smoke check SHALL treat the loopback viewer surface `/status`
readiness check as successful only when the response is bounded sanitized JSON
with `ok=true`, active viewer state, `visibleToHost=true`,
`signalProbeAckReceived=true`, `inputPointerReady=true`, and
`inputKeyboardReady=true`. This check SHALL remain part of the fixed `signal`
smoke subcheck and SHALL fail closed with the existing bounded
`signal-not-ready` reason when status is missing, inactive, invisible, lacks
the expected readiness booleans, contains malformed metadata, or contains known
unsafe raw status fields. The helper MUST NOT print the raw status response,
surface URL, port, tokens, or child output in human or JSON diagnostics.

#### Scenario: Status readiness smoke subcheck passes

- **WHEN** the smoke workflow polls the local viewer surface `/status` after
  visible host authorization and signal acknowledgement
- **THEN** the response is accepted only if it reports active visible sanitized
  status with signal, pointer, and keyboard readiness booleans set to true
- **AND** accepting the status MUST NOT grant permissions, send input, start
  capture, reconnect peers, invoke host controls, hide host visibility, or
  bypass runtime authorization gates

#### Scenario: Status readiness smoke subcheck rejects unsafe metadata

- **WHEN** the local viewer surface `/status` response contains raw
  authorization ids, raw permission arrays, pairing codes, mutation tokens,
  relay tokens, raw signal payload markers, raw input commands, pointer
  coordinates, key values, modifier values, frame paths, frame bytes, audit
  paths, raw audit records, diagnostics dumps, child stdout or stderr, or full
  secrets
- **THEN** the smoke helper treats the fixed `signal` subcheck as not ready
- **AND** diagnostics MUST NOT expose the unsafe response values

#### Scenario: Status readiness smoke subcheck rejects incomplete readiness

- **WHEN** the local viewer surface `/status` response is missing, malformed,
  inactive, invisible, lacks `signalProbeAckReceived=true`, lacks
  `inputPointerReady=true`, or lacks `inputKeyboardReady=true`
- **THEN** the smoke helper treats the fixed `signal` subcheck as not ready
- **AND** it continues polling only until the bounded smoke deadline
- **AND** failure output uses only the bounded `signal-not-ready` reason and
  fixed smoke subcheck metadata
