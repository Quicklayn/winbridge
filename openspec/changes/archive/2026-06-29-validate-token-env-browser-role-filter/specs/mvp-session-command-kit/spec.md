## ADDED Requirements

### Requirement: MVP ready validates token-env browser role-filter output

The default and viewer-scoped MVP ready helpers SHALL validate browser
role-filter command output generated with
`--token-env WINBRIDGE_RELAY_SHARED_TOKEN`. The readiness check MUST run the
non-executing command kit as
`mvp:commands -- --only browser --token-env WINBRIDGE_RELAY_SHARED_TOKEN`,
require browser-only role-filter markers, require bounded token-mode guidance
for `$env:WINBRIDGE_RELAY_SHARED_TOKEN`, and reject output that is missing the
token guidance, replaces it with a raw token literal, adds `--token` runtime
arguments, or combines browser output with relay, host, viewer, or preflight
runtime blocks. Failure output MUST remain bounded and MUST NOT echo generated
command strings, local URLs, relay URLs, token values, token environment
values, pairing codes, credentials, local paths, frame bytes, input contents,
stdout, stderr, child output, diagnostics, or full secrets.

#### Scenario: Default ready validates token-env browser role-filter

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the helper runs a non-executing
  `mvp:commands -- --only browser --token-env WINBRIDGE_RELAY_SHARED_TOKEN`
  validation step
- **AND** it reports only bounded fixed status metadata

#### Scenario: Viewer-scoped ready validates token-env browser role-filter

- **WHEN** a developer runs `npm run mvp:ready -- --role viewer`
- **THEN** the helper validates viewer role-filter output, browser role-filter
  output, token-env viewer role-filter output, and token-env browser
  role-filter output
- **AND** it does not start a browser, relay, host, viewer, capture, or input
  process

#### Scenario: Browser token role-filter drift fails closed

- **WHEN** the token-env browser role-filter output omits token guidance, uses
  a wrong token environment name, includes a raw token literal, includes
  `--token`, or adds relay, host, viewer, or preflight runtime blocks
- **THEN** the ready helper fails closed
- **AND** diagnostics do not echo generated command strings, local URLs, relay
  URLs, token values, token environment values, pairing codes, credentials,
  local paths, frame bytes, input contents, stdout, stderr, child output,
  diagnostics, or full secrets
