## Why

Very short development authorization TTLs can make host-generated grant messages stale before validation because `expiresAt` is computed separately from each protocol message `createdAt`. That can prevent visible activation and expiration simulation from being emitted, which weakens the testability of fail-closed lifecycle boundaries.

## What Changes

- Generate host authorization decision and active-state timestamps from a consistent grant creation boundary so grant-bearing messages keep `expiresAt` after `createdAt`.
- Schedule expiration simulation against the authorization `expiresAt` boundary instead of a detached delay from a later point in the workflow.
- Preserve the existing rule that delayed revoke, terminate, pause, and resume simulation must not send after expiration.
- Non-goals: no new permissions, capture, input, relay routing, installer, startup, service, token, log storage, privilege elevation, hidden session, or persistence behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: host authorization grant and expiration simulation must stay coherent for very short but valid TTLs.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`.
- Affected tests: `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected OpenSpec: `openspec/specs/agent-shell-consent-workflow/spec.md`.
- Safety impact: improves fail-closed lifecycle testability for development authorization TTL boundaries; no authorization grant scope, host visibility, capture, input, relay, installer, service, token, log storage, or privilege behavior is added.
