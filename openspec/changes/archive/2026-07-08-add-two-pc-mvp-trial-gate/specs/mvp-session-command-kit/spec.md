## ADDED Requirements

### Requirement: MVP trial helper prints a two-PC operator workflow

The project SHALL provide a root `npm run mvp:trial` helper that prints a
bounded, non-executing two-PC development MVP operator workflow. The helper
MUST include fixed relay, host, viewer, and post-run evidence sections that
reference the existing role-scoped `mvp:ready` gates, the existing
role-filtered `mvp:commands` outputs, and the strict
`mvp:audit-summary -- --require-mvp-evidence` post-run gate. The helper MUST
support text output by default and bounded JSON output with `--json`. It MUST
support `--role relay`, `--role host`, `--role viewer`, and `--role evidence`
filters without changing the default full workflow. Plan output MUST remain
bounded and MUST NOT echo raw relay URLs, pairing codes, token values, token
environment values, generated command strings, local URLs, local paths,
stdout, stderr, audit records, frame bytes, screen contents, input contents,
clipboard contents, credentials, diagnostics dumps, or full secrets. The helper
MUST NOT start relay, host, viewer, browser, capture, input, sockets, HTTP
listeners, services, startup persistence, unattended access, privilege
elevation, remote discovery, firewall changes, AV/EDR evasion, Windows prompt
bypass, or hidden-session behavior.

#### Scenario: Default trial plan prints every role

- **WHEN** a developer runs `npm run mvp:trial`
- **THEN** the helper prints bounded relay, host, viewer, and evidence
  workflow sections
- **AND** the output references the existing readiness, command-plan, and
  strict audit-summary gates without executing them

#### Scenario: Trial plan JSON remains bounded

- **WHEN** a developer runs `npm run mvp:trial -- --json`
- **THEN** the helper emits machine-readable metadata containing only `ok`,
  fixed workflow role records, fixed safety reminders, and fixed command
  references
- **AND** the JSON omits generated command strings, relay URLs, pairing codes,
  tokens, token environment values, local URLs, local paths, audit records,
  frame bytes, screen contents, input contents, credentials, stdout, stderr,
  diagnostics, and full secrets

#### Scenario: Trial plan filters one role

- **WHEN** a developer runs `npm run mvp:trial -- --role host`
- **THEN** the helper prints only the bounded host workflow section
- **AND** it does not print relay, viewer, browser, or evidence runtime command
  blocks

#### Scenario: Trial plan rejects malformed options

- **WHEN** a developer supplies duplicate, unknown, blank, unsafe, or
  unsupported trial-plan options
- **THEN** the helper exits non-zero with bounded fixed diagnostics before
  printing workflow sections
- **AND** it does not echo unsafe option values or execute runtime commands
