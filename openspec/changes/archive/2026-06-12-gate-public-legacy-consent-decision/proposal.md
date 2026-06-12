## Why

The public runtime workflow-authority send gate blocks the current session authorization decision message, but the legacy `host-consent-decision` message can also approve scoped grants. Leaving that legacy decision outside the public-send gate preserves an unnecessary consent bypass path for callers using the managed runtime API.

## What Changes

- Treat legacy `host-consent-decision` as a workflow-authority message for public `AgentShellRuntime.send()` calls.
- Reject public legacy consent decisions before socket write and before local `sent` event emission.
- Preserve public legacy `host-consent-required` requests because they do not grant access by themselves.
- Keep protocol schema, relay forwarding behavior, and internal agent-shell consent workflow unchanged.
- Safety non-goals: no screen capture, input injection, clipboard, file transfer, installer, startup persistence, services, privilege elevation, hidden sessions, or Windows security prompt bypass.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: public workflow-authority send gate now includes legacy `host-consent-decision` messages.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`.
- Affected tests: `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected docs/specs: `openspec/specs/agent-shell-consent-workflow/spec.md`, `docs/architecture.md`, `docs/security-model.md`.
- Touches auth/log behavior in the non-native agent shell only; does not touch relay, protocol schemas, capture, input, installer, startup, services, tokens, or privilege elevation.
