## ADDED Requirements

### Requirement: Preflight token-env all-smoke omits self-assignment

The MVP command kit SHALL avoid redundant token-env self-assignment in
`preflight.ready-all-smoke` command output. When a preflight command plan is
rendered with `--token-env WINBRIDGE_RELAY_SHARED_TOKEN`, the all-smoke
preflight command MUST be the fixed non-assignment command
`npm run mvp:ready -- --include-all-smoke` and the text or JSON plan MUST still
include bounded token-mode guidance that references only `$env:<NAME>` and
states that the raw token value is not printed. When rendered with any other
bounded `--token-env <NAME>`, the command MAY keep the reviewed
environment-reference assignment from `$env:<NAME>` to
`$env:WINBRIDGE_RELAY_SHARED_TOKEN`. The command kit MUST NOT print raw token
values, command output, child output, relay URLs, local URLs, pairing codes,
credentials, local paths, frame bytes, input contents, clipboard contents,
diagnostics, or full secrets.

The root MVP ready helper SHALL accept the no-assignment
`preflight.ready-all-smoke` command only when validating the reviewed expected
token env `WINBRIDGE_RELAY_SHARED_TOKEN`; it MUST still fail closed if the
token-env preflight JSON command omits the fixed command entry, uses an
unexpected environment variable name in an assignment or bounded token-mode
guidance, includes a raw token literal, changes the preflight JSON shape, or
includes runtime command-plan drift.

#### Scenario: Reviewed token-env preflight command omits self-assignment

- **WHEN** a developer runs
  `npm run mvp:commands -- --preflight-only --token-env WINBRIDGE_RELAY_SHARED_TOKEN`
- **THEN** the all-smoke preflight instruction is
  `npm run mvp:ready -- --include-all-smoke`
- **AND** the output does not include
  `$env:WINBRIDGE_RELAY_SHARED_TOKEN = $env:WINBRIDGE_RELAY_SHARED_TOKEN`
- **AND** the output includes bounded token-mode guidance for
  `$env:WINBRIDGE_RELAY_SHARED_TOKEN`
- **AND** the helper remains non-executing and secret-safe

#### Scenario: Alternate token-env preflight command keeps assignment

- **WHEN** a developer runs
  `npm run mvp:commands -- --preflight-only --token-env WINBRIDGE_TEST_RELAY_TOKEN`
- **THEN** the all-smoke preflight instruction references
  `$env:WINBRIDGE_TEST_RELAY_TOKEN` and `$env:WINBRIDGE_RELAY_SHARED_TOKEN`
  through the reviewed environment-reference assignment
- **AND** it does not print a raw token value

#### Scenario: Ready accepts reviewed no-assignment token preflight JSON

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the token-env preflight JSON validation accepts the reviewed
  no-assignment all-smoke command for `WINBRIDGE_RELAY_SHARED_TOKEN`
- **AND** it requires bounded token-mode guidance for
  `$env:WINBRIDGE_RELAY_SHARED_TOKEN`
- **AND** readiness diagnostics report only bounded fixed status metadata

#### Scenario: Ready rejects alternate or raw token drift

- **WHEN** token-env preflight JSON output uses an unexpected token env
  assignment, omits bounded token-mode guidance, omits the all-smoke command,
  includes a raw token literal, or changes the preflight JSON shape
- **THEN** the ready helper fails closed
- **AND** diagnostics do not echo generated command strings, token references,
  token values, stdout, stderr, child output, credentials, screen contents,
  input contents, clipboard contents, or full secrets
