## Why

WinBridge can capture frames on the host, persist authorized frames on the
viewer side, and apply authorized input on the host, but the viewer still has no
interactive control surface beyond one-shot scheduled input events. MVP remote
assistance needs a narrow development viewer control loop that can send
explicit pointer and keyboard commands after consent without introducing hidden
input, keylogging, or unattended behavior.

## What Changes

- Extend the existing opt-in viewer control prompt with explicit one-command
  pointer and keyboard input sends.
- Keep `help`, `status`, and `disconnect` behavior intact while adding bounded
  input command parsing and metadata-only success/failure output.
- Send input only through the existing runtime `sendInputEvent()` path, so
  current active visible authorization, permission, peer routing, audit,
  disconnect, pause, revoke, expiration, and redaction gates remain
  authoritative.
- Reject malformed, oversized, whitespace-padded, suffixed, text-buffer-shaped,
  macro-shaped, stale, or permissionless control input before native host input
  can occur.
- Keep desktop viewer UI, clipboard, file transfer, diagnostics, services,
  startup persistence, privilege elevation, unattended access, AV/EDR evasion,
  Windows prompt bypass, and hidden input out of scope.

## Capabilities

### New Capabilities

### Modified Capabilities

- `agent-shell-consent-workflow`: extend viewer control prompt requirements to
  allow explicit consent-bound input commands through the existing runtime input
  send path.

## Impact

- Affected code: `apps/agent-shell` viewer control prompt parser, prompt
  runtime integration, tests, README, architecture, roadmap, privacy, threat
  model, and OpenSpec specs.
- Security impact: touches viewer input command parsing, input sends,
  authorization, audit-before-send behavior, local prompt diagnostics, and
  remote host native input reachability when the host has explicitly opted in.
- Non-goals: no hidden input, no keylogging, no free-form text typing buffers,
  no command macros, no clipboard, no file transfer, no diagnostics collection,
  no installer/service/startup changes, no privilege elevation, no unattended
  access, no AV/EDR evasion, and no Windows prompt bypass.
