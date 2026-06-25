## ADDED Requirements

### Requirement: MVP smoke check reports bounded audit summary metadata

The root MVP smoke check SHALL derive a read-only bounded audit summary from
the existing configured local smoke audit files after audit readiness passes.
The summary SHALL include only fixed role-local record counts, outcome counts,
and known coverage booleans for expected MVP smoke evidence such as consent,
screen-frame output, input sending, and lifecycle revocation. Human and JSON
output MUST NOT include audit paths, raw audit lines, event ids, authorization
ids, actor ids, target ids, detail values, reasons, raw action strings, raw
child output, tokens, pairing codes, credentials, private reasons, screen
contents, input contents, clipboard contents, file-transfer contents,
diagnostics dumps, or full secrets.

#### Scenario: Smoke JSON includes bounded audit summary

- **WHEN** the smoke workflow verifies relay, frame, surface, signal, input,
  audit, and lifecycle readiness and is invoked with `--json`
- **THEN** the emitted JSON includes a fixed `auditSummary` object for host and
  viewer audit coverage
- **AND** the summary contains only bounded counts and fixed booleans
- **AND** it does not include raw audit record content or local audit file
  paths

#### Scenario: Ready helper preserves bounded smoke audit summary

- **WHEN** `npm run mvp:ready -- --include-smoke --json` consumes bounded
  smoke JSON containing the fixed audit summary
- **THEN** the ready helper accepts the smoke result and may include the same
  bounded audit summary inside the aggregate smoke check metadata
- **AND** ready output MUST NOT echo raw child output, generated command
  strings, audit paths, raw audit records, raw action strings, event ids,
  authorization ids, tokens, pairing codes, credentials, private reasons, or
  full secrets

#### Scenario: Malformed audit summary fails closed

- **WHEN** a smoke result consumed by the ready helper contains malformed audit
  summary shape, unexpected audit summary fields, unsafe counts, unsafe
  strings, raw paths, raw actions, or private diagnostic metadata
- **THEN** the ready helper treats the smoke output as malformed
- **AND** aggregate diagnostics remain bounded and do not expose the unsafe
  values
