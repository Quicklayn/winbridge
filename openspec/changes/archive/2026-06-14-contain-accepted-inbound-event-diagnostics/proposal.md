## Why

Accepted inbound protocol messages emit a local redacted `received` runtime event before consent workflow handling. If that diagnostic event callback throws, a valid authorization request can be suppressed before explicit host approval, visible activation, required audit persistence, and normal authorization gates run.

## What Changes

- Treat diagnostic `received` runtime event callback failures for accepted inbound protocol messages as best-effort observability.
- Preserve normal consent workflow handling after a valid same-session authorization request even when the local diagnostic event callback fails.
- Add regression coverage proving the callback failure does not authorize anything by itself, does not leak raw callback/request text, and still requires the existing explicit approval, visibility, authorization, and audit gates.
- Non-goals: no capture, input, clipboard, file transfer, reconnect, installer, startup persistence, service, privilege elevation, hidden session, security prompt bypass, credential access, keylogging, AV/EDR evasion, native Windows API, relay, or protocol schema changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: Accepted inbound diagnostic `received` event callbacks become explicitly best-effort and must not suppress normal consent workflow handling or weaken safety gates.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`.
- Affected tests: `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected specs: `openspec/specs/agent-shell-consent-workflow/spec.md` through a delta spec for this change.
- Security areas touched: auth/audit diagnostics and local runtime events only.
- No dependency, relay, protocol schema, installer, startup, service, token format, privilege, capture, input, or native Windows API changes.
