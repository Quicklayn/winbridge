## MODIFIED Requirements

### Requirement: MVP ready helper aggregates local readiness checks

The project SHALL provide a root `npm run mvp:ready` helper that aggregates
local MVP readiness checks before a two-PC trial. By default it SHALL run the
root MVP doctor, root MVP native preflight, and root MVP command-plan
validation sequentially, stop after the first failed check, and report only
bounded check status metadata. The command-plan validation SHALL run the
existing non-executing MVP command kit in bounded JSON mode, verify that it
emits an `ok=true` non-executing session command plan with the fixed command
names `preflight.ready`, `preflight.doctor`, `preflight.native`,
`preflight.smoke`, `relay`, `host`, `viewer`, and `browser`, and MUST NOT
surface raw command strings or child output. When invoked with
`--include-smoke`, it SHALL also run the existing root MVP smoke check after
the default checks pass. The included smoke step SHALL use the smoke check's
bounded JSON mode and MAY surface fixed safe smoke subchecks for relay, frame,
surface, signal, input, and audit readiness in the aggregate ready output. When
invoked with `--json`, it SHALL emit bounded machine-readable aggregate
readiness metadata containing only `ok`, optional bounded reason codes,
per-check bounded status records, optional fixed smoke subcheck status records,
and safe skipped state. It MUST NOT echo raw child stdout/stderr, generated
command strings, frame paths, surface URLs, audit paths, frame bytes, surface
mutation tokens, raw input commands, relay tokens, pairing codes, credentials,
private reasons, raw signal payloads, raw audit contents, screen contents,
input contents, clipboard contents, file-transfer contents, diagnostics dumps,
or full secrets.

#### Scenario: Ready helper passes default read-only checks

- **WHEN** a developer runs `npm run mvp:ready` and all default checks pass
- **THEN** it reports bounded success for doctor, native preflight, and
  command-plan readiness
- **AND** it reports smoke as skipped
- **AND** it does not start relay, host, viewer, browser, capture, input,
  services, startup persistence, unattended access, privilege elevation, or
  Windows prompt bypass

#### Scenario: Ready helper validates the non-executing command plan

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the ready helper invokes the existing MVP command kit in bounded JSON
  mode after doctor and native preflight pass
- **AND** it accepts only an `ok=true` non-executing session plan with fixed
  expected command names
- **AND** ready output MUST NOT include generated command strings, pairing
  codes, relay tokens, audit paths, frame paths, raw child output, credentials,
  screen contents, input contents, clipboard contents, file-transfer contents,
  diagnostics dumps, or full secrets

#### Scenario: Ready helper includes smoke only when requested

- **WHEN** a developer runs `npm run mvp:ready -- --include-smoke`
- **THEN** it runs the existing bounded local MVP smoke check after doctor,
  native preflight, and command-plan checks pass
- **AND** it reports bounded success or failure metadata for the smoke check
- **AND** it may report fixed bounded smoke subchecks for relay, frame, surface,
  signal, input, and audit readiness
- **AND** it does not use Windows capture, OS input application, browser
  automation, services, startup persistence, unattended access, privilege
  elevation, or Windows prompt bypass

#### Scenario: Ready helper emits bounded JSON

- **WHEN** a developer runs `npm run mvp:ready -- --json`
- **THEN** it emits JSON with bounded aggregate status and per-check metadata
- **AND** JSON output MUST NOT include raw child stdout/stderr, generated
  command strings, local paths, frame bytes, surface mutation tokens, raw input
  commands, relay tokens, pairing codes, credentials, private reasons, screen
  contents, input contents, clipboard contents, file-transfer contents,
  diagnostics dumps, or full secrets

#### Scenario: Ready helper emits bounded smoke subchecks

- **WHEN** a developer runs
  `npm run mvp:ready -- --json --include-smoke` and the smoke check passes with
  bounded JSON subchecks
- **THEN** the aggregate JSON includes only fixed safe smoke subcheck names and
  boolean readiness status
- **AND** JSON output MUST NOT include smoke stdout/stderr, frame paths, surface
  URLs, audit paths, frame bytes, surface mutation tokens, raw input commands,
  relay tokens, pairing codes, credentials, private reasons, raw signal
  payloads, raw audit contents, screen contents, input contents, clipboard
  contents, file-transfer contents, diagnostics dumps, or full secrets

#### Scenario: Ready helper fails closed

- **WHEN** argument parsing fails, a child process cannot start, a child
  readiness check exits non-zero, command-plan validation returns malformed or
  unexpected JSON metadata, or an included smoke check returns malformed or
  unexpected JSON metadata
- **THEN** the helper exits non-zero with bounded diagnostics
- **AND** it stops before running later checks
- **AND** diagnostics MUST NOT echo raw rejected values, raw child stdout/stderr,
  generated command strings, paths containing secrets, tokens, pairing codes,
  credentials, private reasons, screen contents, input contents, clipboard
  contents, file-transfer contents, diagnostics dumps, or full secrets
