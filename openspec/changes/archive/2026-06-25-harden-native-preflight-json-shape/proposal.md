## Why

`mvp:native-preflight` currently treats a zero-exit PowerShell prerequisite
probe as success without validating the bounded JSON marker that each fixed
probe is expected to emit. MVP readiness should fail closed if a probe returns
empty, malformed, secret-bearing, or unexpected output despite exiting
successfully.

## What Changes

- Validate every fixed native preflight PowerShell probe stdout as exact
  bounded JSON readiness metadata.
- Require the accepted probe shape to be only `{ "ok": true }`.
- Treat missing, malformed, false, extra-field, array, non-object, oversized,
  or non-JSON probe output as that probe's existing bounded failure reason.
- Keep human and JSON CLI output bounded and free of raw PowerShell stdout,
  scripts, paths, tokens, pairing codes, credentials, screen contents, input
  contents, keystrokes, private reasons, and full secrets.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mvp-session-command-kit`: native preflight readiness now requires each
  fixed PowerShell probe to emit a strict bounded success JSON shape.

## Impact

- Affected code: `scripts/mvp-native-preflight.mjs`,
  `scripts/mvp-native-preflight.test.ts`, README, and OpenSpec documentation.
- Affected systems: local MVP native preflight helper only.
- Safety impact: fail-closed readiness hardening. The change does not add
  capture, input, auth, relay, installer, startup, service, token, log,
  privilege elevation, hidden session, unattended access, evasion, or prompt
  bypass behavior.
- Non-goals: no new native API calls, no command execution beyond the existing
  fixed read-only PowerShell probes, no production installer, no clipboard/file
  transfer/diagnostics capability, and no remote-control behavior change.
