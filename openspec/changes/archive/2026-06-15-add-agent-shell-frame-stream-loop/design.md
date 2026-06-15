## Context

The agent shell currently exercises consent, visibility, revocation, audit, and a one-shot non-native `screen-frame` send. A real MVP will eventually need native Windows capture, but adding capture before a safe stream controller would mix high-risk native behavior with cadence, authorization-loss, and audit concerns.

## Goals / Non-Goals

**Goals:**

- Add a host-only development frame stream loop that repeatedly calls the existing `sendScreenFrame()` runtime method.
- Keep the stream bounded by explicit frame count and interval values.
- Validate all stream configuration before runtime startup.
- Stop cleanly on authorization loss, runtime rejection, disconnect, local shutdown, or count completion.
- Keep output, events, logs, and audit records metadata-only.

**Non-Goals:**

- No real screen capture, native Windows APIs, desktop rendering, or media codec integration.
- No OS input injection, key capture, clipboard, file transfer, diagnostics collection, reconnect, background service, startup persistence, elevation, unattended access, or Windows prompt bypass.
- No change to relay room semantics or protocol envelope schemas.

## Decisions

- Extend the existing host development frame CLI instead of adding a new protocol message.
  - Rationale: the protocol and runtime already define consent-bound `screen-frame` authorization, routing, audit-before-send, and redaction.
  - Alternative considered: a new stream-control message. Rejected because it would add protocol semantics without native capture or backpressure yet.
- Require an explicit finite `--dev-screen-frame-count` for streaming.
  - Rationale: bounded development streams avoid accidental long-running frame sends and keep tests deterministic.
  - Alternative considered: indefinite streaming until disconnect. Rejected until native capture, UI controls, and production backpressure are designed.
- Use a positive `--dev-screen-frame-interval-ms` only when count is greater than one.
  - Rationale: frame cadence should be deliberate and cannot silently become a tight loop.
- Derive per-frame `frameId` from the validated base id plus sequence suffix and validate each derived id.
  - Rationale: audit and viewer observations can distinguish frames without accepting arbitrary user input per frame.
- Keep source data static and already validated by the existing frame parser.
  - Rationale: this proves repeated transport while avoiding hidden capture or file reads.

## Risks / Trade-offs

- Stream output is not a usable remote desktop by itself -> the loop is deliberately a transport milestone before native capture/viewer UI.
- Relay transport is still WebSocket message forwarding without media backpressure -> count and interval remain bounded for development safety.
- Reusing static frame data does not test compression quality -> native capture/codec work will need a separate OpenSpec change and security review.
- Frame id suffixing can exceed protocol identifier length if the base id is too long -> parser validates the configured count and derived last id before startup.
