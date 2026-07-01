## Context

The agent shell already exposes host lifecycle controls through an interactive terminal prompt and exposes a viewer-only loopback local surface for development MVP checks. The host needs an equivalent visible local browser surface for status and lifecycle control, but it must not create a remote-control channel or weaken runtime authorization.

The implementation remains in the non-native TypeScript agent shell. It uses the existing host runtime operations as the authority for pause, resume, revoke, terminate, and disconnect.

## Goals / Non-Goals

**Goals:**

- Add a host-only loopback HTTP surface that starts only when explicitly requested by CLI option.
- Expose sanitized host status through `GET /status`.
- Expose visible lifecycle controls through token-protected local POST requests.
- Reuse existing host command parsing and runtime operations so terminal and browser controls stay consistent.
- Keep the surface bound to `127.0.0.1`, no-store/nosniff, and closed with CLI shutdown.

**Non-Goals:**

- No remote-access web service, LAN binding, automatic browser launch, background service, startup persistence, or production authentication model.
- No screen capture, input injection, clipboard, file transfer, diagnostics dump, remote shell, credential access, or Windows prompt bypass.
- No change to relay protocol contracts or native Windows APIs.

## Decisions

1. Implement a dedicated `host-local-control-surface.ts` module.
   - Rationale: the viewer surface has frame and input-specific behavior that would make a shared abstraction noisy. A focused host module keeps security checks readable and testable.
   - Alternative considered: extend the terminal prompt only. Rejected because MVP needs a visible local host control surface, not only stdin controls.

2. Reuse host control command parsing and runtime dispatch.
   - Rationale: `pause`, `resume`, `revoke`, `terminate`, and `disconnect` should behave identically from terminal and browser surfaces.
   - Alternative considered: duplicate command mapping in the HTTP surface. Rejected to avoid drift in lifecycle controls.

3. Require `Host`, `Origin`, content type, and per-run token for mutations.
   - Rationale: loopback-only binding is not enough to protect local mutation endpoints from confused-origin requests. The same layered guard model already exists for the viewer local surface.
   - Alternative considered: token-only POST protection. Rejected because it weakens request provenance checks.

4. Stop the host local surface after accepted `terminate` or `disconnect`.
   - Rationale: the visible control listener should not keep serving lifecycle controls after terminal session end.
   - Alternative considered: leave the listener alive until process shutdown. Rejected because the terminal controls already stop on these accepted actions.

## Risks / Trade-offs

- Local browser page can trigger host lifecycle actions if the local token is exposed in page source. Mitigation: bind only to loopback, never log the token, require same-origin and exact Host, and keep token per-run.
- New CLI option can be misused outside host role. Mitigation: parser rejects viewer use and conflicts with one-shot host status output.
- Runtime operations can fail because authorization state changed. Mitigation: responses return bounded `failed` metadata without echoing raw errors, tokens, permissions, or command contents.
