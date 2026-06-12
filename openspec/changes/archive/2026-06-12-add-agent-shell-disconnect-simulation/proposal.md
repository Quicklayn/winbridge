## Why

WinBridge requires the host to be able to disconnect immediately. The development agent shell already exposes manual runtime shutdown and relay disconnect notices, but it does not provide a scripted host-side disconnect simulation that can be exercised through the same consent workflow tests and CLI flags as revoke, pause, terminate, and expiration.

## What Changes

- Add an explicit host disconnect simulation delay for the non-native agent shell.
- Schedule the disconnect only after explicit host approval has emitted active visible session state.
- Close the host WebSocket without sending forged `peer-disconnected` messages; the relay remains the authority for disconnect notices.
- Suppress later delayed host workflow messages after the local disconnect is sent.
- Add CLI parsing, integration tests, and docs for the development-only disconnect simulation.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: Host workflow simulation can close the local host connection after visible activation to model immediate host disconnect behavior.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`, `apps/agent-shell/src/args.ts`, tests, README/docs, OpenSpec specs.
- API impact: `AgentShellRuntimeOptions` and CLI args gain optional `hostDisconnectAfterMs` / `--disconnect-after-ms`.
- Safety impact: strengthens the host disconnect invariant without adding screen capture, input injection, clipboard, file transfer, installer, service, startup, privilege, hidden access, credential access, keylogging, evasion, or prompt bypass behavior.
- Touches user-visible workflow, networking lifecycle, and audit-adjacent consent behavior; requires security review.
