## ADDED Requirements

### Requirement: MVP ready help describes default non-executing validation

The root MVP ready helper's usage text SHALL accurately describe the default
readiness validation categories. The help text MUST state that default mode
runs doctor and native preflight checks plus non-executing command-plan
validation for the reviewed command-plan, role-filter, LAN, token-env, and
ephemeral browser outputs. The help text MUST also state that smoke remains
explicitly opt-in. The help path MUST NOT run relay, host, viewer, browser,
smoke, capture, input, services, startup persistence, privilege elevation, or
remote assistance actions, and MUST NOT expose command output, child output,
relay URLs, tokens, pairing codes, local paths, frame bytes, input contents, or
diagnostics.

#### Scenario: Help text matches default readiness categories

- **WHEN** a developer asks for `npm run mvp:ready -- --help`
- **THEN** the helper prints static usage text that names doctor, native
  preflight, command-plan, role-filter, LAN, token-env, and ephemeral browser
  validation
- **AND** it does not claim that default mode runs only doctor and native
  preflight checks
- **AND** it states that smoke is explicit
