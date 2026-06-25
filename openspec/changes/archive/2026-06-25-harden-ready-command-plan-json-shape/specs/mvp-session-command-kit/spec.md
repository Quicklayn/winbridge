## MODIFIED Requirements

### Requirement: MVP ready helper aggregates local readiness checks

The project SHALL provide a root `npm run mvp:ready` helper that aggregates
local MVP readiness checks before a two-PC trial. By default it SHALL run the
root MVP doctor, root MVP native preflight, root MVP localhost command-plan
validation, root MVP representative LAN command-plan validation, and root MVP
shared-token command-plan validation sequentially, stop after the first failed
check, and report only bounded check status metadata. The localhost
command-plan validation SHALL run the existing non-executing MVP command kit in
bounded JSON mode, verify that it emits an `ok=true` non-executing session
command plan with the fixed command names `preflight.ready`,
`preflight.doctor`, `preflight.native`, `preflight.smoke`, `relay`, `host`,
`viewer`, and `browser`, and MUST NOT surface raw command strings or child
output. The ready helper MUST reject command-plan JSON unless the top-level
object contains only the fixed bounded fields `ok`, `mode`, `nonExecuting`,
`commands`, and optional safe `safety` metadata. The representative LAN
command-plan validation SHALL run the existing non-executing MVP command kit in
bounded JSON mode with a fixed safe LAN relay host, verify the same fixed
command names, and verify that the relay, host, and viewer command entries
target the derived LAN relay URL without surfacing raw command strings or child
output. The shared-token command-plan validation SHALL run the existing
non-executing MVP command kit in bounded JSON mode with a fixed safe token
environment variable name, verify the same fixed command names, and verify that
the host and viewer command entries reference that token environment variable
without surfacing raw command strings or child output. When invoked with
`--include-smoke`, it SHALL also run the existing root MVP smoke check after the
default checks pass. The included smoke step SHALL use the smoke check's
bounded JSON mode and MAY surface fixed safe smoke subchecks for relay, frame,
surface, signal, input, and audit readiness or failure status in the aggregate
ready output. Top-level smoke JSON consumed by the ready helper MUST be
rejected unless it contains only fixed bounded fields needed for aggregate
readiness: `ok`, `checks`, optional bounded `reason` on failure, and the
default cleanup marker `artifacts` with value `cleaned` on success. Smoke
subcheck records MUST be rejected unless they contain only the fixed safe
`name`, boolean `ok`, and optional boolean `skipped` fields. When invoked with
`--json`, it SHALL emit bounded machine-readable aggregate readiness metadata
containing only `ok`, optional bounded reason codes, per-check bounded status
records, optional fixed smoke subcheck status records, and safe skipped state.
It MUST NOT echo raw child stdout/stderr, generated command strings, frame
paths, surface URLs, audit paths, frame bytes, surface mutation tokens, raw
input commands, relay tokens, pairing codes, credentials, private reasons, raw
signal payloads, raw audit contents, screen contents, input contents,
clipboard contents, file-transfer contents, diagnostics dumps, or full secrets.

#### Scenario: Ready helper rejects command-plan JSON with unexpected top-level fields

- **WHEN** `npm run mvp:ready` receives command-plan JSON where the top-level
  object includes an unexpected field such as raw output, path, token, pairing
  code, or private diagnostic metadata
- **THEN** the ready helper treats the command-plan output as malformed and
  fails closed with bounded aggregate diagnostics
- **AND** ready output MUST NOT include the unexpected field value

#### Scenario: Ready helper accepts bounded command-plan safety metadata

- **WHEN** `npm run mvp:ready` receives command-plan JSON with safe `safety`
  string metadata alongside the expected non-executing session plan
- **THEN** the ready helper may accept the command-plan readiness metadata
- **AND** ready output MUST NOT echo the generated command strings
