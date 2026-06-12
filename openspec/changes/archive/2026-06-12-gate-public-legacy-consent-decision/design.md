## Context

`host-consent-decision` is a legacy protocol message retained by the protocol and relay. It can carry approval status and granted permissions, so it is equivalent to a consent authority decision even though the current agent-shell workflow uses the newer `session-authorization-decision` messages.

The existing public workflow-authority send gate rejects public sends of:

- `session-authorization-decision`
- `session-authorization-state`
- `permission-revoked`
- `session-control`
- `audit-event`

It does not reject `host-consent-decision`.

## Goals / Non-Goals

**Goals:**

- Reject public runtime sends of legacy `host-consent-decision` before socket write and local `sent` event emission.
- Keep the current internal session authorization workflow unchanged.
- Keep public request messages allowed when they do not grant access by themselves.
- Keep blocked diagnostics static and secret-safe.

**Non-Goals:**

- No protocol schema changes.
- No relay behavior changes.
- No deprecation or removal of legacy protocol messages.
- No native Windows UI, capture, input, clipboard, file transfer, installer, startup, service, persistence, privilege elevation, hidden session, or Windows prompt behavior.

## Decisions

- Add `host-consent-decision` to the existing runtime workflow-authority predicate.
  - Rationale: the predicate is already the public-send-only authority boundary and this message has grant/deny authority semantics.
  - Alternative considered: create a separate legacy-only predicate. Rejected because it would duplicate the same public authority gate.
- Do not block `host-consent-required`.
  - Rationale: it is a request message, analogous to `session-authorization-request`, and does not grant access without a host decision.
  - Alternative considered: block all legacy consent messages. Rejected because that would mix grant prevention with request semantics and could unnecessarily break request-level diagnostics.

## Risks / Trade-offs

- [Risk] Future code may still support legacy messages at the relay/protocol layer.
  - Mitigation: this change is scoped to the managed agent-shell public API; any broader legacy deprecation needs a separate OpenSpec change.
- [Risk] Tests might overfit to a single legacy approval shape.
  - Mitigation: assert the generic message type is blocked before sent/forward events and that private reason text is not leaked.
