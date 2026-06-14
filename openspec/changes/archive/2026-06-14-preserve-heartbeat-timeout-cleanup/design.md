## Context

The development relay has existing containment helpers for post-send delivery audit and post-cleanup disconnect audit. The heartbeat timeout path currently writes `relay.peer.heartbeat.timeout` directly before `socket.terminate()`, which means an audit sink exception can stop termination and prevent the registered peer from entering normal close cleanup.

This change is limited to relay heartbeat timeout observability. It does not add remote assistance capabilities or alter host consent, visibility, authorization, capture, input, installer, startup, token, service, or privilege behavior.

## Goals / Non-Goals

**Goals:**

- Keep heartbeat timeout termination and room cleanup fail-closed when timeout audit persistence fails.
- Keep timeout audit diagnostics bounded and secret-safe.
- Contain logger failures while reporting timeout audit failure.
- Preserve the existing heartbeat timeout audit schema when audit persistence succeeds.

**Non-Goals:**

- No change to heartbeat timing semantics, pairing, authorization, consent, capture, input, token validation, or Windows-native behavior.
- No retry queue, durable audit buffering, or new external dependency.
- No exposure of raw audit sink errors, logger errors, close reasons, pairing codes, protocol payloads, credentials, remote content, or full secrets.

## Decisions

- Add a relay-local `writeRelayHeartbeatTimeoutAudit` helper.
  - Rationale: it mirrors existing delivery/disconnect audit containment while keeping timeout-specific metadata in one place.
  - Alternative considered: wrapping the direct `writeRelayAudit` call inline. That would fix the immediate throw path but would duplicate the established containment pattern and make logger failure handling easier to miss.

- Pass the relay logger into `startPeerHeartbeat`.
  - Rationale: heartbeat timeout audit failures need bounded diagnostics, and existing runtime options already provide an optional logger for relay warnings.
  - Alternative considered: silently swallowing timeout audit failures. That would preserve cleanup but remove useful operational signal.

- Preserve timeout termination as the primary side effect.
  - Rationale: once the relay decides a peer missed the heartbeat timeout, socket termination and close cleanup must not depend on post-decision observability.
  - Alternative considered: failing closed by closing the whole room when timeout audit fails. That is broader than needed and could disrupt healthy peers without improving safety.

## Risks / Trade-offs

- [Risk] A timeout audit sink failure means the timeout event itself is absent from audit storage.
  - Mitigation: emit a bounded warning and rely on the existing disconnect audit path during normal close cleanup when available.

- [Risk] The diagnostic logger can also throw.
  - Mitigation: catch logger failures and avoid exposing raw logger or audit sink text.

- [Risk] Very small heartbeat intervals in tests can be flaky on slow machines.
  - Mitigation: keep integration tests aligned with existing heartbeat test timing and assert behavior through protocol/audit observations rather than timer internals.
