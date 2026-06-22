## MODIFIED Requirements

### Requirement: MVP doctor validates local readiness without side effects

`npm run mvp:doctor` SHALL validate local MVP readiness before a two-PC trial
without starting relay, host, viewer, browser, capture, input, services,
startup persistence, unattended access, or network listeners. The doctor SHALL
check the local Windows platform, supported Node runtime, required root scripts
including `mvp:native-preflight`, required workspace manifests, required static
MVP source entrypoints, and required root MVP helper script entrypoints. Its
default success output SHALL include bounded readiness lines for platform, Node,
scripts, workspaces, entrypoints, and visible-consent safety. When invoked with
`--json`, it SHALL emit bounded machine-readable readiness metadata containing
only `ok`, optional bounded reason codes, and per-check bounded status records.
Its failure output SHALL use bounded reason codes only and MUST NOT include raw
paths, tokens, pairing codes, credentials, screen contents, keystrokes, or full
secrets.

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
