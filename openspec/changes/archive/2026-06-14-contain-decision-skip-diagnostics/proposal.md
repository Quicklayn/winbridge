## Why

The host authorization decision path already fails closed when the requesting viewer is no longer connected, but its diagnostic logger call is still allowed to throw. That makes optional observability capable of surfacing a runtime error after the product has already decided not to approve, audit, or activate the session.

## What Changes

- Treat the "authorization decision skipped because viewer is not connected" diagnostic as best-effort.
- Add integration coverage for a throwing logger after an interactive host approval resolves after viewer disconnect.
- Preserve the existing fail-closed behavior: no authorization decision, active state, audit event, host indicator, capture, input, reconnect, or hidden session behavior is introduced.
- No breaking changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: add a requirement that authorization decision skip diagnostics are best-effort and secret-safe.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`, `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected OpenSpec: `openspec/specs/agent-shell-consent-workflow/spec.md`.
- Touches: auth workflow failure path and logs.
- Does not touch: capture, input, relay behavior, installer behavior, startup persistence, services, tokens, privilege elevation, native Windows APIs, or hidden/stealth workflows.
