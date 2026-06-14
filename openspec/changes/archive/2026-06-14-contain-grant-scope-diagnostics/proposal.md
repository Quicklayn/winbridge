## Why

When configured host grant permissions are not a subset of the viewer's requested permissions, the agent shell intentionally fails closed without approving the request. The diagnostic log that explains this grant-scope mismatch can currently throw and surface a runtime error even though logging is not part of the authorization decision.

## What Changes

- Treat the "configured grant scope is not requested" diagnostic log as best-effort after the runtime decides to fail closed.
- Preserve the existing fail-closed behavior: no authorization decision, no active state, no host indicator, no workflow audit, no signal authorization, no capture, and no input when configured grant scope is not requested.
- Add integration coverage proving logger failure does not emit runtime error or expose raw logger text while the grant-scope mismatch remains non-authorizing.
- No breaking changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: configured grant-scope mismatch diagnostic logger failures are contained without changing grant resolution, consent, audit, visibility, or signal authorization semantics.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts` and `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected specs: `openspec/specs/agent-shell-consent-workflow/spec.md`.
- Touches authorization fail-closed diagnostics and logs.
- Does not touch capture, input implementation, relay admission, pairing tokens, installer behavior, startup persistence, services, native Windows APIs, privilege elevation, stealth behavior, credential access, AV/EDR behavior, or Windows prompt handling.
