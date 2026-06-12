## Why

The agent shell already gates `signal` sends on active visible `screen:view` authorization, but the signal payload itself is not bound to the authorization that allowed it. Future media/WebRTC signaling should be correlated to the current consent grant so stale or cross-authorization signals fail closed before native capture or input work exists.

## What Changes

- Require agent-shell public `signal` sends to carry `payload.authorizationId` matching the current active visible authorization.
- Ignore inbound `signal` messages before local received-event emission unless their payload authorization id matches the runtime's current active visible authorization.
- Preserve existing redaction: blocked signal diagnostics and runtime events must not expose raw payloads, payload keys, private reasons, tokens, pairing codes, screen contents, or input contents.
- Do not add native screen capture, remote input, clipboard sync, file transfer, reconnect, installer, service, startup persistence, relay authorization changes, or privilege elevation.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: add authorization-id binding for agent-shell signal send and receive gates.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts` and `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected docs/specs: agent-shell consent workflow requirements, architecture/security docs if behavior is user-visible enough to document.
- Security impact: touches authorization and signaling gates only. It strengthens fail-closed behavior and does not implement capture, input, stealth, persistence, credential access, AV/EDR evasion, Windows prompt bypass, or relay production auth.
