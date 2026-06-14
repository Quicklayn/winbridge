## Context

`canSendHostAuthorizationDecision` rejects delayed approval/denial output if the viewer that requested authorization is no longer the observed connected viewer. The rejection currently logs the reason directly through the optional runtime logger. Other consent workflow diagnostics are already routed through best-effort helpers so logger failures cannot become protocol behavior.

This change is security-adjacent because it touches the host authorization failure path and logs, but it does not add a new remote capability.

## Goals / Non-Goals

**Goals:**

- Keep authorization decision skip diagnostics observable when the logger works.
- Contain logger failures after the runtime has decided not to send an authorization decision.
- Preserve fail-closed behavior: no decision, state, audit, indicator, capture, input, reconnect, or hidden-session behavior.
- Keep raw logger exception text out of runtime events and logs.

**Non-Goals:**

- No change to host approval semantics, authorization state transitions, audit persistence, or peer availability checks.
- No change to relay signaling, protocol schemas, native Windows APIs, installer/startup/service behavior, tokens, or privilege handling.
- No attempt to recover or reconnect the viewer after it has disconnected.

## Decisions

- Use the existing `logRuntimeMessageBestEffort(options, message)` helper for the viewer-disconnected authorization decision skip diagnostic.
  - Rationale: this matches the existing containment pattern for other consent workflow diagnostics and avoids a new abstraction.
  - Alternative considered: wrap the single call in a local `try/catch`; rejected because it would duplicate an established helper and drift from surrounding code.

- Add an integration test around the existing interactive consent race where the viewer disconnects before the host decision resolves.
  - Rationale: this exercises the real asynchronous path and proves the logger failure does not send authorization workflow messages.
  - Alternative considered: add a unit-only helper test; rejected because the behavior depends on runtime event ordering, socket state, and session state.

## Risks / Trade-offs

- A swallowed logger exception can make local logger failures less visible. Mitigation: this path already represents diagnostic-only output after a fail-closed decision; surfacing the logger exception would be more harmful than losing a diagnostic line.
- Test timing can be flaky if it depends on fixed sleeps only. Mitigation: wait for provider start and trusted disconnect events before resolving the decision, then use a bounded delay only to flush forbidden messages.
