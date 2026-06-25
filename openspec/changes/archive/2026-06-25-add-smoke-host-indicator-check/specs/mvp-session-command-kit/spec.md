## ADDED Requirements

### Requirement: MVP smoke check verifies host visible indicator readiness

The root MVP smoke check SHALL verify that the local host process emits a
bounded active visible host indicator marker during the same-machine smoke
workflow. The check SHALL use only fixed safe metadata markers indicating host
indicator state, active visibility, and a positive permission count. Human and
JSON output MUST represent this verification using only fixed subcheck metadata
and bounded reason codes. The smoke and ready helpers MUST NOT emit raw host
stdout or stderr, authorization ids, local paths, process ids, tokens, pairing
codes, credentials, private reasons, screen contents, input contents,
clipboard contents, file-transfer contents, diagnostics dumps, or full secrets.

#### Scenario: Host indicator smoke subcheck passes

- **WHEN** the smoke host reaches active visible authorization
- **THEN** the smoke check observes the bounded active host indicator marker in
  the host process output
- **AND** it reports the fixed `indicator` subcheck as passed

#### Scenario: Host indicator smoke subcheck fails closed

- **WHEN** the host process does not emit an active visible indicator marker
  before the smoke deadline
- **THEN** the smoke helper exits non-zero with a bounded
  `indicator-not-ready` reason
- **AND** it stops any started child processes before returning control
- **AND** diagnostics MUST NOT expose raw child output or authorization ids

#### Scenario: Ready helper aggregates indicator subcheck

- **WHEN** `npm run mvp:ready -- --include-smoke` consumes bounded smoke JSON
  containing the fixed `indicator` subcheck
- **THEN** the ready helper accepts and reports that fixed subcheck
- **AND** malformed or unexpected indicator metadata fails closed without
  exposing unsafe values
