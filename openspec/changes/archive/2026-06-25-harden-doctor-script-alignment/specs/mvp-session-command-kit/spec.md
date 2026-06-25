## MODIFIED Requirements

### Requirement: MVP doctor validates local readiness without side effects

`npm run mvp:doctor` SHALL validate local MVP readiness before a two-PC trial
without starting relay, host, viewer, browser, capture, input, services,
startup persistence, unattended access, or network listeners. The doctor SHALL
check the local Windows platform, supported Node runtime, required root scripts
including `mvp:ready` and `mvp:native-preflight`, required root script
alignment for the reviewed `dev:agent`, `dev:relay`, and `mvp:smoke`
workflows, required workspace manifests, required root MVP helper script
entrypoints, and required source entrypoints for the relay, protocol, audit,
Windows capture, Windows input, and critical agent-shell MVP modules including
host controls, viewer controls, viewer frame output, viewer local control
surface, screen-frame output, and CLI shutdown. The `dev:agent` script
alignment check SHALL require the protocol, audit-log, Windows capture, and
Windows input workspace builds before the agent-shell development entrypoint.
The `dev:relay` script alignment check SHALL require the protocol and audit-log
workspace builds before the relay development entrypoint. The `mvp:smoke`
script alignment check SHALL require a root build before the smoke helper
entrypoint. Its default success output SHALL include bounded readiness lines for
platform, Node, scripts, workspaces, entrypoints, and visible-consent safety.
When invoked with `--json`, it SHALL emit bounded machine-readable readiness
metadata containing only `ok`, optional bounded reason codes, and per-check
bounded status records. Its failure output SHALL use bounded reason codes only
and MUST NOT include raw script bodies, package JSON content, raw paths, tokens,
pairing codes, credentials, screen contents, keystrokes, environment values,
stdout, stderr, or full secrets.

#### Scenario: Doctor fails when root scripts drift from the reviewed MVP workflow

- **WHEN** a required root MVP script exists but no longer contains the
  reviewed ordered workspace build or helper entrypoint chain
- **THEN** the doctor exits with the bounded `script-misaligned` reason
- **AND** output includes only fixed readiness check metadata
- **AND** output MUST NOT echo script bodies, package JSON content, paths,
  environment values, tokens, pairing codes, credentials, screen contents,
  keystrokes, stdout, stderr, or full secrets
