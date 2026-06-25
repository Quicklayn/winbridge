## Why

The MVP smoke workflow currently proves the consent-bound happy path for relay,
frame output, local viewer surface, signal readiness, input, and audit records.
Before a two-PC trial, the same local smoke gate should also prove that
lifecycle loss of authorization fails input closed without exposing raw
commands or secrets.

## What Changes

- Extend the root MVP smoke check with bounded lifecycle denial checks after
  the existing happy-path input checks.
- Verify that explicit host-side lifecycle controls such as pause or permission
  revocation cause the loopback viewer surface to stop accepting input.
- Keep viewer disconnect cleanup bounded and local.
- Surface lifecycle denial readiness as fixed safe smoke subcheck metadata in
  human and JSON output.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mvp-session-command-kit`: MVP smoke check now verifies lifecycle-denial
  behavior for the local static workflow.

## Impact

- Affected code: `scripts/mvp-session-smoke.mjs`,
  `scripts/mvp-session-smoke.test.ts`, `scripts/mvp-ready.mjs`,
  `scripts/mvp-ready.test.ts`, README, and OpenSpec documentation.
- Affected systems: local same-machine MVP smoke workflow only.
- Safety impact: fail-closed verification only. The change does not add native
  capture, OS input, auth bypass, relay production behavior, installer,
  startup, service, token, log expansion, privilege elevation, hidden sessions,
  unattended access, evasion, or Windows prompt bypass behavior.
- Non-goals: no production viewer UI, no browser automation, no clipboard/file
  transfer/diagnostics, no remote host discovery, no firewall changes, and no
  new permission type.
