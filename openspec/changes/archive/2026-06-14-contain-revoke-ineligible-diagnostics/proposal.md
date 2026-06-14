## Why

Scheduled host revoke is a consent-safety workflow: the host may configure a delayed permission revoke, but the runtime must only revoke permissions that are present in the active host-approved grant. When the configured revoke permission is missing or outside the narrowed active grant, the runtime correctly treats the scheduled revoke as ineligible and leaves the active authorization unchanged.

Those ineligible paths still write optional diagnostics through the configured logger. A failing diagnostic logger can surface a runtime error after the active visible authorization has already been accepted, even though the correct outcome is a bounded local no-op with no revoke messages.

## What Changes

- Treat scheduled revoke ineligible diagnostics as best-effort when no revoke permission is configured or when the configured permission is not in the active grant.
- Preserve existing scheduled revoke eligibility rules and bounded diagnostic text for working loggers.
- Add integration coverage proving a logger failure for an out-of-grant scheduled revoke does not emit runtime errors or revoke/control/audit messages.
- No breaking changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: scheduled revoke ineligible diagnostic logger failures must be contained and remain secret-safe/non-authorizing.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`, `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected systems: non-native agent-shell host scheduled revoke diagnostics/logs.
- Safety impact: strengthens consent-first lifecycle behavior by preventing optional diagnostics from turning an ineligible revoke no-op into a runtime error.
- Touches: host lifecycle workflow diagnostics and logs.
- Does not touch: capture, input, relay admission, shared tokens, native Windows APIs, installer, services, privilege elevation, startup persistence, or production authentication semantics.
- Non-goals: no covert access, hidden sessions, stealth persistence, credential collection, keylogging, AV/EDR evasion, or Windows prompt bypass.
