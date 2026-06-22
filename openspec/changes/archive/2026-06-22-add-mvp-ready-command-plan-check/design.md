## Context

The root `mvp:ready` helper is the main local gate before a two-PC MVP trial. It already runs doctor and native preflight by default, and can optionally run the local smoke workflow. The generated command plan from `mvp:commands` is the next user-facing step, so a broken command-plan helper can still block live MVP use after readiness passes.

## Goals / Non-Goals

**Goals:**

- Add a default readiness step that validates the command-plan generator can render bounded JSON.
- Keep the step non-executing and local-only.
- Preserve fail-fast behavior and bounded output.
- Keep smoke explicit and after all default readiness checks.

**Non-Goals:**

- Do not execute generated session commands.
- Do not start relay, host, viewer, browser, capture, input, services, startup persistence, or unattended work.
- Do not add production account authentication, production UI, NAT traversal, or native Windows client behavior.
- Do not expose command strings, pairing codes, relay tokens, child output, frame paths, audit paths, frame bytes, or raw input details through `mvp:ready` output.

## Decisions

- Run `mvp:commands -- --json` as the command-plan check instead of importing the helper. This exercises the same root npm script path users rely on before a trial.
- Treat command-plan stdout as untrusted child output. `mvp:ready` will only check that the final JSON-looking line parses as `ok: true` and contains a non-executing session plan. It will not surface raw command strings.
- Insert the command-plan step after doctor and native preflight. This preserves low-cost environment validation first and keeps smoke as the final explicit optional runtime check.
- Reuse the existing bounded output capture and fail-closed reason mapping. Unexpected JSON, missing command metadata, child failure, or spawn failure becomes bounded `exit-nonzero` or `spawn-failed` metadata.

## Risks / Trade-offs

- Child JSON parsing can become too strict if the command-kit JSON shape changes. Mitigation: validate only the stable contract needed by ready: `ok`, `mode=session`, `nonExecuting=true`, and fixed command names.
- Running another npm script adds a small readiness delay. Mitigation: the check is local and non-runtime; it is cheaper than discovering a broken command plan during a two-PC trial.
- The command plan contains sensitive runnable details. Mitigation: ready output reports only `command-plan=ok` or bounded failure status, never command strings or child stdout/stderr.
