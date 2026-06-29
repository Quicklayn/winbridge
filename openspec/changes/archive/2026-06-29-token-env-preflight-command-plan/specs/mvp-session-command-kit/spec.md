# mvp-session-command-kit Delta

## ADDED Requirements

### Requirement: Preflight command plans support token-env all-smoke readiness

The MVP command kit SHALL allow `--token-env <NAME>` with `--preflight-only`
and with `--only preflight --json`. When provided, the preflight-only text and
JSON command plans MUST render the `preflight.ready-all-smoke` instruction as an
environment-reference assignment from `$env:<NAME>` to
`$env:WINBRIDGE_RELAY_SHARED_TOKEN` followed by
`npm run mvp:ready -- --include-all-smoke`. The command kit MUST continue to
reject raw token values and MUST NOT print token values.

#### Scenario: Preflight-only text uses token environment reference

- **WHEN** a developer runs
  `npm run mvp:commands -- --preflight-only --token-env WINBRIDGE_TEST_RELAY_TOKEN`
- **THEN** the helper renders only the bounded preflight command set
- **AND** the all-smoke instruction references
  `$env:WINBRIDGE_TEST_RELAY_TOKEN`
- **AND** the helper does not render relay, host, viewer, browser, capture, or
  input commands

#### Scenario: Preflight JSON target uses token environment reference

- **WHEN** a developer runs
  `npm run mvp:commands -- --only preflight --json --token-env WINBRIDGE_TEST_RELAY_TOKEN`
- **THEN** the helper emits bounded JSON with `mode` set to `preflight`
- **AND** the command list includes `preflight.ready-all-smoke` with the
  reviewed token environment assignment
- **AND** the output remains non-executing

#### Scenario: Malformed token preflight options fail closed

- **WHEN** a developer combines preflight-only output with raw `--token`, a
  malformed token environment name, or session-specific options
- **THEN** the command kit rejects the input before rendering commands
- **AND** the usage output does not echo raw unsafe values

### Requirement: Ready validates token-env preflight JSON drift

The root MVP ready helper SHALL validate token-env preflight JSON output in the
default aggregate readiness plan. It SHALL run the non-executing command kit as
`mvp:commands -- --only preflight --json --token-env WINBRIDGE_RELAY_SHARED_TOKEN`
and MUST fail closed if the bounded JSON shape, fixed preflight command list, or
reviewed `preflight.ready-all-smoke` token environment assignment drifts.

#### Scenario: Default readiness validates token-env preflight JSON

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the helper validates the normal preflight JSON plan and the token-env
  preflight JSON plan
- **AND** it fails closed if the token-env preflight all-smoke command omits the
  reviewed `$env:WINBRIDGE_RELAY_SHARED_TOKEN` reference
