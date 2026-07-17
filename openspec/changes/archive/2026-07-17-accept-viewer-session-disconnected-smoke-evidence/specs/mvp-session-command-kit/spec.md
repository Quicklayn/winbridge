## MODIFIED Requirements

### Requirement: MVP smoke check reports bounded audit summary metadata

The root MVP smoke check SHALL derive a read-only bounded audit summary from
the existing configured local smoke audit files after audit readiness passes.
The summary SHALL include only fixed role-local record counts, outcome counts,
and known coverage booleans for expected MVP smoke evidence such as consent,
screen-frame send/output, input sending, lifecycle revocation, and disconnect
or terminal lifecycle evidence. Before the smoke check reports the audit
subcheck as passed, it MUST require accepted audit outcomes for the fixed MVP
evidence flags in their expected local roles: host authorization approval, host
active visible authorization, host screen frame sent, host permission revoked,
host disconnect, host local session disconnected, or terminal lifecycle
evidence; viewer screen frame output, viewer input sent, and viewer disconnect
requested/sent or viewer local `agent-shell.session.disconnected` evidence.
Denied, failed, missing, or wrong-role evidence MUST NOT satisfy smoke audit
readiness. Human and JSON output MUST NOT include audit paths, raw audit lines,
event ids, authorization ids, actor ids, target ids, detail values, reasons, raw
action strings, raw child output, tokens, pairing codes, credentials, private
reasons, screen contents, input contents, clipboard contents, file-transfer
contents, diagnostics dumps, or full secrets.

#### Scenario: Smoke JSON includes bounded audit summary

- **WHEN** the smoke workflow verifies relay, frame, surface, signal, input,
  strict role-bound audit evidence, and lifecycle readiness and is invoked
  with `--json`
- **THEN** the emitted JSON includes a fixed `auditSummary` object for host and
  viewer audit coverage
- **AND** the summary contains only bounded counts and fixed booleans
- **AND** it does not include raw audit record content or local audit file
  paths

#### Scenario: Canonical viewer local leave satisfies disconnect evidence

- **WHEN** the configured host audit file contains all accepted host-required
  evidence and the configured viewer audit file contains accepted screen frame
  output, input sent, and `agent-shell.session.disconnected` records
- **THEN** strict smoke audit readiness treats the viewer-local canonical record
  as `disconnectObserved=true`
- **AND** it does not require a duplicate viewer disconnect requested or sent
  action

#### Scenario: Wrong-role or partial smoke audit evidence fails closed

- **WHEN** the configured smoke audit files are parseable but host-required
  evidence appears only in the viewer log, viewer-required evidence appears
  only in the host log, disconnect evidence is missing for either role, a
  canonical viewer local disconnect record is denied or failed, or one or more
  other required records are denied or failed
- **THEN** the smoke helper exits non-zero with bounded diagnostics
- **AND** it reports only the fixed `audit-not-ready` reason
- **AND** diagnostics MUST NOT expose raw logs, paths, record details,
  identifiers, frame bytes, input contents, command strings, or secrets

#### Scenario: Ready helper preserves bounded smoke audit summary

- **WHEN** `npm run mvp:ready -- --include-smoke --json` consumes bounded
  smoke JSON containing the fixed audit summary
- **THEN** the ready helper accepts the smoke result and may include the same
  bounded audit summary inside the aggregate smoke check metadata
- **AND** ready output MUST NOT echo raw child output, generated command
  strings, audit paths, raw audit records, raw action strings, event ids,
  authorization ids, actor ids, target ids, details, reasons, frame bytes,
  input contents, tokens, pairing codes, credentials, or full secrets

#### Scenario: Malformed audit summary fails closed

- **WHEN** a smoke result consumed by the ready helper contains malformed audit
  summary shape, unexpected audit summary fields, unsafe counts, unsafe
  strings, raw paths, raw actions, or private diagnostic metadata
- **THEN** the ready helper treats the smoke output as malformed
- **AND** aggregate diagnostics remain bounded and do not expose the unsafe
  values
