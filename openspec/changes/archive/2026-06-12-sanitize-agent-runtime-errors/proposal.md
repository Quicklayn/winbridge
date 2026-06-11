## Why

The agent shell currently surfaces audit-sink and delayed workflow failures through local `error` runtime events and logs, but both surfaces include raw exception messages. Audit sinks, socket implementations, or future integrations can include tokens, file paths, private reasons, protocol fragments, or diagnostic secrets in those messages.

## What Changes

- Emit local runtime `error` events with a bounded generic error message and safe message-byte metadata instead of raw exception text.
- Log runtime and socket errors as summary metadata rather than raw `Error.message` values.
- Preserve failure surfacing: callers still receive an `error` runtime event when workflow/audit handling fails.
- Add focused tests proving raw audit-sink error text is not emitted in events or logs.
- Non-goals: no screen capture, remote input, clipboard sync, file transfer, installer, startup persistence, services, privilege elevation, reconnect behavior, stealth behavior, or Windows prompt changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: refine audit/runtime failure surfacing so failures are observable without exposing raw exception text.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts` and runtime integration tests.
- Affected API: local `AgentShellEvent` `error` events keep an `Error`, but its message is generic and includes safe byte-length metadata on the event.
- Affected documentation: agent shell architecture/security notes.
- Safety impact: touches log/event diagnostics only; no remote assistance capability is added or expanded.
- Review gate: security review required because the change touches log/event handling and failure surfacing.
