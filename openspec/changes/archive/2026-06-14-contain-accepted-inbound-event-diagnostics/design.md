## Context

The agent shell emits a redacted local `received` runtime event after inbound protocol validation and before workflow handling. This event is diagnostic observability, while consent decisions, visible activation, authorization state, signal checks, and audit persistence are enforced by the workflow code that follows it.

The host indicator event callback is intentionally out of scope because indicator event emission is host-visible UI state and existing specs require that callback path to remain authoritative.

## Goals / Non-Goals

**Goals:**

- Contain diagnostic `received` event callback failures for accepted inbound protocol messages.
- Preserve normal consent workflow handling after a valid same-session authorization request when the diagnostic event callback fails.
- Keep diagnostics bounded and secret-safe.
- Add a focused regression test for authorization request processing with a throwing diagnostic `received` event callback.

**Non-Goals:**

- No changes to host indicator event callback semantics.
- No changes to invalid inbound protocol rejection, public send validation, relay forwarding, protocol schemas, or authorization gates.
- No capture, input, clipboard, file transfer, diagnostics content transfer, reconnect, installer, startup persistence, service, privilege elevation, token format, native Windows API, hidden session, stealth behavior, credential access, keylogging, AV/EDR evasion, Windows prompt bypass, or consent bypass.

## Decisions

- Reuse the existing best-effort runtime event helper for the accepted inbound `received` event.
  - Rationale: it already catches local event callback failures and keeps the diagnostic event payload bounded.
  - Alternative considered: add a second helper just for `received` events. That adds indirection without changing containment semantics.
- Keep the event callback before summary logging and workflow handling.
  - Rationale: ordering stays the same for successful callbacks; only callback failure is contained.
  - Alternative considered: move event emission after workflow handling. That would change event ordering and could make diagnostics harder to reason about.
- Test with a host authorization request whose local `received` event observer throws after the test harness has recorded the redacted event.
  - Rationale: the test proves the callback failure is contained while the request still passes through explicit approval, visible activation, and audit persistence.

## Risks / Trade-offs

- A broken local diagnostic observer can miss a `received` event. -> The runtime continues with bounded summary logging and workflow gates; the local observer failure does not become authorization.
- Containing callback failures may hide test callback bugs. -> The containment is limited to accepted inbound diagnostic runtime events and does not apply to host-visible indicator callback semantics.
