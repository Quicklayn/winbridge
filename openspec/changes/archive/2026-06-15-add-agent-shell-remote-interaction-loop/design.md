## Context

The current bootstrap includes a relay, protocol validation, host consent workflow, visible host indicator state, lifecycle controls, and `screen-frame` / `input-event` schemas. `apps/agent-shell` can request and approve authorizations but only exercises signaling, not the remote interaction messages that the MVP will eventually bind to native Windows capture and input adapters.

## Goals / Non-Goals

**Goals:**

- Add a non-native agent-shell path for sending and receiving development screen frames and input events through the relay.
- Reuse the existing runtime authorization snapshots so every frame/input send and inbound acceptance fails closed unless the authorization is active, visible, unexpired, and permission-scoped.
- Audit accepted local remote-interaction sends with metadata only before socket writes.
- Redact screen and input details from local events, logs, thrown diagnostics, and audit details.

**Non-Goals:**

- No native Windows Desktop Duplication, Windows Graphics Capture, `SendInput`, UIAccess, secure desktop interaction, installer, service, startup persistence, unattended access, elevation, AV/EDR evasion, credential collection, keylogging, clipboard, file transfer, or Windows prompt bypass.
- No production video codec, adaptive streaming, NAT traversal, or browser/desktop UI rendering in this change.
- No change to relay forwarding policy or protocol envelope schemas unless tests reveal a strict compatibility bug.

## Decisions

- Expose explicit runtime methods instead of overloading public `send()`. Remote interaction is sensitive and needs purpose-built role, authorization, audit, and redaction gates before socket writes.
- Treat the host-side frame method as a development frame publisher. The caller supplies already-encoded frame bytes; the runtime does not capture the screen or infer content.
- Treat the host-side input receive path as an audited development intent receiver only. The runtime records/announces safe metadata but does not inject OS input.
- Keep accepted local-send audit pre-write. If audit persistence fails, the remote interaction message is not sent, matching the existing safety posture for workflow side effects.
- Redact remote interaction messages in runtime events by replacing frame data and input details with byte/count summaries, while leaving non-secret routing and authorization ids available for correlation.

## Risks / Trade-offs

- Development frame payloads may still contain sensitive visible content -> never log or emit raw frame bytes; audit only ids, dimensions, format, and byte length.
- Input intent can be abused if processed after pause/revoke -> check current runtime authorization immediately before every send and before accepting inbound intent.
- Additional runtime APIs duplicate some generic `send()` behavior -> accepted because sensitive flows need clearer fail-closed errors and audit ordering.
- This is not yet usable as real remote desktop control -> it creates a verified, safe message path that native adapters can bind to in a later OpenSpec change.
