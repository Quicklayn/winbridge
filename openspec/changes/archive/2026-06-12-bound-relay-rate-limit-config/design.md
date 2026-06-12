## Context

The development relay uses in-memory sliding-window rate limiters for invalid shared-token attempts and malformed or rejected protocol messages. Environment overrides already require canonical decimal integers, but only enforce minimum values. This leaves two fail-late cases:

- A huge window can be accepted at startup and later produce an invalid `resetAt` timestamp when a limiter consumes an attempt.
- A huge limit can unintentionally make development abuse protection ineffective while still appearing configured.

## Goals / Non-Goals

**Goals:**

- Enforce explicit upper bounds before a limiter is constructed or used.
- Keep defaults unchanged.
- Preserve canonical parsing and existing lower bounds.
- Keep rate-limit audit metadata bounded and secret-safe.

**Non-Goals:**

- No production-grade distributed rate limiter.
- No change to relay WebSocket protocol, token comparison, audit event schema, or peer-facing rejection reason strings.
- No native Windows capture/input, installer, startup, service, token format, or privilege changes.

## Decisions

1. Use separate bounds for limit and window.

   The limit is a count bound, not a timer. A development maximum of `1_000_000` is large enough for local testing while preventing accidental unbounded memory growth. The window remains aligned with JavaScript timer-safe values at `2_147_483_647` milliseconds.

2. Validate both constructor and environment paths.

   Tests and integration helpers can instantiate `SlidingWindowRateLimiter` directly. Constructor validation prevents bypassing environment parsing, while environment validation keeps startup diagnostics tied to the variable name.

3. Keep rejection messages generic and configuration-only.

   Error text names the malformed environment variable or limiter field but does not include raw tokens, pairing codes, credentials, protocol payloads, or local file paths.

## Risks / Trade-offs

- Local scripts using very large values will fail at startup. Mitigation: documented bounds are explicit and still far above normal development use.
- The count bound is a product choice rather than a protocol limit. Mitigation: keep it scoped to the development limiter and document production abuse protection as future distributed work.
