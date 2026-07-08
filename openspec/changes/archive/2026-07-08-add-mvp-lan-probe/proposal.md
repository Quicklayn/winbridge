## Why

The project has strong local smoke coverage and a two-PC operator workflow,
but there is no narrow live LAN gate that proves the relay is reachable from
the host and viewer PCs before starting the full consent, capture, input, and
browser workflow. Operators can discover token, pairing, firewall, or relay
bind problems only after assembling the full trial.

## What Changes

- Add a root `mvp:lan-probe` CLI for bounded two-PC relay reachability checks.
- The probe connects one explicit role (`host` or `viewer`) to a reviewed relay
  URL, sends a schema-valid `join-session`, and waits for relay readiness that
  confirms the opposite peer is present in the same pairing room.
- Support bounded text and JSON output with fixed check names and reason codes.
- Support a relay shared token only through a named environment variable.
- Fail closed on malformed arguments, unsafe relay URLs, missing token
  environment values, token denial, wrong pairing, timeout, relay errors, or
  unexpected protocol messages without echoing secrets or raw protocol content.
- Keep the probe non-authorizing: it does not request host consent, grant
  permissions, activate visibility, send screen frames, send input, read/write
  audit files, start local control surfaces, or open browsers.

## Capabilities

### New Capabilities

- `mvp-session-command-kit`: live bounded LAN probe for pre-trial relay/session
  reachability between two operator-run peers.

### Modified Capabilities

- None.

## Impact

- Affected code: `package.json`, new `scripts/mvp-lan-probe.mjs`,
  `scripts/mvp-lan-probe.test.ts`, README, and OpenSpec artifacts.
- Touches relay, session pairing, and token connection setup.
- Does not change relay runtime admission rules, agent-shell authorization,
  capture, input, audit persistence, installer behavior, startup, services,
  privilege elevation, browser automation, unattended access, hidden sessions,
  credential access, keylogging, clipboard access, AV/EDR evasion, or Windows
  prompt bypass.
- Safety impact: improves trial readiness by detecting LAN setup failures
  before any sensitive remote assistance capability can be exercised.
