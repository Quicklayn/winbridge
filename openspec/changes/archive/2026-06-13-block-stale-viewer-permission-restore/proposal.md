## Why

Viewer-side authorization currently removes a permission when a bound revoke control or `permission-revoked` message arrives, but a later same-authorization `session-authorization-state` from the same host authority can reintroduce that permission while the authorization remains non-terminal. That weakens host revocation because a stale lifecycle state could make a previously revoked sensitive permission appear usable again.

## What Changes

- Track viewer-observed per-authorization permission revocations as a local fail-closed floor.
- Apply that floor to later same-authorization `session-authorization-decision` and `session-authorization-state` messages before updating viewer authorization state.
- Keep same-authority revoke confirmations acceptable without restoring permissions or authorizing `signal` sends.
- Add integration coverage proving stale active state cannot restore `screen:view` after partial revocation.
- Safety impact: strengthens authorization and revocation handling for consent-first remote assistance.
- Non-goals: no screen capture, input execution, clipboard access, file transfer, relay protocol expansion, installer behavior, startup persistence, service behavior, token handling changes, privilege elevation, hidden sessions, or consent bypass.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: viewer authorization state MUST preserve previously observed same-authorization permission revocations when later lifecycle state arrives.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`.
- Affected tests: `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected specs: `openspec/specs/agent-shell-consent-workflow/spec.md`.
- Touched area: authorization and revocation handling.
- Not touched: capture, input execution, relay, installer, startup, services, tokens, logs, or privilege elevation.
