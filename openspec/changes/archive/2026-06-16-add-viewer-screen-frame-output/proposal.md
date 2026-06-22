## Why

WinBridge can already send consent-bound Windows capture frames from the host,
but the viewer CLI only emits redacted metadata when those frames arrive. The
next MVP step is an explicit, auditable way for a viewer operator to observe the
latest authorized frame without weakening consent, visibility, or diagnostic
redaction gates.

## What Changes

- Add a viewer-only CLI option that requires local audit configuration and writes
  the latest authorized inbound `screen-frame` payload to an explicit local
  output file.
- Write metadata-only local audit before any frame bytes are persisted; if audit
  fails, no output file is written.
- Keep runtime events, logs, audit details, and errors metadata-only and redacted.
- Preserve all existing inbound authorization checks for sender role, peer
  routing, authorization id, visible active unexpired status, and `screen:view`.
- Keep remote desktop rendering and host OS input application out of scope for
  this change.

## Capabilities

### New Capabilities

### Modified Capabilities

- `agent-shell-consent-workflow`: adds an explicit viewer output path for
  authorized screen-frame bytes while keeping public diagnostics metadata-only.

## Impact

- Affected code: `apps/agent-shell`, README/roadmap/threat model, and OpenSpec
  specs.
- Security impact: touches received screen bytes, local persistence, audit,
  diagnostics/logs, and remote frame transport.
- Non-goals: no hidden viewing, no unattended access, no OS input injection, no
  clipboard, no file transfer, no diagnostics collection, no service/installer,
  no startup persistence, no privilege elevation, no AV/EDR evasion, and no
  Windows prompt bypass.
