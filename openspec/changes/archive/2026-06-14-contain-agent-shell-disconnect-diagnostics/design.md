## Context

The managed agent shell already treats host-local disconnect differently from other host workflow actions: audit persistence failures are reported through sanitized diagnostics, but disconnect still needs to deactivate the local indicator and close the local WebSocket. That behavior preserves the host's immediate revocation path in the development workflow.

The current implementation reports audit failures through `reportRuntimeError()` before closing the socket. If the configured `onEvent` callback or logger throws while reporting that diagnostic, the callback failure can escape and stop the later cleanup steps.

## Goals / Non-Goals

**Goals:**

- Keep local host disconnect cleanup authoritative when disconnect audit persistence fails.
- Keep diagnostic event and logger callback failures best-effort for the local disconnect cleanup path.
- Preserve fail-closed audit behavior for approval, denial, revocation, pause, resume, termination, and expiration protocol sends.
- Keep emitted diagnostics static or bounded and avoid raw audit sink, logger, close reason, pairing, token, payload, credential, or remote-content text.

**Non-Goals:**

- No protocol schema changes or new workflow messages.
- No native Windows UI, capture, input, clipboard, file transfer, diagnostics access, reconnect, installer, startup, service, privilege, credential, or hidden-session behavior.
- No production audit durability change beyond the current development audit sink contract.

## Decisions

1. Add a disconnect-specific best-effort diagnostic helper.
   - Rationale: local disconnect is the host escape hatch and cleanup must not depend on optional diagnostic callbacks.
   - Alternative considered: make all runtime diagnostics best-effort. Rejected because existing non-disconnect workflow actions deliberately fail closed before sending lifecycle protocol messages when audit persistence fails.

2. Keep the authoritative disconnect order simple: attempt local audit, mark local peer disconnected, deactivate the indicator, attempt static log, then close the socket.
   - Rationale: each step after the audit attempt reduces authorization surface. Logger failure must not block the socket close.
   - Alternative considered: move the socket close before indicator deactivation. Rejected because local state should fail closed before asynchronous transport closure completes.

3. Do not include caught diagnostic error text in logs or runtime events.
   - Rationale: callback errors may contain raw sink error text or private markers. Existing diagnostics rely on byte counts and sanitized error labels.
   - Alternative considered: include error class/message for troubleshooting. Rejected because this path is safety-sensitive and secret-safe diagnostics are more important than detail.

## Risks / Trade-offs

- Audit failure may still lose the local disconnect audit record. Mitigation: the host disconnect itself remains authoritative, and sanitized best-effort diagnostics can still be emitted when callbacks cooperate.
- Swallowing diagnostic callback errors reduces troubleshooting detail. Mitigation: this is intentionally limited to local disconnect cleanup; other audited workflow actions keep fail-closed behavior.
- Tests that simulate throwing callbacks can be timing-sensitive. Mitigation: regression tests should wait for relay-observed peer disconnect and local closed events, not just synchronous return.
