## Why

Host indicator emission is a consent and visibility boundary, while its companion log line is local diagnostics only. A failing diagnostic logger after indicator emission can currently interrupt the visible approval path before active state and audit messages are sent.

## What Changes

- Treat host indicator log output as best-effort diagnostics after the local indicator event is emitted.
- Preserve the existing host indicator event emission and authorization/audit ordering.
- Add integration coverage proving indicator logger failure does not expose raw logger text and does not block active visible state or active audit emission.
- No breaking changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: host indicator diagnostic logger failures must be contained and remain secret-safe/non-authorizing.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`, `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected systems: non-native agent-shell host visible-session indicator diagnostics/logs.
- Safety impact: strengthens the visible approval path by preventing a diagnostic logger failure from blocking active state/audit after a host-visible indicator event.
- Touches: host visibility workflow and logs.
- Does not touch: capture, input, relay admission, shared tokens, native Windows APIs, installer, services, privilege elevation, startup persistence, or production authentication semantics.
- Non-goals: no covert access, hidden sessions, stealth persistence, credential collection, keylogging, AV/EDR evasion, or Windows prompt bypass.
