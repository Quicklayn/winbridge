## Why

The agent shell emits local `sent` runtime events after a protocol envelope has been validated and written to the WebSocket. If the local observer callback throws after the socket write, an already-sent workflow or signal message can be reported as a local runtime failure, making diagnostic observability behave like a transport or authorization failure path.

## What Changes

- Treat local `sent` runtime event callback failures as best-effort diagnostics after successful socket write.
- Preserve existing outbound validation and fail-closed behavior: invalid, unauthorized, disconnected, or unsafe public sends remain blocked before socket write and before local `sent` event emission.
- Add regression coverage for workflow-originated and public signal sends with throwing `sent` event callbacks.
- Non-goals: no capture, input, clipboard, file transfer, reconnect, relay forwarding, protocol schema, installer, startup persistence, service, privilege elevation, hidden session, security prompt bypass, credential access, keylogging, AV/EDR evasion, or native Windows API changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: Local `sent` runtime event callbacks become explicitly best-effort after successful socket writes and must not weaken send validation, consent, visibility, authorization, audit, signal, redaction, or host indicator boundaries.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`.
- Affected tests: `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected specs: `openspec/specs/agent-shell-consent-workflow/spec.md` through a delta spec for this change.
- Security areas touched: local runtime event diagnostics for sent protocol messages, auth/signal boundary verification, and secret redaction only.
- No dependency, relay, protocol schema, installer, startup, service, token format, privilege, capture, input, or native Windows API changes.
