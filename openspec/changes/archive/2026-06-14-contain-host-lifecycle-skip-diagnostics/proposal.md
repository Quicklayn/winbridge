## Why

Host lifecycle timers and direct workflow checks already fail closed when a lifecycle action is no longer eligible: the authorization may be terminal, expired, already paused, not paused, missing a permission, lacking visible active state, or configured with a resume delay but no pause delay. These skip paths are safety boundaries; they must not send lifecycle/control/audit messages or change grants.

Most delayed transport skip diagnostics are already best-effort, but several lifecycle-specific skip diagnostics still call the optional logger directly. A failing logger can surface a runtime error even though the correct outcome is an already-decided no-op.

## What Changes

- Treat host lifecycle skip diagnostics as best-effort for ineligible revoke, pause, resume, terminate, expiration, and local disconnect paths.
- Treat the resume-without-pause configuration diagnostic as best-effort.
- Preserve successful lifecycle behavior, audit persistence gates, authorization snapshots, host indicator behavior, and protocol send ordering.
- Add integration coverage for terminal lifecycle skip logger failure and resume-without-pause configuration logger failure.
- No breaking changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: host lifecycle skip diagnostic logger failures must be contained and remain secret-safe/non-authorizing.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`, `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected systems: non-native agent-shell host lifecycle diagnostics/logs.
- Safety impact: strengthens fail-closed lifecycle behavior by preventing optional diagnostics from becoming runtime errors after an ineligible lifecycle action is declined.
- Touches: host lifecycle workflow diagnostics and logs.
- Does not touch: capture, input, relay admission, shared tokens, native Windows APIs, installer, services, privilege elevation, startup persistence, or production authentication semantics.
- Non-goals: no covert access, hidden sessions, stealth persistence, credential collection, keylogging, AV/EDR evasion, or Windows prompt bypass.
