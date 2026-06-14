## Why

Accepted inbound protocol messages already pass protocol validation and unsafe-input gates before the runtime emits a redacted local `received` event. A diagnostic logger failure while printing the accepted-message summary can still surface a runtime error and interrupt the consent workflow even though logging is not an authorization control.

## What Changes

- Treat accepted inbound protocol summary log output as best-effort diagnostics after local `received` event emission.
- Preserve protocol validation, unsafe inbound filtering, redaction, consent prompts, permission grants, host visibility, lifecycle handling, signal authorization, and audit persistence gates.
- Add integration coverage proving accepted inbound summary logger failure does not expose raw logger text or private request text and does not prevent the normal explicit host approval path.
- No breaking changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: accepted inbound protocol summary logger failures are contained and do not interrupt valid consent workflow processing.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts` and `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected specs: `openspec/specs/agent-shell-consent-workflow/spec.md`.
- Touches logs and the non-native agent-shell consent workflow.
- Does not touch capture, input implementation, relay admission, pairing tokens, installer behavior, startup persistence, services, native Windows APIs, privilege elevation, stealth behavior, credential access, AV/EDR behavior, or Windows prompt handling.
