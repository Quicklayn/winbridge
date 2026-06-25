## ADDED Requirements

### Requirement: MVP native preflight validates fixed probe JSON success markers

The root MVP native preflight helper SHALL treat a fixed PowerShell prerequisite
probe as successful only when the probe exits successfully and emits bounded
JSON stdout with the exact top-level object shape `{ "ok": true }`. The helper
MUST reject empty stdout, malformed JSON, arrays, null, non-object JSON,
`ok=false`, missing `ok`, extra top-level fields, and oversized stdout. Rejected
probe output MUST use the existing bounded per-probe failure reason and MUST
NOT be echoed in human output, JSON output, thrown errors, logs, or aggregate
readiness diagnostics.

#### Scenario: Probe success marker is accepted

- **WHEN** a fixed native preflight PowerShell probe exits successfully and emits
  exactly `{ "ok": true }` as bounded JSON stdout
- **THEN** the helper records that probe as passed
- **AND** default and JSON CLI output contain only bounded readiness metadata

#### Scenario: Malformed success marker fails closed

- **WHEN** a fixed native preflight PowerShell probe exits successfully but emits
  empty, malformed, false, array-shaped, non-object, extra-field, oversized, or
  otherwise unexpected stdout
- **THEN** the helper records that probe as failed with the same bounded reason
  code used for that probe's execution failure
- **AND** diagnostics MUST NOT expose raw PowerShell stdout, scripts, local
  paths, tokens, pairing codes, credentials, screen contents, input contents,
  keystrokes, private reasons, raw exceptions, environment values, or full
  secrets

#### Scenario: Strict marker validation remains read-only

- **WHEN** the helper validates a fixed native preflight probe's stdout
- **THEN** validation MUST NOT invoke screen capture, apply OS input, start
  relay, host, viewer, browser, sockets, HTTP listeners, services, startup
  persistence, unattended access, privilege elevation, clipboard, file transfer,
  diagnostics dumps, AV/EDR evasion, Windows prompt bypass, or hidden session
  behavior
