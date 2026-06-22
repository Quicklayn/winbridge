## Why

MVP readiness is currently easier to diagnose on success than on failure because
the smoke check JSON failure output exposes only a safe reason code. CI and local
automation need a bounded per-step failure view without exposing runtime logs,
paths, tokens, pairing codes, screen contents, input contents, or raw child
output.

## What Changes

- Add fixed, safe smoke subcheck metadata to `npm run mvp:smoke -- --json`
  failure output when a known smoke step fails.
- Preserve existing safe reason codes and secret-safe failure behavior.
- Keep success JSON shape compatible with the existing fixed subcheck list.
- Do not add capture, OS input injection, auth bypass, installer behavior,
  startup behavior, services, token handling, log disclosure, or privilege
  elevation.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `mvp-session-command-kit`: the MVP smoke check JSON failure contract may
  include fixed safe subcheck records that identify completed, failed, and
  skipped smoke stages.

## Impact

- Affected code: `scripts/mvp-session-smoke.mjs` and focused smoke tests.
- Affected docs/specs: `openspec/specs/mvp-session-command-kit/spec.md` via this
  change's delta spec.
- No dependency, protocol, relay runtime, auth, installer, service, or native
  Windows API changes.
