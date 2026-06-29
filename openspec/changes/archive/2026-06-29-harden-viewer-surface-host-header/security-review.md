# Security Review: Harden viewer surface Host header

## Scope

Reviewed changes to:

- `apps/agent-shell/src/viewer-local-control-surface.ts`
- `apps/agent-shell/src/viewer-local-control-surface.test.ts`
- `docs/security-model.md`
- `docs/architecture.md`
- `docs/threat-model.md`

## Findings

- The local surface still binds only to `127.0.0.1` and still prints the
  canonical loopback URL for operators.
- All routes now reject missing or mismatched Host headers before serving HTML,
  sanitized status, frame bytes, input behavior, or disconnect behavior.
- Existing mutation guards remain in place: same-origin plus per-run local token
  are still required for `/input` and `/disconnect`.
- Rejection responses are bounded JSON and do not echo Host values, local paths,
  authorization IDs, mutation tokens, command contents, input details, frame
  bytes, or diagnostics.
- No capture, input schema, relay routing, production authentication, installer,
  startup, service, privilege, persistence, hidden-session, keylogging,
  credential access, AV/EDR evasion, or Windows prompt-bypass behavior was
  added or weakened.

## Residual Risk

This is still a development local HTTP surface that intentionally displays the
latest authorized frame to the local viewer browser. Operators should open the
printed `127.0.0.1` URL directly and keep the viewer machine trusted during MVP
trials.
