## Context

`AgentShellRuntime.send()` is a public low-level test/runtime API. It currently validates socket state, peer-disconnect state, protocol schema, and signal authorization, while internal workflow code calls `sendProtocol()` directly for consent lifecycle messages. That leaves a gap where caller code can bypass explicit `hostDecision` and `visibleToHost` workflow checks by sending workflow-authority envelopes through the public API.

Workflow-authority envelopes are messages that create or mutate consent/audit lifecycle state:

- `session-authorization-decision`
- `session-authorization-state`
- `permission-revoked`
- `session-control`
- `audit-event`

## Goals / Non-Goals

**Goals:**

- Reject public runtime sends of workflow-authority messages before socket write and before local `sent` event emission.
- Keep internal workflow sends unchanged and tied to explicit host decision, visible activation, revocation, pause/resume, termination, expiration, and audit sink behavior.
- Keep blocked diagnostics static and secret-safe.

**Non-Goals:**

- No protocol schema changes.
- No relay behavior changes.
- No production identity, account, native UI, capture, input, clipboard, file transfer, installer, startup, service, persistence, privilege elevation, hidden session, or Windows prompt behavior.
- No restriction on public `session-authorization-request`; it is a request, not a grant or host workflow authority transition.

## Decisions

- Add a public-send-only authority gate in `AgentShellRuntime.send()`.
  - Rationale: public sends should fail before `sendProtocol()` writes to the socket or emits local `sent`.
  - Alternative considered: make `sendProtocol()` reject workflow-authority messages globally. Rejected because internal workflow uses `sendProtocol()` and should remain the single allowed path.
- Include `audit-event` in the blocked public workflow-authority set.
  - Rationale: development workflow audit events are part of the consent record. Public callers should not be able to forge workflow audit records that imply approval, activation, revocation, or termination outside the internal workflow.
  - Alternative considered: allow arbitrary public audit events. Rejected because the current relay treats `audit-event` as host-only workflow authority metadata.
- Use a static error string for blocked public workflow-authority sends.
  - Rationale: the error can be asserted in tests without exposing raw protocol payloads, private reasons, audit detail, tokens, or pairing material.

## Risks / Trade-offs

- [Risk] Existing tests that used public `audit-event` as a redaction sample will need to use non-authority protocol messages or protocol-level audit redaction tests instead.
  - Mitigation: keep runtime redaction covered through internal workflow audit events and keep direct public-send rejection tests secret-safe.
- [Risk] Future tooling may need a privileged internal send path for tests.
  - Mitigation: require a future OpenSpec change before exposing any privileged workflow-authority testing API.
