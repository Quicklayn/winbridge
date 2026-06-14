## Why

Relay startup warning and listening logs are diagnostics only, but they currently call the configured logger directly during `start()`. A failing diagnostic logger can turn observability into a startup side effect even though relay admission, pairing, and startup audit state are otherwise valid.

## What Changes

- Treat relay startup warning and listening informational logs as best-effort.
- Preserve the mandatory development-mode startup audit gate: audit persistence failure still rejects startup and closes the listener.
- Add integration coverage proving startup logger failure does not expose raw logger text and does not prevent listener startup or accepted development-mode startup audit.
- No breaking changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `relay-runtime`: startup diagnostic logger failures must be contained and remain secret-safe/non-authorizing.

## Impact

- Affected code: `apps/relay/src/server.ts`, `apps/relay/src/server.integration.test.ts`.
- Affected systems: development relay startup diagnostics/logs.
- Safety impact: strengthens diagnostic failure containment without changing relay authorization, pairing, forwarding, audit gates, or room membership behavior.
- Touches: relay startup and logs.
- Does not touch: capture, input, auth semantics, agent shell workflows, installer, services, tokens, native Windows APIs, privilege elevation, persistence, or host consent UI.
- Non-goals: no covert access, hidden sessions, stealth persistence, credential collection, keylogging, AV/EDR evasion, or Windows prompt bypass.
