## Why

The agent shell already emits sanitized runtime error diagnostics when workflow audit persistence or other runtime callbacks fail, but the primary runtime error logger path can still throw after the sanitized event is emitted. Optional diagnostic logging must not replace fail-closed sanitized errors with raw logger failures.

## What Changes

- Treat runtime error logger output from the primary runtime error path as best-effort diagnostics.
- Add integration coverage for a host workflow audit failure where the runtime error logger also throws.
- Preserve fail-closed behavior: no authorization lifecycle/control/audit messages are sent after the failed audited action, and direct host controls still throw only the sanitized runtime error.
- No breaking changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: add a requirement that runtime error logger failures are contained after sanitized runtime error reporting.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`, `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected OpenSpec: `openspec/specs/agent-shell-consent-workflow/spec.md`.
- Touches: auth workflow error handling and logs.
- Does not touch: capture, input, relay behavior, installer behavior, startup persistence, services, tokens, privilege elevation, native Windows APIs, or hidden/stealth workflows.
