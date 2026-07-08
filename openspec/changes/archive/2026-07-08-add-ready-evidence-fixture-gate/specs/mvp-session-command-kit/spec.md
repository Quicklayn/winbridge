## ADDED Requirements

### Requirement: MVP ready supports explicit evidence fixture gate

The root `npm run mvp:ready` helper SHALL support an explicit
`--include-evidence-fixture` option that runs the generated local MVP evidence
fixture dry run after the default aggregate readiness checks pass. The option
MUST run the existing fixture helper with bounded JSON verification semantics
equivalent to `mvp:evidence-fixture -- --verify --json`, and MUST accept only a
bounded result with `ok=true`, the reviewed host and viewer fixture record
counts, and `verified=true`. The default readiness command without this option
MUST NOT run the fixture helper or write fixture files. Role-scoped readiness
MUST reject `--include-evidence-fixture` before running checks.

Readiness output MUST report only fixed check status metadata for the evidence
fixture gate and MUST NOT echo generated fixture paths, raw fixture JSONL, raw
audit records, identifiers, local paths, stdout, stderr, child output, frame
bytes, screen contents, input contents, clipboard contents, credentials,
tokens, token environment values, pairing codes, or full secrets. The
readiness integration MUST NOT start relay, host, viewer, browser, capture,
input, sockets, HTTP listeners, services, startup persistence, unattended
access, privilege elevation, remote log retrieval, log upload, hidden sessions,
AV/EDR evasion, or Windows prompt bypass.

#### Scenario: Ready runs evidence fixture when explicitly included

- **WHEN** a developer runs `npm run mvp:ready -- --include-evidence-fixture`
- **THEN** readiness runs the default aggregate checks first
- **AND** then runs the evidence fixture helper in strict JSON verify mode
- **AND** output reports the fixed `evidence-fixture` check as passed without
  exposing generated fixture paths or raw audit content

#### Scenario: Default ready does not write evidence fixtures

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** readiness does not include the evidence fixture check
- **AND** it does not run `mvp:evidence-fixture` or write fixture files

#### Scenario: Evidence fixture drift fails closed

- **WHEN** the evidence fixture helper exits non-zero, emits malformed JSON,
  omits reviewed counts, reports unexpected counts, or reports `verified=false`
- **THEN** `mvp:ready` fails closed at the fixed `evidence-fixture` check
- **AND** diagnostics do not echo raw helper output, paths, audit records,
  identifiers, stdout, stderr, child output, tokens, pairing codes, credentials,
  or secrets

#### Scenario: Role-scoped ready rejects evidence fixture

- **WHEN** a developer combines `--role relay`, `--role host`, or
  `--role viewer` with `--include-evidence-fixture`
- **THEN** the helper rejects the invocation before running checks
- **AND** diagnostics remain bounded and do not echo raw unsafe input
