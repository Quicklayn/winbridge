## Context

The agent shell emits a redacted local `raw` runtime event when inbound data is not a protocol envelope or when a decoded protocol envelope is rejected as unsafe before trusted `received` event emission. These events are diagnostic observability for rejected input; they are not consent, authorization, audit, signal, or host-visibility gates.

The current implementation emits the `raw` event through the configured callback directly in both rejected-input paths. A callback exception can therefore escape into the message handler error path even though the inbound data was already rejected and should remain a bounded ignored input summary.

## Goals / Non-Goals

**Goals:**

- Contain diagnostic `raw` event callback failures for non-protocol inbound data.
- Contain diagnostic `raw` event callback failures for decoded unsafe inbound protocol messages.
- Preserve existing rejected-input behavior: no trusted `received` event, no workflow handling, no protocol sends, no authorization, no host visibility activation, and no signal authorization.
- Add focused regression coverage for both rejected-input paths.

**Non-Goals:**

- No changes to accepted `received` event behavior beyond the existing containment requirement.
- No changes to `sent` event callbacks, host indicator callbacks, audit persistence, consent providers, public send validation, relay forwarding, or protocol schemas.
- No capture, input, clipboard, file transfer, diagnostics content transfer, reconnect, installer, startup persistence, service, privilege elevation, token format, native Windows API, hidden session, stealth behavior, credential access, keylogging, AV/EDR evasion, Windows prompt bypass, or consent bypass.

## Decisions

- Reuse `emitRuntimeEventBestEffort` for rejected inbound `raw` event emission.
  - Rationale: the helper already contains local observer exceptions and is used for other best-effort runtime events.
  - Alternative considered: add a `emitRawRuntimeEventBestEffort` wrapper. That would duplicate behavior without adding a distinct safety boundary.
- Keep bounded rejected-input logging after the `raw` event attempt.
  - Rationale: logging should remain available even when the local event observer is broken.
  - Alternative considered: skip logging after callback failure. That would reduce observability without improving security.
- Test non-protocol and decoded unsafe inbound cases separately.
  - Rationale: they enter through different code paths and have different safety assertions: non-protocol input must not send protocol messages, while decoded unsafe protocol input must not become a trusted `received` event.

## Risks / Trade-offs

- A broken local event observer can miss a `raw` event. -> The runtime still logs a bounded rejected-input summary and preserves fail-closed rejection behavior.
- Containment could hide bugs in local test observers. -> The catch is limited to rejected inbound diagnostic events and does not apply to host-visible indicator callbacks, public send callbacks, audit persistence, or consent decisions.
