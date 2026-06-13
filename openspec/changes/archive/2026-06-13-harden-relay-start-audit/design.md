## Context

The relay runtime exposes a programmatic `start()`/`stop()` lifecycle shared by the CLI and integration tests. In development mode without a shared relay token, `start()` currently warns and writes an accepted `relay.start.development-mode` audit event before `server.listen()` completes. That ordering can create an accepted audit record for a relay that never bound its socket.

This change touches relay startup, logs, and audit behavior only. It does not add peer capabilities, authentication, capture, input, installer behavior, service behavior, token parsing, or privilege behavior.

## Goals / Non-Goals

**Goals:**

- Ensure accepted startup audit records describe only successful relay listener starts.
- Ensure a startup audit sink failure after bind does not leave the relay listener open.
- Ensure duplicate active `start()` calls fail before another listener attempt, warning, or startup audit write.
- Keep peer registration, pairing, forwarding, heartbeat, and token validation behavior unchanged.

**Non-Goals:**

- No production authorization model or account identity changes.
- No reconnect or distributed relay lifecycle work.
- No native Windows capture/input/UI work.
- No hidden startup, hidden session, persistence, service installation, credential handling, or Windows security prompt bypass.

## Decisions

1. Track runtime start state inside `createRelayRuntime`.

   Rationale: `server.listening` is false while `listen()` is still pending, so it is not enough to prevent concurrent duplicate starts. A small internal state machine can reject both `starting` and `started` states before any observable side effects.

   Alternative considered: rely on Node's server errors for duplicate starts. Rejected because the second call could still emit warnings/audit before the error, preserving the false-history problem.

2. Emit development-mode warning and accepted audit only after `listen()` resolves.

   Rationale: the accepted event should represent an actual listener. Failed bind attempts already surface through startup failure handling and must not be recorded as accepted relay service.

   Alternative considered: emit a denied/failed audit record for failed bind. Rejected for this change because the existing runtime does not define startup failure audit semantics, and startup errors are already reported by the caller with sanitized diagnostics.

3. Keep `stop()` behavior scoped to closing clients and servers.

   Rationale: the lifecycle guard is needed for start side effects. The existing stop path already treats an unlistening HTTP server as closed, and this change does not require altering shutdown semantics.

## Risks / Trade-offs

- Duplicate-start error text becomes part of test-observed behavior -> Keep it generic and secret-free.
- State drift if `listen()` fails after marking the runtime as starting -> Reset state in the catch path before rethrowing the original error.
- Listener remains open if accepted startup audit fails after bind -> Close the HTTP listener and reset state before rethrowing the audit error.
- A future restart-after-stop scenario may depend on Node server restart behavior -> Reset state after successful stop, while leaving restart coverage to a later explicit change if the product needs it.
