## Security Review

Change: `add-trial-relay-host-planner`

Reviewed paths:

- `scripts/mvp-trial.mjs`
- `scripts/mvp-trial.test.ts`
- `scripts/mvp-ready.mjs`
- `scripts/mvp-ready.test.ts`
- `README.md`
- `openspec/specs/mvp-session-command-kit/spec.md`
- `openspec/changes/add-trial-relay-host-planner/specs/mvp-session-command-kit/spec.md`

## Findings

No safety blocker found.

The change adds `--relay-host` only to `mvp:trial` plan mode. It validates the
host shortcut before output, rejects loopback, unspecified, malformed,
secret-bearing, duplicated, and evidence-mode usage, and substitutes the value
only into fixed `mvp:commands -- --only ... --relay-host ... --token-env
WINBRIDGE_RELAY_SHARED_TOKEN` command-reference strings.

The helper still does not render generated relay, host, viewer, or browser
runtime commands. It does not print relay URLs, pairing codes, token values,
local control URLs, audit records, frame bytes, screen contents, input
contents, clipboard contents, credentials, diagnostics dumps, stdout, stderr,
child output, or full secrets.

## Safety Invariants

- Host consent remains required before any live assistance session.
- Host-visible active-session indicators are unchanged.
- Host pause, revoke, terminate, and disconnect controls are unchanged.
- Strict post-run audit evidence requirements are unchanged.
- Evidence mode remains audit-file-only and rejects `--relay-host`.
- No relay, host, viewer, browser, capture, input, socket, HTTP listener,
  service, startup persistence, unattended access, privilege elevation, LAN
  discovery, firewall change, AV/EDR evasion, Windows prompt bypass, or hidden
  session behavior is added.

## Verification

Focused verification was run with:

```powershell
npx vitest run scripts/mvp-trial.test.ts scripts/mvp-ready.test.ts
```

Result: passed, 76 tests.
