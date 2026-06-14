## Context

The relay close handler currently performs authoritative disconnect cleanup before writing `relay.peer.disconnect`: it sends a bounded `peer-disconnected` notice to remaining peers, removes stale room membership, and closes orphaned viewers when a host leaves. This ordering is correct because the transport is already closing and cleanup must not wait on audit persistence, but an exception from the post-cleanup audit sink or diagnostic logger can still escape the close handler.

This change keeps the relay in the legitimate remote-assistance category by hardening failure handling around cleanup. It does not add access, reconnect, capture, input, or persistence behavior.

## Goals / Non-Goals

**Goals:**

- Keep disconnect notification, room cleanup, stale viewer removal, and orphan close behavior authoritative when post-cleanup disconnect audit persistence fails.
- Keep disconnect audit failure diagnostics static and secret-safe.
- Ensure diagnostic logger failure cannot escape the post-cleanup close path.
- Add focused regression coverage for audit sink failure and logger failure in the relay disconnect close handler.

**Non-Goals:**

- No changes to protocol schemas or peer-visible disconnect message fields.
- No reconnect, multi-viewer, session persistence, installer, startup, service, privilege, capture, input, clipboard, file-transfer, credential, or stealth behavior.
- No production audit durability guarantee beyond the existing audit sink contract.

## Decisions

1. Treat `relay.peer.disconnect` audit persistence as post-cleanup observability in the close handler.
   - Rationale: the peer is already disconnected, and the relay must not preserve stale membership or withhold peer-disconnected notices because an audit sink failed after cleanup work.
   - Alternative considered: write audit before notification and cleanup. Rejected because disconnect cleanup is already in response to a closed socket and stale membership removal is the safety-critical action.

2. Use a dedicated helper for disconnect audit writes.
   - Rationale: a helper makes the post-cleanup best-effort boundary explicit and keeps the close handler readable.
   - Alternative considered: inline `try/catch` in the close handler. Rejected because it is easier to accidentally let diagnostic logging escape from inline code.

3. Log only a static warning when disconnect audit persistence fails, and guard that warning.
   - Rationale: raw audit sink errors may contain private text. Logging failure must not produce another unhandled failure path.
   - Alternative considered: include the caught error class/message. Rejected because the project consistently avoids raw infrastructure error text in sensitive relay diagnostics.

## Risks / Trade-offs

- Audit sink failure can still lose the disconnect audit record. Mitigation: cleanup remains safe, a bounded warning can alert operators, and production audit durability remains an operational deployment concern.
- A static warning has less troubleshooting detail. Mitigation: this is intentional for secret safety; operators can inspect trusted sink telemetry outside peer-facing relay logs.
- Close handler exceptions are hard to observe in tests. Mitigation: regression tests use failing audit sinks plus throwing warning loggers and verify peer-visible cleanup still completes.
