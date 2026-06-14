## Why

Interactive host consent can fail closed without a host approval when the prompt times out or returns an invalid/non-accepted decision. Those outcomes are consent boundaries: the runtime must not send approval, active state, control, signal, or workflow audit messages.

The runtime already returns a non-approving decision for these outcomes, but the accompanying diagnostic logger calls are direct. A failing optional logger can surface a runtime error even though the security outcome is already a bounded no-decision fail-closed path.

## What Changes

- Treat interactive host consent timeout diagnostics as best-effort.
- Treat interactive host consent invalid/no-accepted-decision diagnostics as best-effort.
- Preserve exact consent decisions, fail-closed behavior, and bounded diagnostic text for working loggers.
- Add integration coverage for throwing loggers on timeout and invalid consent diagnostics.
- No breaking changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: interactive host consent no-decision diagnostic logger failures must be contained and remain secret-safe/non-authorizing.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`, `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected systems: non-native agent-shell interactive host consent diagnostics/logs.
- Safety impact: strengthens fail-closed consent handling by preventing optional diagnostics from becoming runtime errors on non-approved consent outcomes.
- Touches: interactive host consent workflow diagnostics and logs.
- Does not touch: capture, input, relay admission, shared tokens, native Windows APIs, installer, services, privilege elevation, startup persistence, or production authentication semantics.
- Non-goals: no covert access, hidden sessions, stealth persistence, credential collection, keylogging, AV/EDR evasion, or Windows prompt bypass.
