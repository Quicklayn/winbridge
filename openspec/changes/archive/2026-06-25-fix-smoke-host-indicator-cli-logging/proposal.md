## Why

The real `npm run mvp:smoke -- --json` workflow currently fails at
`indicator-not-ready` even though the runtime emits a host indicator event in
tests. The smoke process waits for the CLI child output marker, but the
agent-shell CLI does not wire a runtime logger, so the visible-session
indicator marker is not printed for the real MVP smoke run.

## What Changes

- Ensure the agent-shell CLI emits the existing bounded runtime host indicator
  marker to visible stdout/stderr output used by the smoke check.
- Keep the smoke indicator check strict: it still requires active state,
  `visibleToHost=true`, and a positive permission count.
- Add focused coverage so the smoke workflow detects the CLI-visible host
  indicator marker path instead of only testing the parser.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mvp-session-command-kit`: the real local smoke check can observe the
  host-visible active-session indicator marker emitted by the CLI child
  process.

## Impact

- Affected code: `apps/agent-shell/src/index.ts`,
  `scripts/mvp-session-smoke.test.ts`, and OpenSpec docs.
- Affected systems: local development CLI diagnostics and smoke readiness only.
- Safety impact: no new authorization, capture, input, relay routing, audit
  persistence, installer, startup, service, privilege, token, or browser
  behavior. The change only exposes the existing bounded indicator metadata
  required for visible-session verification.
- Non-goals: no hidden session behavior, no unattended access, no remote
  discovery, no network probing, no firewall changes, no credential access, no
  keylogging, no Windows prompt bypass, and no production deployment workflow.
