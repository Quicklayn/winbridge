## Why

Viewer local leave is a consent-safe cleanup path: it closes only the local viewer relay connection and clears connection-scoped viewer authorization state. Optional close diagnostics such as runtime event callbacks or loggers must not be able to interrupt that cleanup, because a failed diagnostic callback could leave the viewer without the expected bounded inactive status after an explicit local leave.

## What Changes

- Treat WebSocket close event diagnostics emitted during viewer local leave as best-effort.
- Preserve viewer local leave cleanup and bounded inactive status even if the close event callback or disconnected logger throws.
- Add regression coverage that verifies no forged `peer-disconnected`, lifecycle, signal, control, or workflow audit messages are emitted by this path.
- Update security documentation for best-effort close diagnostics on viewer local leave.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: Viewer local leave and socket-close diagnostics remain best-effort and cannot block local leave cleanup or widen remote access.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`, `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected docs/specs: `docs/security-model.md`, `openspec/specs/agent-shell-consent-workflow/spec.md`.
- Touches logs and runtime event diagnostics only.
- Does not touch capture, input, auth credential handling, relay behavior, installer, startup, services, tokens, privilege elevation, native Windows APIs, or production authorization.
