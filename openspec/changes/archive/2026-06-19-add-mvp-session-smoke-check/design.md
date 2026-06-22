## Context

The command kit prints the manual MVP commands, and integration tests cover
many in-process relay/runtime cases. The remaining gap is an operator-facing
smoke command that starts the actual CLI entrypoints in a short local static
session and validates the concrete artifacts a user will inspect: frame output
and the loopback viewer surface.

## Goals / Non-Goals

**Goals:**

- Run from the root with `npm run mvp:smoke`.
- Use static development frames by default so the smoke check is deterministic
  and cross-platform.
- Start only visible local child processes for relay, host, and viewer, wait for
  the viewer surface and frame output, then stop every process.
- Keep diagnostics bounded and avoid echoing tokens, pairing codes, frame bytes,
  raw command output, or private paths beyond the configured smoke workspace.

**Non-Goals:**

- No production viewer UI, production host UI, WebRTC, native Windows capture,
  or OS input application.
- No browser automation, global input capture, clipboard, macros, file
  transfer, diagnostics collection, startup persistence, services, privilege
  elevation, unattended mode, or Windows prompt bypass.
- No replacement for the manual two-PC Windows MVP trial.

## Decisions

- Implement the smoke check as a root script in `scripts/` instead of adding
  behavior inside agent-shell. This keeps orchestration outside remote
  capability code and avoids widening runtime APIs.
- Spawn existing npm scripts with explicit bounded arguments and a generated
  temporary workspace under the OS temp directory. This exercises the same CLI
  entrypoints the README documents while keeping artifacts isolated.
- Use `--host-decision approve`, `--visible-session true`, static frame stream,
  viewer audit, explicit frame output, and loopback control surface. This
  verifies consent-bound transport without invoking Windows capture or OS input.
- Poll only bounded local readiness signals: relay listening text, viewer HTTP
  page, `/frame` response, frame file presence, and sanitized status text.

## Risks / Trade-offs

- [Risk] Child-process smoke checks can be slower or flaky on busy machines.
  -> Mitigation: keep default timeout bounded, use static frames, and always
  tear down children on failure.
- [Risk] The smoke check exercises one local same-machine path, not a full
  two-Windows-machine session.
  -> Mitigation: document it as a preflight check, not a production readiness
  guarantee.
- [Risk] Captured child output could reveal sensitive values.
  -> Mitigation: do not use relay tokens by default, avoid raw command echo in
  failure messages, and bound retained output.
