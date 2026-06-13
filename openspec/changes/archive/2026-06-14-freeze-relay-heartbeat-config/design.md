## Context

The development relay heartbeat is a transport liveness mechanism. It sends WebSocket pings and terminates peers that miss pong responses inside the configured timeout. Existing validation rejects malformed environment and injected heartbeat timers, but injected settings are plain mutable objects.

Because `createRelayRuntime({ heartbeat })` stores the normalized heartbeat config for later connection handling, returning the caller-owned object from normalization allows post-validation mutation to affect future timers.

## Goals / Non-Goals

**Goals:**

- Snapshot validated injected heartbeat interval and timeout values.
- Prevent caller-owned heartbeat config objects from changing runtime heartbeat behavior after validation.
- Keep errors bounded and keep existing timer bounds unchanged.

**Non-Goals:**

- No production liveness or reconnect semantics.
- No persistent session recovery.
- No capture, input, clipboard, file-transfer, diagnostics, installer, startup, service, token, logging, or privilege changes.

## Decisions

1. Return a fresh normalized config object.

   The normalization helper will validate both timer values and then return a new object with only `intervalMs` and `timeoutMs`. This is enough to sever caller ownership without changing the public shape.

2. Keep the runtime code path using the shared helper.

   `createRelayRuntime()` already normalizes injected heartbeat settings centrally. Once the helper returns a snapshot, runtime creation inherits the protection without a separate branch.

## Risks / Trade-offs

- Callers that expected object identity from `normalizeRelayHeartbeatConfig()` will no longer receive the same object. This is acceptable because normalization is a validation boundary.
- The returned object remains a normal JavaScript object. Internal code does not expose it, so copying is sufficient for the runtime boundary.
