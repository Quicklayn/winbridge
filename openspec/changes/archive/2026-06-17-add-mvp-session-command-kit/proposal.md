## Why

The development MVP now has the pieces needed for consent-bound viewing and
control, but starting a real host/viewer session still requires manually
assembling several long commands. A bounded command kit makes the MVP usable
without introducing background services, stealth startup, or new remote
capabilities.

## What Changes

- Add a root `mvp:commands` npm script that prints ready-to-run relay, host,
  and viewer commands for a Windows-to-Windows MVP session.
- Validate session id, pairing code, relay URL, local audit paths, viewer
  surface port, frame path, capture cadence, and optional relay token before
  printing commands.
- Include host-visible safety defaults: explicit host approval, visible session,
  host audit, host input opt-in, Windows capture source, bounded frame stream,
  viewer audit, explicit latest-frame output, and loopback viewer surface.
- Print a concise safety checklist and browser URL, but do not execute relay,
  host, or viewer processes.
- Keep hidden startup, service installation, unattended access, credential
  collection, clipboard, file transfer, diagnostics collection, privilege
  elevation, AV/EDR evasion, and Windows prompt bypass out of scope.

## Capabilities

### New Capabilities

- `mvp-session-command-kit`: command generation workflow for visible,
  consent-bound MVP development sessions.

### Modified Capabilities

## Impact

- Affected code: root `scripts/`, `package.json`, README, roadmap, and OpenSpec
  specs.
- Security impact: touches user-facing launch workflow and command-line
  handling for relay, host, viewer, audit paths, tokens, and remote assistance
  permissions. It does not add new capture/input behavior.
- Non-goals: no process supervisor, no service, no startup persistence, no
  hidden listener, no unattended access, no production installer, no
  production identity, no clipboard, no file transfer, no diagnostics, no
  remote shell, no privilege elevation, no AV/EDR evasion, and no Windows prompt
  bypass.
