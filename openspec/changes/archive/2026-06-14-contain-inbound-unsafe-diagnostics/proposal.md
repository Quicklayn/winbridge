## Why

Inbound non-protocol and decoded unsafe protocol messages are already treated as untrusted input and ignored with redacted local diagnostics. A failing diagnostic logger in those ignore paths can still surface as a runtime error even though the correct security outcome is to keep the message ignored, redacted, and non-authorizing.

## What Changes

- Treat inbound non-protocol and ignored unsafe inbound protocol log output as best-effort diagnostics after the redacted local `raw` event is emitted.
- Preserve existing unsafe-input classification, redaction, and no-send behavior.
- Add integration coverage proving logger failure does not expose raw logger text or protocol payloads and does not send authorization, lifecycle, signal, control, permission, disconnect, or workflow audit messages.
- No breaking changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: inbound unsafe message diagnostic logger failures must be contained and remain secret-safe/non-authorizing.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`, `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected systems: non-native agent-shell inbound message diagnostics/logs for untrusted inputs.
- Safety impact: strengthens fail-closed unsafe-input handling by preventing optional logging from turning an ignored message into a runtime diagnostic failure.
- Touches: inbound protocol/non-protocol diagnostics and logs.
- Does not touch: capture, input, relay admission, shared tokens, native Windows APIs, installer, services, privilege elevation, startup persistence, production authentication semantics, authorization grant resolution, or audit persistence ordering.
- Non-goals: no covert access, hidden sessions, stealth persistence, credential collection, keylogging, AV/EDR evasion, or Windows prompt bypass.
