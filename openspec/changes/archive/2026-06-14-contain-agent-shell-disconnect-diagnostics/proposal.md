## Why

Host local disconnect is the host's immediate revocation path for the development shell. The existing audit-failure path reports sanitized diagnostics before closing the socket, but diagnostic event or logger callbacks can throw and prevent the local WebSocket close.

## What Changes

- Guard local host disconnect audit-failure diagnostics so throwing `onEvent` or logger callbacks cannot block indicator deactivation or local WebSocket close.
- Preserve the existing rule that non-disconnect workflow audit failures remain fail-closed before lifecycle protocol sends.
- Keep diagnostics bounded and secret-safe: do not expose raw audit sink error text, logger error text, close reasons, pairing codes, tokens, protocol payloads, credentials, remote content, or full secrets.
- Add regression coverage for direct and scheduled host local disconnect when audit persistence fails and diagnostic callbacks also fail.
- Update security documentation to describe local disconnect cleanup as authoritative over best-effort diagnostics.
- Non-goals: no capture, input, clipboard, file transfer, diagnostics access, reconnect, installer, service, startup persistence, privilege elevation, credential access, hidden session behavior, relay protocol schema changes, or production audit durability changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: local host disconnect audit-failure diagnostics must be best-effort and must not weaken immediate disconnect cleanup.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`, `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected docs/specs: `docs/security-model.md`, `openspec/specs/agent-shell-consent-workflow/spec.md`.
- Security scope: touches host disconnect, audit, and logs. Requires security review.
- API/dependency impact: no public API changes, no protocol schema changes, no new dependencies.
