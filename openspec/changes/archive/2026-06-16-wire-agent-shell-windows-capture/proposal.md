## Why

WinBridge now has a reviewed Windows capture adapter and consent-bound
`screen-frame` transport, but the host shell still sends only static development
frames. Wiring the adapter into the host runtime is the next step toward MVP
remote viewing while preserving visible consent and revocation gates.

## What Changes

- Add a host-only CLI option to select `windows-capture` as the development
  screen-frame source.
- Add a dedicated runtime method that captures and sends one frame only after
  internal active visible `screen:view` authorization, peer routing, and socket
  checks pass.
- Persist metadata-only local audit before invoking native capture; if audit
  persistence fails, capture does not run.
- Re-check authorization/routing through the existing `sendScreenFrame()` path
  before socket write, so revoke/pause/disconnect during capture still fails
  closed before send.
- Support one-shot and finite stream scheduling with the same count/interval
  bounds as static development frames.
- Keep viewer rendering and OS input application out of scope for this change.

## Capabilities

### New Capabilities

### Modified Capabilities

- `agent-shell-consent-workflow`: adds a consent-bound Windows capture frame
  source for host development frame send/stream workflows.

## Impact

- Affected code: `apps/agent-shell`, `@winbridge/windows-capture` dependency,
  README/roadmap/threat model, and OpenSpec specs.
- Security impact: touches native screen capture, authorization, audit,
  diagnostics/logs, and remote frame transport.
- Non-goals: no hidden capture, viewer rendering, input injection, clipboard,
  file transfer, diagnostics collection, service, installer, startup
  persistence, privilege elevation, unattended access, AV/EDR evasion, or
  Windows prompt bypass.
