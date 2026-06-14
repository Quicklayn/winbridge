## Context

Registered relay forwarding currently validates the protocol envelope, selects
the remaining registered recipient, writes accepted-forward audit, then calls
the recipient peer send function. The accepted-forward audit is now deliberately
pre-delivery and fail-closed. The remaining gap is transport outcome
observability after that gate.

Disconnect notification delivery already counts successful and failed send
attempts in `relay.peer.disconnect` audit detail. Forwarded peer messages can
use the same pattern without changing authorization, routing, or payload shape.

## Goals / Non-Goals

**Goals:**

- Record a bounded post-send delivery audit event for validated forwarded peer
  messages.
- Preserve successful recipient-visible protocol envelopes unchanged.
- Keep delivery metadata secret-safe and aligned with accepted-forward audit
  redaction rules.
- Avoid misleading invalid-message rejection when delivery send or post-send
  delivery audit fails after accepted-forward audit.

**Non-Goals:**

- Do not change room selection, pairing, token validation, authorization
  semantics, relay-error rate limits, heartbeat, or disconnect notification
  behavior.
- Do not make delivery audit a pre-delivery authorization gate.
- Do not retry sends, queue messages, reconnect peers, or implement reliable
  delivery.
- Do not add native capture, input, clipboard, file-transfer, diagnostics,
  installer, startup, service, privilege, or production transport behavior.

## Decisions

1. Use a separate `relay.message.delivery` action.

   Rationale: `relay.message.forwarded` is accepted-forward evidence and must
   remain pre-delivery. A separate action makes transport outcome explicit
   without overloading the security decision audit.

2. Catch recipient send failures and count them.

   Rationale: once accepted-forward audit has succeeded, a transport send
   failure is not an invalid sender message. Counting it as delivery failure is
   more accurate than routing it through the malformed-message rejection path.

3. Treat post-send delivery audit failure as non-retroactive.

   Rationale: after a send attempt, the message may already be visible to the
   recipient. Emitting `relay.message.rejected` or peer `relay-error` at that
   point would misrepresent the accepted decision and could leak unrelated
   failure timing. A bounded local warning is acceptable if the sink fails.

## Risks / Trade-offs

- **Risk: Delivery audit can fail after a successful send.** -> Mitigation:
  delivery audit is post-send observability; failure is sanitized and does not
  retroactively reject the message.
- **Risk: Delivery metadata leaks payload content.** -> Mitigation: reuse the
  existing accepted-forward audit detail shape and add only integer counts.
- **Risk: Changing send error behavior hides a transport issue.** -> Mitigation:
  the failed delivery count records send failure when audit is available, and
  sender invalid-message rate limits are not consumed for transport failures.
- **Risk: Implementation alters successful forwarding.** -> Mitigation: keep
  payload encoding and recipient send order unchanged and add focused
  integration coverage.
