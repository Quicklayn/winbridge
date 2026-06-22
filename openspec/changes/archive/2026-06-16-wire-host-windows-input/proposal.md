## Why

WinBridge can now transport consent-bound input events and has a reviewed
Windows input adapter package, but the host runtime still treats inbound input
as metadata-only. MVP remote control needs a narrow host-side runtime wiring
step that applies authorized viewer input only after consent, visibility,
permission, peer, and audit gates pass.

## What Changes

- Add an opt-in host runtime input application boundary that invokes
  `@winbridge/windows-input` only for already accepted inbound `input-event`
  messages.
- Require local metadata-only audit before native input invocation; audit
  failure blocks native input.
- Add CLI/runtime configuration that keeps host input application disabled by
  default and requires explicit host opt-in plus local audit configuration.
- Keep inbound input diagnostics metadata-only and preserve existing
  pause/revoke/terminate/expire/disconnect fail-closed behavior.
- Keep viewer desktop UI, continuous control UX, clipboard, file transfer,
  diagnostics, services, startup persistence, privilege elevation, unattended
  access, AV/EDR evasion, and Windows prompt bypass out of scope.

## Capabilities

### New Capabilities

### Modified Capabilities

- `agent-shell-consent-workflow`: add explicit host-side Windows input
  application after inbound authorization and audit gates.

## Impact

- Affected code: `apps/agent-shell`, dependency metadata, tests, README,
  architecture, roadmap, threat model, privacy docs, and OpenSpec specs.
- Security impact: touches input, authorization, local audit, diagnostics, and
  native Windows API invocation boundaries.
- Non-goals: no hidden input, no keylogging, no credential access, no services,
  no startup persistence, no installer changes, no privilege elevation, no
  AV/EDR evasion, and no Windows prompt bypass.
