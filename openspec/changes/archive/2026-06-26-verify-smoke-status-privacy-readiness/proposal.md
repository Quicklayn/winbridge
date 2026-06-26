## Why

The MVP smoke workflow currently treats `/status` readiness as successful when
`signalProbeAckReceived=true` is present. After the local surface gained bounded
input readiness booleans, the smoke gate should prove that the status response
is active, visible, input-ready, and still secret-safe before it allows input
and disconnect checks to proceed.

## What Changes

- Strengthen the existing smoke `signal` subcheck to validate sanitized
  `/status` readiness instead of checking only the signal acknowledgement flag.
- Require active visible status plus bounded pointer and keyboard readiness
  booleans before smoke input checks continue.
- Reject status responses containing raw authorization ids, permission arrays,
  pairing/token values, raw signal payload markers, raw input data, frame data,
  audit paths, diagnostics, or child output.
- Update focused smoke tests and README/OpenSpec documentation for the stricter
  status readiness contract.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mvp-session-command-kit`: the MVP smoke helper shall verify bounded
  sanitized `/status` readiness before input and later smoke checks.

## Impact

- Affected code: `scripts/mvp-session-smoke.mjs`,
  `scripts/mvp-session-smoke.test.ts`, `README.md`, and OpenSpec artifacts.
- Affected systems: local development smoke status verification only.
- Safety impact: improves leak resistance and consent-visible readiness checks.
  This touches local status metadata and smoke diagnostics; it does not add
  capture, OS input, relay behavior, installer behavior, services, startup
  persistence, privilege elevation, credential access, clipboard access, remote
  shell behavior, AV/EDR behavior, Windows prompt behavior, unattended access,
  or hidden sessions.
