## MODIFIED Requirements

### Requirement: MVP doctor validates local readiness without side effects

`npm run mvp:doctor` SHALL validate local MVP readiness before a two-PC trial
without starting relay, host, viewer, browser, capture, input, services,
startup persistence, unattended access, or network listeners. The doctor SHALL
check the local Windows platform, supported Node runtime, required root scripts
including `mvp:ready` and `mvp:native-preflight`, required workspace manifests,
required static MVP source entrypoints, and required root MVP helper script
entrypoints. Its default success output SHALL include bounded readiness lines
for platform, Node, scripts, workspaces, entrypoints, and visible-consent
safety. When invoked with `--json`, it SHALL emit bounded machine-readable
readiness metadata containing only `ok`, optional bounded reason codes, and
per-check bounded status records. Its failure output SHALL use bounded reason
codes only and MUST NOT include raw paths, tokens, pairing codes, credentials,
screen contents, keystrokes, or full secrets.

#### Scenario: Doctor passes with required entrypoints
- **WHEN** the user runs `npm run mvp:doctor` on a Windows machine with the supported Node runtime, required scripts, required workspace manifests, required MVP source entrypoint files, and required root MVP helper script files
- **THEN** it reports readiness for platform, Node, scripts, workspaces, entrypoints, and visible-consent safety
- **AND** it does not start relay, host, viewer, browser, capture, input, services, startup persistence, unattended access, or network listeners

#### Scenario: Doctor emits bounded JSON readiness
- **WHEN** the user runs `npm run mvp:doctor -- --json`
- **THEN** the doctor emits JSON with bounded readiness status and per-check metadata
- **AND** the JSON MUST NOT include raw paths, tokens, pairing codes, credentials, screen contents, keystrokes, private reasons, package contents, raw exceptions, or full secrets

#### Scenario: Doctor fails when an entrypoint is missing
- **WHEN** a required MVP source entrypoint file or root MVP helper script file is missing
- **THEN** the doctor exits with a bounded `missing-entrypoint` reason
- **AND** the output MUST NOT include the missing path, tokens, pairing codes, credentials, screen contents, keystrokes, or full secrets

#### Scenario: Doctor rejects unsupported local prerequisites
- **WHEN** the local platform, Node runtime, root scripts, workspace manifests, source entrypoints, or root helper script entrypoints are unsupported or incomplete
- **THEN** the doctor fails closed with a bounded reason code before starting relay, host, viewer, browser, capture, input, services, startup persistence, unattended access, or network listeners

## ADDED Requirements

### Requirement: MVP ready helper aggregates local readiness checks

The project SHALL provide a root `npm run mvp:ready` helper that aggregates
local MVP readiness checks before a two-PC trial. By default it SHALL run the
root MVP doctor and root MVP native preflight sequentially, stop after the first
failed check, and report only bounded check status metadata. When invoked with
`--include-smoke`, it SHALL also run the existing root MVP smoke check after the
default checks pass. When invoked with `--json`, it SHALL emit bounded
machine-readable aggregate readiness metadata containing only `ok`, optional
bounded reason codes, and per-check bounded status records. It MUST NOT echo raw
child stdout/stderr, frame bytes, surface mutation tokens, raw input commands,
relay tokens, pairing codes, credentials, private reasons, screen contents,
clipboard contents, file-transfer contents, diagnostics dumps, or full secrets.

#### Scenario: Ready helper passes default read-only checks

- **WHEN** a developer runs `npm run mvp:ready` and both default checks pass
- **THEN** it reports bounded success for doctor and native preflight
- **AND** it reports smoke as skipped
- **AND** it does not start relay, host, viewer, browser, capture, input,
  services, startup persistence, unattended access, privilege elevation, or
  Windows prompt bypass

#### Scenario: Ready helper includes smoke only when requested

- **WHEN** a developer runs `npm run mvp:ready -- --include-smoke`
- **THEN** it runs the existing bounded local MVP smoke check after doctor and
  native preflight pass
- **AND** it reports bounded success or failure metadata for the smoke check
- **AND** it does not use Windows capture, OS input application, browser
  automation, services, startup persistence, unattended access, privilege
  elevation, or Windows prompt bypass

#### Scenario: Ready helper emits bounded JSON

- **WHEN** a developer runs `npm run mvp:ready -- --json`
- **THEN** it emits JSON with bounded aggregate status and per-check metadata
- **AND** JSON output MUST NOT include raw child stdout/stderr, local paths,
  frame bytes, surface mutation tokens, raw input commands, relay tokens,
  pairing codes, credentials, private reasons, screen contents, input contents,
  clipboard contents, file-transfer contents, diagnostics dumps, or full secrets

#### Scenario: Ready helper fails closed

- **WHEN** argument parsing fails, a child process cannot start, or a child
  readiness check exits non-zero
- **THEN** the helper exits non-zero with bounded diagnostics
- **AND** it stops before running later checks
- **AND** diagnostics MUST NOT echo raw rejected values, raw child stdout/stderr,
  paths containing secrets, tokens, pairing codes, credentials, private reasons,
  screen contents, input contents, clipboard contents, file-transfer contents,
  diagnostics dumps, or full secrets
