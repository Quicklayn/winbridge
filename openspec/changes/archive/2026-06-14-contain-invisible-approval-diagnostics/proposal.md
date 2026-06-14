## Why

When a host approves a request with `visibleToHost=false`, the runtime intentionally sends only the approval decision and approval audit event, then withholds active visible state. The diagnostic log that explains this withheld active state can currently throw and surface a runtime error even though logging is not part of the consent or visibility gate.

## What Changes

- Treat the "active state withheld because visible session is false" diagnostic log as best-effort after the approval decision and approval audit event are sent.
- Preserve the existing fail-closed behavior: no active state, no host indicator, no signal authorization, no capture, and no input when visible session state is false.
- Add integration coverage proving logger failure does not emit runtime error or expose raw logger text while invisible approval remains non-active.
- No breaking changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: invisible approval diagnostic logger failures are contained without changing approval, visibility, audit, or signal authorization semantics.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts` and `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected specs: `openspec/specs/agent-shell-consent-workflow/spec.md`.
- Touches logs and the non-native agent-shell consent workflow.
- Does not touch capture, input implementation, relay admission, pairing tokens, installer behavior, startup persistence, services, native Windows APIs, privilege elevation, stealth behavior, credential access, AV/EDR behavior, or Windows prompt handling.
