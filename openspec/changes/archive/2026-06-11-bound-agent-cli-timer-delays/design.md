## Context

The non-native agent shell simulates host workflow transitions with `setTimeout`: authorization expiration, permission revocation, pause, resume, and termination. The CLI currently accepts any exact non-negative integer for those delay values. Node timers cannot represent delays above the signed 32-bit bound reliably; oversized values can be clamped or overflowed by the runtime.

This change hardens development workflow simulation only. It does not change the protocol authorization state machine, relay behavior, or any remote action capability.

## Goals / Non-Goals

**Goals:**

- Reject oversized timer delay values during CLI parsing.
- Use a single shared maximum matching the safe `setTimeout` delay range.
- Keep `0` valid for focused boundary simulations that already exist in tests.
- Preserve omitted timer behavior.

**Non-Goals:**

- No durable scheduler or production timeout service.
- No changes to grant expiration semantics beyond rejecting unrepresentable CLI timer values.
- No capture, input, installer, startup, service, token, log, or privilege changes.

## Decisions

1. Validate timer bounds in `parseArgs`.

   CLI parsing already rejects malformed workflow options before opening the relay connection. Bounding timer options there prevents an invalid workflow schedule from reaching runtime. Alternative considered: clamp in runtime. Clamping would silently change operator intent and could still create surprising immediate lifecycle transitions.

2. Use `2_147_483_647` milliseconds as the maximum.

   This is the largest signed 32-bit millisecond delay used by JavaScript timer implementations. Values above it are not safe for the development workflow timers. Alternative considered: a smaller product-level limit, such as 24 hours. That would be a product policy decision beyond this safety hardening.

3. Keep zero valid.

   Existing tests use zero-delay expiration boundary behavior, and immediate simulation can be useful for development. The safety issue is oversized values overflowing, not zero.

## Risks / Trade-offs

- Scripts that used very long timer values will now fail fast. They can use values up to the safe timer bound or omit the timer.
- This does not solve production scheduling. Production reconnect/session expiry needs a separate OpenSpec change with durable time semantics.
