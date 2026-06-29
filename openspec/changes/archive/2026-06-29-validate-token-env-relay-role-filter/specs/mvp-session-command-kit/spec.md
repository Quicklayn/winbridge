## ADDED Requirements

### Requirement: MVP command kit prints token-env guidance for filtered commands

The MVP command kit SHALL include bounded token-env guidance in text output for
`--only relay`, `--only host`, `--only viewer`, and `--only browser` when
`--token-env <NAME>` is provided. The guidance MUST reference only the
environment variable name, MUST state that the raw token value is not printed,
and MUST NOT print token values, credentials, pairing codes, local paths,
command output, child output, frame bytes, input contents, diagnostics, or raw
input. The helper MUST remain non-executing.

#### Scenario: Relay role-filter output includes token-env guidance

- **WHEN** a developer requests `mvp:commands -- --only relay --token-env <NAME>`
- **THEN** the helper prints the relay-only command output plus bounded token-env
  guidance
- **AND** the output does not include a raw token value

### Requirement: MVP ready validates token-env relay role-filter output

The default and relay-scoped MVP ready helpers SHALL validate relay role-filter
command output generated with `--token-env WINBRIDGE_RELAY_SHARED_TOKEN`. The
readiness check MUST require relay-only role-filter markers and the reviewed
`$env:WINBRIDGE_RELAY_SHARED_TOKEN` reference. It MUST fail closed when the
reference is missing, malformed, replaced with a raw token literal, or combined
with host, viewer, or browser runtime blocks. Failure output MUST remain
bounded and MUST NOT echo command output, child output, relay URLs, token
values, pairing codes, credentials, local paths, frame bytes, input contents,
diagnostics, or raw input.

#### Scenario: Default ready validates token-env relay role-filter

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the helper runs a non-executing
  `mvp:commands -- --only relay --token-env WINBRIDGE_RELAY_SHARED_TOKEN`
  validation step
- **AND** it reports only bounded status metadata

#### Scenario: Relay-scoped ready validates token-env relay role-filter

- **WHEN** a developer runs `npm run mvp:ready -- --role relay`
- **THEN** the helper validates both localhost relay role-filter output and
  token-env relay role-filter output
- **AND** it does not run host, viewer, browser, capture, or input checks
