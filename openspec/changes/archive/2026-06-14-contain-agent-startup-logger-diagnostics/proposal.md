## Why

Agent shell startup informational logs are diagnostics only, but the WebSocket `open` callback writes them through the configured logger before sending the join message. A failing diagnostic logger can currently turn observability into a startup side effect and prevent the normal consent-first relay join path from running.

## What Changes

- Treat agent shell startup informational logging as best-effort.
- Preserve existing startup message text while containing diagnostic logger failures.
- Add integration coverage proving startup logger failure does not expose raw logger text and does not grant permissions, activate host visibility, send consent/lifecycle/signal/control messages, start capture, send input, reconnect peers, hide the session, or bypass consent.
- No breaking changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: startup diagnostic logger failures must be contained and remain secret-safe/non-authorizing.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`, `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected systems: non-native agent shell startup diagnostics/logs around WebSocket open.
- Safety impact: strengthens diagnostic failure containment. This does not grant permissions, activate host visibility, start capture, send input, reconnect peers, or bypass consent.
- Touches: startup and logs.
- Does not touch: relay protocol behavior, capture, input, auth semantics, installer, services, tokens, native Windows APIs, privilege elevation, persistence, or host consent UI.
- Non-goals: no covert access, hidden sessions, stealth persistence, credential collection, keylogging, AV/EDR evasion, or Windows prompt bypass.
