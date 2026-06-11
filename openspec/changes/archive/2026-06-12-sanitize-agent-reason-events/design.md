## Context

The agent shell emits local runtime events for tests and future diagnostic consumers. Recent hardening redacts pairing codes, audit details, signal payloads, raw non-protocol text, and WebSocket close reasons from local event views. Protocol messages that carry `reason` fields still pass those reason strings through `sent` and `received` events.

Reason text can contain private host context, denial explanations, revocation notes, or operational detail. It is safe and necessary on the wire for the protocol simulator, but local event consumers should not need raw reason text to observe consent workflow state.

## Goals / Non-Goals

**Goals:**

- Prevent local `sent` and `received` runtime events from exposing raw protocol `reason` text.
- Preserve safe indication that a reason exists by using the shared redaction marker.
- Keep protocol validation, socket send behavior, relay forwarding, and internal workflow handling unchanged.
- Cover outbound and inbound event redaction with focused runtime tests.

**Non-Goals:**

- No changes to protocol schemas, relay forwarding, or wire messages.
- No changes to authorization decisions, state-machine behavior, permission grants, or lifecycle timers.
- No native capture/input, WebRTC implementation, reconnect, installer, service, startup, or privilege work.

## Decisions

1. Redact reason fields only in local event views.

   The runtime will continue to validate and send the original protocol messages, and internal workflow handlers will continue to see decoded inbound messages. Redaction occurs only before calling `onEvent`.

   Alternative considered: remove `reason` fields from events. Rejected because a stable redacted marker makes it clear the field existed without leaking content.

2. Apply a common event-view sanitizer to sent and received messages.

   A shared sanitizer will redact signal payloads and any top-level `reason` field, while preserving existing join-session pairing-code and audit-detail redaction. This avoids drift between inbound and outbound event surfaces.

   Alternative considered: add one-off redaction for each lifecycle message type. Rejected because future reason-bearing protocol messages could be missed.

3. Do not redact semantic consent metadata.

   Permission names, statuses, decisions, peer ids, bounded reason codes, and payload byte lengths remain visible because tests and future UI adapters need them to observe consent workflow state.

## Risks / Trade-offs

- Event consumers lose raw reason text -> intentional; event consumers should not persist private host reason text.
- Redaction is top-level only -> current protocol reason fields are top-level; nested audit details are already handled by protocol audit redaction.
- Future protocol messages could add non-top-level reason-like fields -> future changes touching protocol/event surfaces must keep the event-view sanitizer updated.
