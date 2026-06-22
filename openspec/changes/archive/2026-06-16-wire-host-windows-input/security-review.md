## Security Review

Scope reviewed:

- `apps/agent-shell` host input application runtime and CLI wiring.
- Inbound `input-event` authorization, routing, audit, adapter, diagnostics, and redaction behavior.
- `@winbridge/windows-input` dependency use from agent-shell only after explicit host opt-in.
- Documentation and OpenSpec impact for MVP remote-control boundaries.

Findings:

- Host input application is disabled by default and host-only.
- CLI opt-in requires local audit via `--audit-log` or `WINBRIDGE_AGENT_AUDIT_LOG_PATH`; direct runtime opt-in also requires `auditSink`.
- Viewer runtimes reject host input application options before relay startup.
- Native input is invoked only after existing inbound remote-interaction gates accept role direction, peer binding, optional target peer, session id, authorization id, visible active unexpired state, and the required `input:pointer` or `input:keyboard` permission.
- The host writes metadata-only input-application audit before adapter invocation; audit failure blocks adapter invocation and trusted received events.
- Adapter failures are reported as generic runtime errors and withhold trusted received events.
- Runtime events, logs, and audit records redact pointer coordinates, button values, key values, modifiers, raw input payloads, tokens, pairing codes, credentials, command output, and private reason text.
- The change adds no input capture, keylogging, clipboard sync, file transfer, diagnostics collection, services, startup persistence, privilege elevation, unattended access, AV/EDR evasion, Windows prompt bypass, hidden session behavior, or host indicator suppression.

Verification performed:

- Focused runtime integration tests for authorized pointer and keyboard adapter invocation after audit.
- Disabled opt-in, missing audit, audit failure, stale/lost authorization, wrong permission, and adapter failure tests.
- CLI parsing tests for host-only opt-in, audit requirement, viewer rejection, and default disabled behavior.
- TypeScript check for `@winbridge/agent-shell`.

Residual risk:

- This is still a development agent-shell path, not a production viewer/host UI. Production remote-control UX, identity, transport hardening, installer behavior, and broader E2E tests require separate OpenSpec changes and review.
