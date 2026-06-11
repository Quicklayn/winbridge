## Context

The development relay already validates decoded protocol envelopes and rate-limits rejected messages. However, size checks happen only after the message is converted to a string and parsed. Raw byte bounding belongs in the relay transport boundary, before JSON parsing and protocol schema validation.

## Goals / Non-Goals

**Goals:**

- Enforce a deterministic maximum raw inbound WebSocket message size in the relay.
- Reject oversized messages at the WebSocket transport cap and again before converting accepted raw message data to strings or decoding protocol envelopes.
- Reuse the existing `relay.message.rejected` audit path and invalid-message limiter.
- Keep rejection reasons bounded and secret-safe.

**Non-Goals:**

- No configurable production quota system or distributed rate limiter.
- No WebRTC, NAT traversal, capture, input, clipboard, file transfer, installer, startup, services, or privilege elevation changes.
- No changes to protocol payload schemas beyond relying on existing validation after the raw size gate passes.

## Decisions

- Configure the WebSocket server `maxPayload` to the relay message byte bound and keep an application-level size gate before `data.toString()`. The transport cap prevents large-frame buffering, while the application gate keeps the relay invariant explicit for all delivered `RawData` values.
- Use a fixed development limit in code for now. The relay is still explicitly a development relay, and production sizing/configuration should be introduced through a future OpenSpec change.
- Count oversized messages through the existing invalid-message limiter on both application-level rejects and transport `maxPayload` errors. Oversized messages are abuse attempts or malformed protocol messages from the relay's perspective.
- Audit only safe metadata and the bounded rejection reason. The raw bytes and decoded payload are never included in the audit detail.

## Risks / Trade-offs

- Legitimate future signaling messages may need a larger limit -> require a future OpenSpec change with production sizing rationale.
- Fixed limit is less flexible than environment configuration -> acceptable for the current development relay scope and simpler to test.
- Transport-level rejection can close the WebSocket before a relay error can be sent -> acceptable because forwarding is prevented and audit/rate-limit accounting still happens.
- Rejection occurs before protocol type is known -> audit cannot include a message type for oversized messages, which is intentional to avoid parsing untrusted oversized data.
