## Context

The relay currently validates protocol envelopes before forwarding, but the `signal` envelope treats `payload` as an arbitrary record. Future negotiation data needs to remain opaque to the relay, while safety-critical bounds still belong in the shared protocol schema so every sender, receiver, and relay applies the same fail-closed rules.

## Goals / Non-Goals

**Goals:**

- Enforce a shared `signal.payload` safety contract in `packages/protocol`.
- Reject empty payloads, oversized payloads, and payloads containing obvious sensitive remote-assistance key names at any nesting level.
- Preserve valid small signaling metadata such as future offer/answer/ICE objects.
- Verify that the relay rejects unsafe signal messages before forwarding and records only secret-safe rejection metadata.

**Non-Goals:**

- No WebRTC signaling semantics, SDP parsing, NAT traversal, or transport encryption changes.
- No screen capture, input control, clipboard, file transfer, native Windows APIs, installer, startup, services, or privilege elevation.
- No production identity or authorization replacement for the development relay token.

## Decisions

- Put validation in `SignalMessageSchema`, not only in relay code. This gives the relay, agent shell, tests, and future clients one shared contract and avoids duplicated edge cases.
- Keep the payload structurally opaque apart from safety bounds. The schema will not require WebRTC-specific fields because the project has not introduced that feature yet.
- Use a serialized JSON byte limit as the payload size guard. This matches the actual protocol envelope transport shape and gives a deterministic bound before forwarding.
- Reject obvious sensitive key names recursively instead of redacting signal payloads. Signal messages are operational data, not audit records; redaction could mutate signaling state and hide a sender bug. Rejection is safer and easier to test.
- Keep relay audit detail at the existing summary level (`registered`, rate-limit metadata) and avoid logging the rejected payload.

## Risks / Trade-offs

- Future legitimate signaling metadata could use a currently forbidden key name -> require an explicit OpenSpec change and security review before allowing it.
- Serialized size checks add a small parse-time cost -> keep the limit modest and apply only to `signal` messages.
- Rejection changes behavior for peers that previously used `signal` to move arbitrary data -> intentional narrowing; arbitrary data transfer is not a remote-assistance capability in current scope.
