## Context

`reportRuntimeError` is the shared path for surfacing sanitized runtime failures from consent workflow handling and direct host controls. It emits a generic local runtime error event and writes a redacted `runtime error messageBytes=...` log line. The event is sanitized, but the logger call itself is not currently contained.

This path is security-adjacent because it runs after failures in audited authorization workflows. A diagnostic logger exception must not replace the sanitized runtime error thrown to caller code or change fail-closed protocol behavior.

## Goals / Non-Goals

**Goals:**

- Keep sanitized runtime error events unchanged.
- Keep redacted runtime error logging when the logger succeeds.
- Contain runtime error logger exceptions so direct controls still throw `Agent shell runtime error`.
- Prove no denied/active/lifecycle/control/audit protocol messages are sent because of the logger failure.

**Non-Goals:**

- No change to audit persistence requirements or failure semantics.
- No change to consent approval, visible activation, lifecycle authorization, signal authorization, or relay behavior.
- No new capture, input, reconnect, installer, service, startup persistence, token, or privilege behavior.

## Decisions

- Wrap only `options.logger?.error(...)` inside `reportRuntimeError` in a local `try/catch`.
  - Rationale: the error event remains the authoritative local diagnostic, while logger output is optional observability.
  - Alternative considered: switch all callers to `reportRuntimeErrorBestEffort`; rejected because the existing primary path should still allow event callback behavior to remain explicit, and the change should be limited to logger containment.

- Test a direct host pause audit failure with a throwing runtime error logger.
  - Rationale: direct controls synchronously throw to caller code, so the test proves logger exceptions cannot replace the sanitized error contract.
  - Alternative considered: test only asynchronous authorization handling; rejected because it is less direct at proving the thrown-error contract.

## Risks / Trade-offs

- Logger failure is swallowed in this path. Mitigation: the sanitized runtime error event is still emitted before the logger call, and raw logger exception text is not safe to surface.
- The test adds another integration scenario to a large suite. Mitigation: it reuses existing relay/runtime helpers and targets one specific failure path.
