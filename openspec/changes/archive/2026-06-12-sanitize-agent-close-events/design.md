## Context

The agent shell emits local runtime events for tests and future callers. The WebSocket `close` callback provides a close code and an arbitrary reason buffer. Current logging reports only `reasonBytes`, but the local `closed` event exposes `reason.toString()`.

Close reasons are remote-controlled enough to treat as untrusted diagnostic input. Even when the current relay uses bounded internal reasons elsewhere, future proxies, test servers, or error paths could include sensitive text in WebSocket close reasons.

## Goals / Non-Goals

**Goals:**

- Prevent local `closed` runtime events from exposing raw WebSocket close reasons.
- Preserve useful diagnostics with close code and reason byte length.
- Keep disconnect logging summary-only.
- Cover the behavior with a focused integration test.

**Non-Goals:**

- No changes to relay disconnect notices, peer-disconnected protocol messages, or relay close behavior.
- No changes to authorization state, consent workflow, reconnect, heartbeat, capture, input, clipboard, file transfer, installer, services, startup, or privilege handling.
- No production telemetry system.

## Decisions

1. Redact the close reason in local events.

   `AgentShellEvent` will keep `direction: "closed"` and `code`, but `reason` will be the stable redaction marker. A new `reasonBytes` field carries safe metadata.

   Alternative considered: remove `reason` entirely. Rejected for a smaller API transition and consistency with redacted `raw` events.

2. Use byte length instead of text length.

   WebSocket close reason arrives as bytes. Reporting `reason.length` matches existing logging and avoids Unicode/string conversion behavior becoming part of diagnostics.

   Alternative considered: include a hash of the reason. Rejected because it enables cross-session correlation of sensitive content and is unnecessary for current debugging.

3. Test with a dedicated local WebSocket server.

   The existing development relay does not intentionally expose raw close reasons to clients. A small test server can close with a private reason and assert the runtime event/log boundary without changing relay behavior.

## Risks / Trade-offs

- Consumers lose raw close reason text -> intentional; close reasons are untrusted diagnostics and can contain secrets.
- Byte length can reveal approximate diagnostic size -> acceptable because it does not reveal tokens, pairing codes, credentials, keystrokes, screenshots, screen contents, or input contents.
- Future event additions could reintroduce raw diagnostic text -> specs and docs will explicitly cover local close events, and log/event changes require security review.
