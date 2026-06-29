## ADDED Requirements

### Requirement: MVP ready validates token-env preflight role-filter output

The default MVP ready helper SHALL validate preflight role-filter text output
generated with `--token-env WINBRIDGE_RELAY_SHARED_TOKEN`. The readiness check
MUST run the non-executing command kit as
`mvp:commands -- --only preflight --token-env WINBRIDGE_RELAY_SHARED_TOKEN`,
require preflight-only role-filter markers, require bounded token-mode guidance
for `$env:WINBRIDGE_RELAY_SHARED_TOKEN`, and reject output that omits token
guidance, uses a wrong token environment name, includes raw token literals,
adds `--token` runtime arguments, or combines preflight output with relay,
host, viewer, browser, capture, input, service, startup, privilege, unattended,
or hidden-session command blocks. Failure output MUST remain bounded and MUST
NOT echo generated command strings, relay URLs, local URLs, token values, token
environment values, pairing codes, credentials, local paths, frame bytes, input
contents, stdout, stderr, child output, diagnostics, or full secrets.

#### Scenario: Default ready validates token-env preflight role-filter

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the helper runs a non-executing
  `mvp:commands -- --only preflight --token-env WINBRIDGE_RELAY_SHARED_TOKEN`
  validation step
- **AND** it reports only bounded fixed status metadata

#### Scenario: Preflight token role-filter drift fails closed

- **WHEN** the token-env preflight role-filter output omits token guidance, uses
  a wrong token environment name, includes a raw token literal, includes
  `--token`, or adds relay, host, viewer, browser, capture, input, service,
  startup, privilege, unattended, or hidden-session command blocks
- **THEN** the ready helper fails closed
- **AND** diagnostics do not echo generated command strings, relay URLs, local
  URLs, token values, token environment values, pairing codes, credentials,
  local paths, frame bytes, input contents, stdout, stderr, child output,
  diagnostics, or full secrets
