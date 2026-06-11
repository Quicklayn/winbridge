## Context

The host shell currently computes `expiresAt` from `authorizationTtlMs`, but it only sends the timestamp in approval/state messages. The simulator does not yet emit an expiration state when the TTL elapses. Revoke and terminate timers already use a shared host workflow state for fail-closed coordination.

This change stays in the non-native simulator. It does not implement production timers, durable audit persistence, native Windows UI, capture, input, clipboard, file transfer, services, startup persistence, or unattended access.

## Goals / Non-Goals

**Goals:**
- Let CLI users set authorization TTL with `--authorization-ttl-ms`.
- Schedule expiration only after explicit host approval and visible active state.
- Emit expired authorization state and a secret-safe expiration audit-event.
- Suppress expiration after terminal states such as revoked or terminated.
- Keep tests deterministic with short TTL values.

**Non-Goals:**
- No new protocol schema.
- No production scheduler or reconnect/session recovery design.
- No native Windows session indicator or disconnect UI.
- No screen capture, input, clipboard, file transfer, diagnostics export, services, startup persistence, credential access, or hidden access.

## Decisions

1. Reuse `authorizationTtlMs` as the expiration delay.
   - Rationale: the runtime already uses it to compute `expiresAt`, so the emitted expiration state can use the same lifecycle source.
   - Alternative considered: add a separate `hostExpireAfterMs`. Rejected because it would create two different TTL concepts in the simulator.

2. Track terminal workflow state.
   - Rationale: revoke final state, terminate, and expiration must fail closed and suppress later lifecycle timers for the same authorization.
   - Alternative considered: only suppress expiration after termination. Rejected because final revocation is also terminal.

3. Emit `session-authorization-state` with status `expired`.
   - Rationale: the protocol and authorization schema already support `expired`, and clients should observe that status like other lifecycle outcomes.

4. Keep expiration audit details secret-safe.
   - Detail fields include counts, booleans, and TTL milliseconds.
   - Raw reasons, pairing codes, tokens, credentials, display names, and payloads remain excluded.

## Risks / Trade-offs

- Timer race with revoke or terminate -> Terminal workflow state suppresses later timers.
- Short TTL flakiness in tests -> Use predicate-based waits and short but non-zero TTLs.
- Confusion with production scheduling -> Documentation labels this as development simulation only.

## Migration Plan

1. Refine host workflow state to track terminal status.
2. Add expiration scheduling after visible active state.
3. Add CLI parsing for `--authorization-ttl-ms`.
4. Add integration tests and docs.
5. Run check, tests, build, and OpenSpec validation.

Rollback is removing expiration scheduling and CLI TTL parsing while preserving existing approval, revoke, terminate, and audit behavior.

## Open Questions

- Production TTL enforcement across reconnects, clocks, and distributed relays remains future OpenSpec work.
