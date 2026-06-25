## Context

`emitHostIndicator()` already formats a secret-safe marker:
`[winbridge-agent] host indicator ...`. The runtime writes that marker through
its optional logger. The CLI currently creates the runtime without a logger, so
the marker is observable in direct runtime tests but not in the real child
process output consumed by `mvp:smoke`.

## Goals / Non-Goals

**Goals:**

- Make the existing bounded host indicator marker visible in the real
  agent-shell CLI output.
- Keep `mvp:smoke` strict about active, visible, positive-permission indicator
  metadata.
- Add focused regression coverage for the real CLI wiring.

**Non-Goals:**

- No changes to authorization decisions, permission grants, capture, input,
  relay routing, audit records, native adapters, services, startup,
  persistence, privilege, or browser behavior.
- No raw protocol payload, pairing code, token, reason, screen, frame, input,
  clipboard, file-transfer, or diagnostics dump logging.

## Decisions

- Wire the existing runtime logger to `console` in the CLI.
  - Rationale: the runtime already centralizes bounded/redacted diagnostic
    logging, and the smoke process already captures child stdout/stderr.
  - Alternative considered: duplicate indicator formatting in `index.ts` from
    `onEvent`. That would create a second formatter that can drift from the
    runtime's reviewed indicator line.
- Keep the smoke parser unchanged.
  - Rationale: the failure is missing CLI output, not an overly strict
    readiness invariant.

## Risks / Trade-offs

- CLI output becomes more verbose.
  - Mitigation: runtime diagnostics are already bounded and redacted; tests
    cover secret-safe runtime logging for indicator and protocol summaries.
- Logging failures must not affect cleanup.
  - Mitigation: runtime logging is already best-effort and catches logger
    failures.
