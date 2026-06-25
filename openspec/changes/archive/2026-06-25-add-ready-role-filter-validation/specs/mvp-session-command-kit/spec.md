## MODIFIED Requirements

### Requirement: MVP ready helper aggregates local readiness checks

The project SHALL provide a root `npm run mvp:ready` helper that aggregates
local MVP readiness checks before a two-PC trial. By default it SHALL run the
root MVP doctor, root MVP native preflight, root MVP localhost command-plan
validation, root MVP representative LAN command-plan validation, root MVP
shared-token command-plan validation, and fixed role-filter command validation
for `mvp:commands -- --only relay`, `host`, `viewer`, `browser`, and
`preflight` sequentially, stop after the first failed check, and report only
bounded check status metadata. The localhost command-plan validation SHALL run
the existing non-executing MVP command kit in bounded JSON mode, verify that it
emits an `ok=true` non-executing session command plan with the fixed command
names `preflight.ready`, `preflight.doctor`, `preflight.native`,
`preflight.smoke`, `relay`, `host`, `viewer`, and `browser`, and MUST NOT
surface raw command strings, local paths, relay URLs, pairing codes, relay
tokens, token environment values, stdout, stderr, or child output in readiness
output. The LAN command-plan validation SHALL run the same non-executing command
kit with a representative safe LAN relay host and verify the expected relay URL
only as internal readiness metadata. The shared-token command-plan validation
SHALL run the same non-executing command kit with a fixed relay token
environment variable name and verify the expected token environment reference
only as internal readiness metadata. The role-filter command validations SHALL
run the same non-executing command kit in text mode with exactly one fixed
`--only` target per check, verify bounded target-specific output for the
selected relay, host, viewer, browser, or preflight block, reject malformed or
cross-target command text, and MUST NOT echo the filtered command block,
pairing, relay URL, local URLs, paths, tokens, token environment values, stdout,
stderr, or child output in readiness output. With `--include-smoke`, the helper
SHALL also run the root MVP smoke check and root MVP LAN smoke check in bounded
JSON mode after the default checks pass. Without `--include-smoke`, the helper
SHALL mark smoke and LAN smoke as explicitly skipped metadata only. The helper
MUST stop on the first failed check and MUST NOT start relay, host, viewer,
browser, capture, input, services, startup persistence, unattended access,
privilege elevation, remote discovery, network probing, firewall changes,
clipboard access, file transfer, diagnostics dumps, AV/EDR evasion, Windows
prompt bypass, hidden sessions, or production deployment behavior.

#### Scenario: Ready validates role-filtered command output

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** it runs bounded non-executing `mvp:commands -- --only relay`,
  `host`, `viewer`, `browser`, and `preflight` checks after JSON command-plan
  validation
- **AND** success output includes only fixed readiness check names and statuses
- **AND** success output MUST NOT include raw filtered command text, relay URLs,
  local browser URLs, paths, pairing codes, token references, stdout, stderr, or
  child output

#### Scenario: Ready rejects malformed role-filtered output

- **WHEN** a filtered command-kit check exits successfully but emits malformed,
  oversized, unsafe, or cross-target text
- **THEN** `mvp:ready` fails closed at that fixed role-filter check
- **AND** the failure output includes only the fixed check name and safe reason
  code
- **AND** the failure output MUST NOT echo the malformed filtered output,
  command strings, URLs, paths, pairing codes, token references, stdout, stderr,
  or child output
