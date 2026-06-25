## Why

The current MVP smoke check exercises the local static workflow only through
the default relay URL. Before a real two-PC trial, developers need a safe local
way to validate the same workflow with a non-localhost relay URL shape that is
closer to the LAN command plan.

## What Changes

- Add an explicit `mvp:smoke` option that runs the bounded static smoke
  workflow with the host and viewer connecting through a loopback LAN-style
  relay URL such as `ws://127.0.0.1:<port>/`.
- Keep the smoke workflow static and development-scoped: no Windows capture, no
  OS input application, no browser automation, no startup/service changes, no
  privilege elevation, and no unattended access.
- Keep success and failure output bounded and free of raw relay URLs, ports,
  commands, frame paths, audit paths, mutation tokens, tokens, pairing codes,
  input contents, and child process output.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mvp-session-command-kit`: extend the root MVP smoke check with an explicit
  LAN-style local relay mode for preflight coverage before a two-PC trial.

## Impact

- Affected code: `scripts/mvp-session-smoke.mjs`,
  `scripts/mvp-session-smoke.test.ts`, `scripts/mvp-ready.mjs`,
  `scripts/mvp-ready.test.ts`, and README/OpenSpec documentation.
- Affected systems: development relay startup and agent-shell smoke workflow
  only.
- Safety impact: relay workflow coverage increases, but the check remains
  local, static, finite, visible-session gated, and non-native.
- Non-goals: no production viewer UI, no native Windows capture in smoke, no OS
  input injection in smoke, no relay token handling changes, no installer,
  service, startup persistence, authentication, authorization, logging,
  privilege elevation, or Windows security prompt behavior changes.
