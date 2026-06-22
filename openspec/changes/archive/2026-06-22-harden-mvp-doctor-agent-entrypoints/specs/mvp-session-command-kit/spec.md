## MODIFIED Requirements

### Requirement: MVP doctor validates local readiness without side effects

`npm run mvp:doctor` SHALL validate local MVP readiness before a two-PC trial
without starting relay, host, viewer, browser, capture, input, services,
startup persistence, unattended access, or network listeners. The doctor SHALL
check the local Windows platform, supported Node runtime, required root scripts
including `mvp:ready` and `mvp:native-preflight`, required workspace manifests,
required root MVP helper script entrypoints, and required source entrypoints for
the relay, protocol, audit, Windows capture, Windows input, and critical
agent-shell MVP modules including host controls, viewer controls, viewer frame
output, viewer local control surface, screen-frame output, and CLI shutdown.
Its default success output SHALL include bounded readiness lines for platform,
Node, scripts, workspaces, entrypoints, and visible-consent safety. When invoked
with `--json`, it SHALL emit bounded machine-readable readiness metadata
containing only `ok`, optional bounded reason codes, and per-check bounded
status records. Its failure output SHALL use bounded reason codes only and MUST
NOT include raw paths, tokens, pairing codes, credentials, screen contents,
keystrokes, or full secrets.

#### Scenario: Doctor fails when a critical agent-shell MVP module is missing

- **WHEN** a critical agent-shell MVP module required by the generated two-PC
  command plan is missing
- **THEN** the doctor exits with a bounded `missing-entrypoint` reason
- **AND** the output MUST NOT include the missing path, tokens, pairing codes,
  credentials, screen contents, keystrokes, or full secrets
