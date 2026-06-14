## Why

Delayed host workflow suppression after peer or local disconnect is a safety boundary, while the companion skip log lines are diagnostics only. A diagnostic logger failure in those suppression paths can currently surface as a runtime error even though no revoke, pause, resume, terminate, expiration, disconnect, signal, or audit message should be sent after the connection is already disconnected.

## What Changes

- Treat delayed host workflow skip log output as best-effort diagnostics when the runtime has already decided not to send a lifecycle action.
- Preserve existing disconnected-state checks and authorization lifecycle gates.
- Add integration coverage proving logger failure does not expose raw logger text and does not send delayed lifecycle, control, permission, signal, or workflow audit messages.
- No breaking changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: delayed host workflow skip diagnostics must be best-effort and non-authorizing.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`, `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected systems: non-native agent-shell delayed host workflow diagnostics/logs after local or remote disconnect.
- Safety impact: strengthens fail-closed delayed workflow suppression by preventing optional logging from turning a suppressed action into a runtime diagnostic failure.
- Touches: host lifecycle workflow diagnostics and logs.
- Does not touch: capture, input, relay admission, shared tokens, native Windows APIs, installer, services, privilege elevation, startup persistence, production authentication semantics, or authorization grant resolution.
- Non-goals: no covert access, hidden sessions, stealth persistence, credential collection, keylogging, AV/EDR evasion, or Windows prompt bypass.
