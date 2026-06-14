## Why

Inbound messages rejected as non-protocol or unsafe protocol input emit redacted local `raw` runtime events before returning. If that diagnostic event callback throws, an already-rejected inbound message can be reported as a runtime error, making local observability behave like a workflow failure path.

## What Changes

- Treat diagnostic `raw` runtime event callback failures for non-protocol and ignored unsafe inbound protocol messages as best-effort observability.
- Preserve existing rejection behavior: unsafe inbound input remains ignored before trusted `received` event emission and workflow handling.
- Add regression coverage for non-protocol input and decoded unsafe protocol input with throwing `raw` event callbacks.
- Non-goals: no capture, input, clipboard, file transfer, reconnect, relay forwarding, protocol schema, installer, startup persistence, service, privilege elevation, hidden session, security prompt bypass, credential access, keylogging, AV/EDR evasion, or native Windows API changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: Unsafe inbound diagnostic `raw` event callbacks become explicitly best-effort and must not emit runtime errors or weaken rejection, consent, visibility, authorization, audit, or signal boundaries.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`.
- Affected tests: `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected specs: `openspec/specs/agent-shell-consent-workflow/spec.md` through a delta spec for this change.
- Security areas touched: inbound protocol rejection diagnostics, auth/signal boundary verification, and local runtime events/logs only.
- No dependency, relay, protocol schema, installer, startup, service, token format, privilege, capture, input, or native Windows API changes.
