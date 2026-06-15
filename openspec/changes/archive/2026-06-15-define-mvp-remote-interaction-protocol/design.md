## Context

The current stack already has a WebSocket relay, protocol validation, authorization lifecycle, host consent controls, and bounded audit behavior. The MVP still needs a narrow remote interaction contract before native Windows adapters are added: the host must be able to send screen frames to the viewer, and the viewer must be able to send pointer or keyboard events back to the host after explicit permission grants.

## Goals / Non-Goals

**Goals:**

- Add explicit protocol envelopes for screen frames and input events.
- Bind every screen frame and input event to an authorization id so runtime code can enforce the existing consent-bound grant.
- Keep payloads bounded and structured enough for relay/runtime validation and future native adapter integration.
- Add tests for accepted messages, malformed messages, unknown fields, immutability, and secret-safe rejection behavior.

**Non-Goals:**

- No hidden capture, hidden input, unattended access, service installation, startup persistence, privilege elevation, AV/EDR evasion, credential collection, keylogging, clipboard access, file transfer, or Windows prompt bypass.
- No native Windows Desktop Duplication, Windows Graphics Capture, SendInput, UIAccess, installer, or background service implementation in this change.
- No production media codec negotiation, adaptive bitrate, NAT traversal, or peer-to-peer media path yet.

## Decisions

- Use first-class protocol envelopes instead of generic `signal` payloads for screen and input. This keeps sensitive remote interaction data out of generic signaling and gives the relay/runtime a clear validation boundary.
- Screen frames are host-originated and carry `authorizationId`, `frameId`, `sequence`, `capturedAt`, `format`, dimensions, and bounded base64 frame data. The schema validates structure only; authorization and role checks remain runtime responsibilities because the protocol package does not own session state.
- Input events are viewer-originated and carry `authorizationId`, `eventId`, `sequence`, `occurredAt`, and either pointer or keyboard details. Keyboard events use a discrete allowlist of non-text key names only and do not define text insertion, keylogging buffers, credential access, secure desktop bypass, or OS prompt bypass.
- Relay forwarding treats `screen-frame` as host-to-viewer only and `input-event` as viewer-to-host only. Accepted-forward audit records include message id, safe recipient metadata, and non-secret authorization id, but not frame bytes, key values, modifiers, pointer coordinates, button values, or raw payloads.
- Keep the initial payload limits conservative to fit the development relay and tests. Future native/codec work can tune limits through a separate OpenSpec change.

## Risks / Trade-offs

- Screen frame payloads can contain sensitive visible content -> require authorization id on every frame, keep audit/detail redaction behavior, and avoid logging frame bytes in tests or runtime diagnostics.
- Input events can be abused if processed after revoke -> require explicit permission mapping and later runtime/native adapters must call authorization checks before processing each event.
- Base64 frame transport is inefficient -> acceptable for a development MVP protocol; optimized media transport is a later change.
- Protocol schema cannot prove live authorization state -> relay enforces registered sender and recipient roles, while runtime/native integration must enforce permission and session state before native capture/input side effects.
