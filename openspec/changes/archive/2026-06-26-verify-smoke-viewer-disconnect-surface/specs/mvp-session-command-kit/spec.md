## ADDED Requirements

### Requirement: MVP smoke check verifies viewer local surface disconnect

The root MVP smoke check SHALL verify that the local static workflow can end
the viewer side through the token-protected loopback viewer surface
`/disconnect` path after frame, surface, signal, guard, input, audit, and
lifecycle readiness have passed. The check SHALL post only a fixed empty JSON
body with the existing per-run local surface mutation token, same-origin
header, and JSON content type. It SHALL treat the disconnect subcheck as
successful only when the local surface returns a bounded `202` response with
`ok=true` and `action=disconnect`. Human and JSON output MUST represent this
verification using only the fixed `viewer-disconnect` subcheck metadata and
bounded reason codes. The smoke check MUST stop all child processes after
success, failure, timeout, or interrupt.

#### Scenario: Viewer disconnect smoke subcheck passes

- **WHEN** the smoke workflow has verified frame, surface, signal, guard,
  input, audit, and lifecycle readiness
- **THEN** it posts to the token-protected local viewer surface `/disconnect`
  path
- **AND** it reports the fixed `viewer-disconnect` subcheck as passed
- **AND** it MUST NOT forge relay lifecycle messages, bypass runtime `leave()`,
  reconnect peers, grant permissions, hide host visibility, start capture, send
  input, or bypass runtime authorization gates

#### Scenario: Viewer disconnect smoke subcheck fails closed

- **WHEN** the local viewer surface disconnect path is unavailable, rejects the
  fixed request, returns an unexpected response, times out, or cannot be
  reached after prior readiness checks
- **THEN** the smoke helper exits non-zero with the bounded
  `viewer-disconnect-not-ready` reason
- **AND** it stops any started child processes before returning control
- **AND** diagnostics MUST NOT expose mutation tokens, local surface URLs,
  ports, response bodies, raw child output, relay URLs, frame paths, audit
  paths, raw audit records, authorization ids, peer ids, raw input commands,
  pointer coordinates, key values, modifier values, pairing codes, credentials,
  private reasons, screen contents, input contents, clipboard contents,
  file-transfer contents, diagnostics dumps, or full secrets

#### Scenario: Ready helper aggregates viewer disconnect subcheck

- **WHEN** `npm run mvp:ready -- --include-smoke --json` consumes bounded smoke
  JSON containing the fixed `viewer-disconnect` subcheck
- **THEN** the ready helper accepts and reports that fixed subcheck for both
  default smoke and LAN-style smoke when included
- **AND** malformed, missing, duplicate, or unexpected viewer-disconnect
  subcheck metadata fails closed without exposing unsafe values
