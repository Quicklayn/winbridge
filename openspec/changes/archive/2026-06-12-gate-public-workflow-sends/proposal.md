## Why

The managed agent shell now gates public `signal` sends, but direct caller code can still use the public runtime `send()` method to emit authorization decisions, active state, lifecycle controls, permission revocations, or workflow audit events outside the explicit host decision workflow. Blocking those public workflow-authority sends keeps consent transitions owned by the internal development workflow and prevents future adapters from treating the low-level send API as an authorization shortcut.

## What Changes

- Block public runtime `send()` calls for workflow-authority protocol messages before socket write and before local `sent` event emission.
- Keep internal agent-shell workflow sends working for explicit host approval/denial, visible activation, pause, resume, revoke, termination, expiration, and matching development audit events.
- Preserve static, secret-safe blocked-send diagnostics that do not expose protocol payloads or private reason/audit detail values.
- Safety non-goals: no screen capture, input injection, clipboard, file transfer, installer, startup persistence, services, privilege elevation, hidden sessions, or Windows security prompt bypass.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: public runtime sends for authorization decisions, authorization states, session controls, permission revocations, and workflow audit events are blocked so only the internal consent workflow can emit them.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`.
- Affected tests: `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected docs/specs: `openspec/specs/agent-shell-consent-workflow/spec.md`, `docs/architecture.md`, `docs/security-model.md`.
- Touches auth and audit/log behavior in the non-native agent shell only; does not touch relay forwarding, protocol schemas, capture, input, installer, startup, services, tokens, or privilege elevation.
